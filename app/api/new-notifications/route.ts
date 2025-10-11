import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/new-notifications - Get NEW notifications for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Get all active NEW notifications that the user hasn't viewed
    const notifications = await prisma.newNotification.findMany({
      where: {
        isRead: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching NEW notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/new-notifications - Mark a NEW notification as viewed
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()
    
    const markViewedSchema = z.object({
      pagePath: z.string().min(1)
    })

    const { pagePath } = markViewedSchema.parse(body)

    // Find the notification for this page path
    const notification = await prisma.newNotification.findFirst({
      where: {
        isRead: false
      }
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Mark notification as read
    await prisma.newNotification.update({
      where: { id: notification.id },
      data: { isRead: true }
    })

    return NextResponse.json({ message: 'Marked as viewed' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error marking notification as viewed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
