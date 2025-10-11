import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import { z } from 'zod'

const prisma = new PrismaClient()

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/activity-notifications - Get admin activity notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'ANALYST', 'SUPPORT']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause for admin activity notifications
    const where: any = {
      // Show all notifications for admin (including existing UPDATE types and EMAIL notifications)
      type: { in: ['STUDENT_PURCHASE', 'STUDENT_ENROLLMENT', 'STUDENT_REGISTRATION', 'STUDENT_ENQUIRY', 'STUDENT_ACTIVITY', 'USER_LOGIN', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_UPDATED', 'SUBSCRIPTION_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'UPDATE', 'EMAIL'] }
    }
    
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

    // Get statistics for all notifications
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
        total: typeStats.reduce((acc, stat) => acc + stat._count.id, 0),
        unread: stats.filter(stat => !stat.isRead).reduce((acc, stat) => acc + stat._count.id, 0),
        read: stats.filter(stat => stat.isRead).reduce((acc, stat) => acc + stat._count.id, 0),
        byType: typeStats.map(stat => ({
          type: stat.type,
          count: stat._count.id
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching admin activity notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/activity-notifications - Create admin activity notification
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'ANALYST', 'SUPPORT']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const notificationSchema = z.object({
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['STUDENT_PURCHASE', 'STUDENT_ENROLLMENT', 'STUDENT_REGISTRATION', 'STUDENT_ENQUIRY', 'STUDENT_ACTIVITY']),
      actionUrl: z.string().optional(),
      studentId: z.string().optional(),
      studentName: z.string().optional(),
      studentEmail: z.string().optional()
    })

    const validatedData = notificationSchema.parse(body)

    // Get all admin users to send notification to
    const admins = await prisma.user.findMany({
      where: { 
        role: { in: ['SUPERADMIN', 'ADMIN', 'EDITOR', 'ANALYST', 'SUPPORT'] }
      },
      select: { id: true }
    })

    if (admins.length === 0) {
      return NextResponse.json({ error: 'No admin users found' }, { status: 400 })
    }

    // Create notifications for all admins
    const notifications = await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        actionUrl: validatedData.actionUrl,
        isRead: false
      }))
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_ADMIN_ACTIVITY_NOTIFICATION',
        entity: 'Notification',
        entityId: 'bulk',
        diff: {
          type: validatedData.type,
          title: validatedData.title,
          count: notifications.count
        }
      }
    })

    return NextResponse.json({
      success: true,
      count: notifications.count
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Failed to create admin activity notification:', error)
    return NextResponse.json(
      { error: 'Failed to create admin activity notification' },
      { status: 500 }
    )
  }
}
