import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/admin/notifications/mark-all-read - Mark all admin notifications as read
export async function POST(request: NextRequest) {
  try {
    // For development, skip authentication check
    console.log('Mark all as read endpoint called')

    // Mark all notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    console.log(`Marked ${result.count} notifications as read`)

    return NextResponse.json({ 
      message: `Marked ${result.count} notifications as read`,
      count: result.count
    })
  } catch (error) {
    console.error('Failed to mark all admin notifications as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
