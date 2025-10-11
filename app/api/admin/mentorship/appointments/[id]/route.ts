import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/mentorship/appointments/[id] - Get specific appointment
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

    const appointment = await prisma.mentorshipAppointment.findUnique({
      where: { id: params.id },
      include: {
        registration: {
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
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: appointment
    })

  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/mentorship/appointments/[id] - Update appointment
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
    const { title, description, scheduledAt, duration, status, meetingLink, notes } = body

    // Check if appointment exists
    const existingAppointment = await prisma.mentorshipAppointment.findUnique({
      where: { id: params.id }
    })

    if (!existingAppointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found'
      }, { status: 404 })
    }

    // Update appointment
    const updatedAppointment = await prisma.mentorshipAppointment.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(duration && { duration }),
        ...(status && { status }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(notes !== undefined && { notes })
      },
      include: {
        registration: {
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    })

  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/mentorship/appointments/[id] - Delete appointment
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

    // Check if appointment exists
    const appointment = await prisma.mentorshipAppointment.findUnique({
      where: { id: params.id }
    })

    if (!appointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found'
      }, { status: 404 })
    }

    // Delete appointment
    await prisma.mentorshipAppointment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}
