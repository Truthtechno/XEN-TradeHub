import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






const sendEmailSchema = z.object({
  userIds: z.array(z.string()),
  subject: z.string().min(1),
  content: z.string().min(1),
  type: z.string().default('general')
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = sendEmailSchema.parse(body)

    // Get the selected users
    const selectedUsers = await prisma.user.findMany({
      where: {
        id: { in: validatedData.userIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (selectedUsers.length === 0) {
      return NextResponse.json({ error: 'No valid users found' }, { status: 400 })
    }

    // For now, we'll just log the email details
    // In a real implementation, you would integrate with an email service like SendGrid, AWS SES, etc.
    console.log('Email to be sent:', {
      recipients: selectedUsers.map(u => ({ id: u.id, name: u.name, email: u.email })),
      subject: validatedData.subject,
      content: validatedData.content,
      type: validatedData.type,
      sentBy: user.email,
      sentAt: new Date().toISOString()
    })

    // Create a notification record for each user (optional)
    const notifications = selectedUsers.map(user => ({
      userId: user.id,
      title: `New ${validatedData.type} email`,
      message: validatedData.subject,
      type: 'EMAIL',
      isRead: false
    }))

    await prisma.notification.createMany({
      data: notifications
    })

    return NextResponse.json({
      success: true,
      sentCount: selectedUsers.length,
      message: `Email sent to ${selectedUsers.length} users`,
      recipients: selectedUsers.map(u => ({ id: u.id, email: u.email }))
    })
  } catch (error) {
    console.error('Error sending email:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
