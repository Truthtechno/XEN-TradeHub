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
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'ANALYST', 'SUPPORT']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
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

    const validatedData = notificationSchema.parse(body)

    // Create the notification
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

    // Log the action
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

    return NextResponse.json({
      success: true,
      notification
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Failed to create NEW notification:', error)
    return NextResponse.json(
      { error: 'Failed to create NEW notification' },
      { status: 500 }
    )
  }
}
