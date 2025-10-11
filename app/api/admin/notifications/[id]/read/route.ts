import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// PATCH /api/admin/notifications/[id]/read - Mark a specific admin notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'ANALYST', 'SUPPORT']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const notificationId = params.id

    // Mark the specific notification as read
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId
      },
      data: {
        isRead: true
      }
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    console.log(`Marked notification ${notificationId} as read for user ${user.id}`)

    return NextResponse.json({ 
      message: 'Notification marked as read',
      notificationId
    })
  } catch (error) {
    console.error('Failed to mark admin notification as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
