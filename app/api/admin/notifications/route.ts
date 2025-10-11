import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/admin/notifications - Get all notifications for admin management
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const adminOnly = searchParams.get('adminOnly') === 'true'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (type !== 'all') {
      where.type = type
    }
    
    if (status === 'read') {
      where.isRead = true
    } else if (status === 'unread') {
      where.isRead = false
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filter for admin-only notifications if requested
    if (adminOnly) {
      // Only show notifications for admin users or system notifications
      where.user = {
        role: { in: ['SUPERADMIN', 'ADMIN', 'EDITOR', 'ANALYST', 'SUPPORT'] }
      }
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ])

    // Get statistics
    const stats = await prisma.notification.groupBy({
      by: ['type', 'isRead'],
      _count: {
        id: true
      }
    })

    const typeStats = await prisma.notification.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: stats.reduce((acc, stat) => acc + stat._count.id, 0),
        unread: stats.filter(stat => !stat.isRead).reduce((acc, stat) => acc + stat._count.id, 0),
        read: stats.filter(stat => stat.isRead).reduce((acc, stat) => acc + stat._count.id, 0),
        byType: typeStats
      }
    })
  } catch (error) {
    console.error('Failed to fetch admin notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/admin/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const notificationSchema = z.object({
      userId: z.string().optional(),
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['LOGIN', 'WELCOME', 'SYSTEM', 'UPDATE', 'SECURITY', 'PROMOTION']),
      actionUrl: z.string().optional(),
      sendToAll: z.boolean().optional().default(false)
    })

    const validatedData = notificationSchema.parse(body)

    if (validatedData.sendToAll) {
      // Send to all users
      const users = await prisma.user.findMany({
        select: { id: true }
      })

      const notifications = await Promise.all(
        users.map(user => 
          prisma.notification.create({
            data: {
              userId: user.id,
              title: validatedData.title,
              message: validatedData.message,
              type: validatedData.type,
              isRead: false
            }
          })
        )
      )

      // Log the action
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'CREATE_BULK_NOTIFICATION',
          entity: 'Notification',
          entityId: 'bulk',
          diff: {
            title: validatedData.title,
            type: validatedData.type,
            count: notifications.length
          }
        }
      })

      return NextResponse.json({ 
        message: `Notification sent to ${notifications.length} users`,
        count: notifications.length
      }, { status: 201 })
    } else {
      // Send to specific user
      if (!validatedData.userId) {
        return NextResponse.json({ error: 'User ID required when not sending to all' }, { status: 400 })
      }

      const notification = await prisma.notification.create({
        data: {
          userId: validatedData.userId,
          title: validatedData.title,
          message: validatedData.message,
          type: validatedData.type,
          isRead: false
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'CREATE_NOTIFICATION',
          entity: 'Notification',
          entityId: notification.id,
          diff: {
            userId: notification.userId,
            title: notification.title,
            type: notification.type
          }
        }
      })

      return NextResponse.json({ notification }, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Failed to create notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/notifications - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = user.role
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const notificationIds = searchParams.get('ids')?.split(',') || []
    const deleteAll = searchParams.get('deleteAll') === 'true'

    if (deleteAll) {
      const result = await prisma.notification.deleteMany({})
      
      // Log the action
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'DELETE_ALL_NOTIFICATIONS',
          entity: 'Notification',
          entityId: 'all',
          diff: {
            count: result.count
          }
        }
      })

      return NextResponse.json({ 
        message: `Deleted ${result.count} notifications`,
        count: result.count
      })
    } else if (notificationIds.length > 0) {
      const result = await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds }
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'DELETE_NOTIFICATIONS',
          entity: 'Notification',
          entityId: 'multiple',
          diff: {
            ids: notificationIds,
            count: result.count
          }
        }
      })

      return NextResponse.json({ 
        message: `Deleted ${result.count} notifications`,
        count: result.count
      })
    } else {
      return NextResponse.json({ error: 'No notifications to delete' }, { status: 400 })
    }
  } catch (error) {
    console.error('Failed to delete notifications:', error)
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    )
  }
}
