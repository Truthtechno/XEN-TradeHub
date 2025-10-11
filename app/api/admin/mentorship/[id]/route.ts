import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { accessControl } from '@/lib/access-control'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/mentorship/[id] - Get specific mentorship registration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    const registration = await prisma.mentorshipRegistration.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        },
        appointments: {
          orderBy: { scheduledAt: 'asc' }
        }
      }
    })

    if (!registration) {
      return NextResponse.json({
        success: false,
        message: 'Mentorship registration not found'
      }, { status: 404 })
    }

    // Get payments for this registration
    const payments = await prisma.mentorshipPayment.findMany({
      where: { registrationId: params.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        registration,
        payments
      }
    })

  } catch (error) {
    console.error('Error fetching mentorship registration:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch mentorship registration' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/mentorship/[id] - Update mentorship registration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { status, name, email, phone, country, experience, goals, upgradeToPremium } = body

    // Get current registration
    const currentRegistration = await prisma.mentorshipRegistration.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!currentRegistration) {
      return NextResponse.json({
        success: false,
        message: 'Mentorship registration not found'
      }, { status: 404 })
    }

    // Update registration
    const updatedRegistration = await prisma.mentorshipRegistration.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(country && { country }),
        ...(experience !== undefined && { experience }),
        ...(goals !== undefined && { goals })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        },
        appointments: {
          orderBy: { scheduledAt: 'asc' }
        }
      }
    })

    // Handle premium upgrade if requested or if status changed to PAID
    if ((upgradeToPremium || status === 'PAID') && currentRegistration.user.role !== 'PREMIUM') {
      console.log(`Admin ${user.email} upgrading user ${currentRegistration.user.email} to PREMIUM`)
      
      const upgradeResult = await accessControl.upgradeToPremium(
        currentRegistration.userId,
        1500
      )

      if (!upgradeResult.success) {
        console.error('Failed to upgrade user to premium:', upgradeResult.message)
      } else {
        console.log(`User ${currentRegistration.user.email} successfully upgraded to PREMIUM`)
      }
    }

    // Handle downgrade if status changed from PAID to PENDING
    if (currentRegistration.status === 'PAID' && status === 'PENDING' && currentRegistration.user.role === 'PREMIUM') {
      console.log(`Admin ${user.email} downgrading user ${currentRegistration.user.email} to STUDENT`)
      
      // Downgrade user to STUDENT
      await prisma.user.update({
        where: { id: currentRegistration.userId },
        data: { role: 'STUDENT' }
      })

      // Remove premium subscriptions
      await prisma.subscription.deleteMany({
        where: {
          userId: currentRegistration.userId,
          plan: 'PREMIUM'
        }
      })

      // Update payment status to cancelled
      await prisma.mentorshipPayment.updateMany({
        where: {
          registrationId: params.id,
          status: 'completed'
        },
        data: {
          status: 'cancelled'
        }
      })

      console.log(`User ${currentRegistration.user.email} successfully downgraded to STUDENT`)
    }

    return NextResponse.json({
      success: true,
      message: 'Mentorship registration updated successfully',
      data: updatedRegistration
    })

  } catch (error) {
    console.error('Error updating mentorship registration:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update mentorship registration' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/mentorship/[id] - Delete mentorship registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    // Get registration with user details
    const registration = await prisma.mentorshipRegistration.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json({
        success: false,
        message: 'Mentorship registration not found'
      }, { status: 404 })
    }

    console.log(`Admin ${user.email} deleting mentorship registration for user ${registration.user.email}`)
    console.log(`User current role: ${registration.user.role}`)

    // Check if user has PREMIUM status and if it's due to mentorship payment
    const hasPaidMentorship = registration.status === 'PAID'
    const isPremiumUser = registration.user.role === 'PREMIUM'

    if (hasPaidMentorship && isPremiumUser) {
      console.log('Downgrading user from PREMIUM to STUDENT due to mentorship deletion')
      
      // Downgrade user to STUDENT
      await prisma.user.update({
        where: { id: registration.userId },
        data: { role: 'STUDENT' }
      })

      // Remove any premium subscriptions related to mentorship
      await prisma.subscription.deleteMany({
        where: {
          userId: registration.userId,
          plan: { in: ['SIGNALS', 'PREMIUM'] }
        }
      })

      console.log(`User ${registration.user.email} downgraded to STUDENT role`)
    }

    // Delete all payments for this registration first
    await prisma.mentorshipPayment.deleteMany({
      where: { registrationId: params.id }
    })

    // Delete all appointments for this registration
    await prisma.mentorshipAppointment.deleteMany({
      where: { registrationId: params.id }
    })

    // Finally delete the registration
    await prisma.mentorshipRegistration.delete({
      where: { id: params.id }
    })

    console.log(`Mentorship registration ${params.id} deleted successfully`)

    return NextResponse.json({
      success: true,
      message: 'Mentorship registration deleted successfully. User premium access has been revoked if applicable.'
    })

  } catch (error) {
    console.error('Error deleting mentorship registration:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete mentorship registration' },
      { status: 500 }
    )
  }
}
