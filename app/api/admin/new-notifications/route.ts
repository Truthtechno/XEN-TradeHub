import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUserSimple } from '@/lib/auth-utils'
import { z } from 'zod'

const prisma = new PrismaClient()

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/new-notifications - Get NEW notifications (banners)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
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

    // Build where clause
    const where: any = {}
    
    if (type !== 'all') {
      where.type = type
    }
    
    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { pagePath: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [notifications, total] = await Promise.all([
      prisma.newNotification.findMany({
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
      prisma.newNotification.count({ where })
    ])

    // Get statistics
    const stats = await prisma.newNotification.groupBy({
      by: ['type', 'isActive'],
      _count: {
        id: true
      }
    })

    const typeStats = await prisma.newNotification.groupBy({
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
        active: stats.filter(stat => stat.isActive).reduce((acc, stat) => acc + stat._count.id, 0),
        inactive: stats.filter(stat => !stat.isActive).reduce((acc, stat) => acc + stat._count.id, 0),
        byType: typeStats.map(stat => ({
          type: stat.type,
          count: stat._count.id
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching NEW notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/new-notifications - Create NEW notification (banner)
export async function POST(request: NextRequest) {
  try {
    console.log('[NEW Notification] POST request received')
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('[NEW Notification] Unauthorized - no user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[NEW Notification] User authenticated:', user.email, user.role)

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'ANALYST', 'SUPPORT']
    
    if (!adminRoles.includes(user.role)) {
      console.log('[NEW Notification] Forbidden - user role:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    console.log('[NEW Notification] Request body:', JSON.stringify(body, null, 2))
    
    const notificationSchema = z.object({
      pagePath: z.string().min(1),
      title: z.string().min(1),
      message: z.string().min(1),
      description: z.string().optional(),
      type: z.string().default('banner'),
      isActive: z.boolean().default(true),
      expiresAt: z.string().optional(),
      color: z.string().default('blue')
    })

    console.log('[NEW Notification] Validating data...')
    const validatedData = notificationSchema.parse(body)
    console.log('[NEW Notification] Validation successful:', JSON.stringify(validatedData, null, 2))

    // Create the notification
    console.log('[NEW Notification] Creating notification in database...')
    const notification = await prisma.newNotification.create({
      data: {
        userId: user.id,
        pagePath: validatedData.pagePath,
        title: validatedData.title,
        message: validatedData.message,
        description: validatedData.description,
        type: validatedData.type,
        isActive: validatedData.isActive,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        color: validatedData.color
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
    console.log('[NEW Notification] Notification created successfully:', notification.id)

    // Log the action
    console.log('[NEW Notification] Creating audit log...')
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_NEW_NOTIFICATION',
        entity: 'NewNotification',
        entityId: notification.id,
        diff: {
          type: validatedData.type,
          title: validatedData.title,
          pagePath: validatedData.pagePath
        }
      }
    })
    console.log('[NEW Notification] Audit log created')

    console.log('[NEW Notification] Returning success response')
    return NextResponse.json({
      success: true,
      notification
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[NEW Notification] Validation error:', error.errors)
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('[NEW Notification] Failed to create:', error)
    console.error('[NEW Notification] Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('[NEW Notification] Stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to create NEW notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
