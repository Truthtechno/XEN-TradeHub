import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/notifications - Get all notifications for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build where clause for filtering
    const whereClause: any = {
      userId: userId
    }

    // Role-based notification filtering
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'ANALYST', 'SUPPORT']
    const isAdmin = adminRoles.includes(user.role)
    
    if (isAdmin) {
      // Admins see admin-specific notifications (student activities)
      whereClause.type = {
        in: ['STUDENT_PURCHASE', 'STUDENT_ENROLLMENT', 'STUDENT_REGISTRATION', 'STUDENT_ENQUIRY', 'STUDENT_ACTIVITY']
      }
    } else {
      // Students see student-specific notifications (courses, resources, events, signals, etc.)
      whereClause.type = {
        in: ['LOGIN', 'WELCOME', 'SYSTEM', 'UPDATE', 'SECURITY', 'PROMOTION', 'SIGNAL', 'COURSE', 'BOOKING', 'PAYMENT']
      }
    }

    if (type !== 'all') {
      whereClause.type = type
    }

    if (status === 'unread') {
      whereClause.isRead = false
    } else if (status === 'read') {
      whereClause.isRead = true
    }

    // Get user notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: whereClause })
    ])

    // Get unread count with role-based filtering
    const unreadWhereClause: any = {
      userId: userId,
      isRead: false
    }
    
    if (isAdmin) {
      unreadWhereClause.type = {
        in: ['STUDENT_PURCHASE', 'STUDENT_ENROLLMENT', 'STUDENT_REGISTRATION', 'STUDENT_ENQUIRY', 'STUDENT_ACTIVITY']
      }
    } else {
      unreadWhereClause.type = {
        in: ['LOGIN', 'WELCOME', 'SYSTEM', 'UPDATE', 'SECURITY', 'PROMOTION', 'SIGNAL', 'COURSE', 'BOOKING', 'PAYMENT']
      }
    }
    
    const unreadCount = await prisma.notification.count({
      where: unreadWhereClause
    })

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()
    
    const markReadSchema = z.object({
      notificationIds: z.array(z.string()).optional(),
      markAll: z.boolean().optional().default(false)
    })

    const { notificationIds, markAll } = markReadSchema.parse(body)

    if (markAll) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: userId
        },
        data: {
          isRead: true
        }
      })
    }

    return NextResponse.json({ message: 'Notifications marked as read' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error marking notifications as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/notifications - Create a new notification
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const notificationSchema = z.object({
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['LOGIN', 'WELCOME', 'SYSTEM', 'UPDATE', 'SECURITY', 'PROMOTION']),
      actionUrl: z.string().optional()
    })

    const validatedData = notificationSchema.parse(body)

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        isRead: false
      }
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
