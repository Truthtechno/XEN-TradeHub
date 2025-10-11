import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthenticatedUserSimple } from '@/lib/auth-utils'

const prisma = new PrismaClient()

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// DELETE /api/admin/new-notifications/[id] - Delete a NEW notification (banner)
export async function DELETE(
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

    const { id } = params

    // Check if the notification exists
    const notification = await prisma.newNotification.findUnique({
      where: { id }
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Delete the notification
    await prisma.newNotification.delete({
      where: { id }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'DELETE_NEW_NOTIFICATION',
        entity: 'NewNotification',
        entityId: id,
        diff: {
          title: notification.title,
          pagePath: notification.pagePath
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete NEW notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete NEW notification' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/new-notifications/[id] - Update a NEW notification (banner)
export async function PUT(
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

    const { id } = params
    const body = await request.json()
    
    // Check if the notification exists
    const existingNotification = await prisma.newNotification.findUnique({
      where: { id }
    })

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Update the notification
    const updatedNotification = await prisma.newNotification.update({
      where: { id },
      data: {
        pagePath: body.pagePath,
        title: body.title,
        message: body.message,
        description: body.description,
        isActive: body.isActive,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        color: body.color
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
        action: 'UPDATE_NEW_NOTIFICATION',
        entity: 'NewNotification',
        entityId: id,
        diff: {
          title: body.title,
          pagePath: body.pagePath,
          isActive: body.isActive
        }
      }
    })

    return NextResponse.json({
      success: true,
      notification: updatedNotification
    })
  } catch (error) {
    console.error('Failed to update NEW notification:', error)
    return NextResponse.json(
      { error: 'Failed to update NEW notification' },
      { status: 500 }
    )
  }
}
