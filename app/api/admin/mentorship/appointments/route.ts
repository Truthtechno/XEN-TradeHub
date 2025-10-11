import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/mentorship/appointments - Get all appointments
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (dateFrom || dateTo) {
      where.scheduledAt = {}
      if (dateFrom) {
        where.scheduledAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.scheduledAt.lte = new Date(dateTo)
      }
    }

    // Get appointments with pagination
    const [appointments, total] = await Promise.all([
      prisma.mentorshipAppointment.findMany({
        where,
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
        },
        orderBy: { scheduledAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.mentorshipAppointment.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

// POST /api/admin/mentorship/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { registrationId, title, description, scheduledAt, duration, meetingLink, notes } = body

    // Validate required fields
    if (!registrationId || !title || !scheduledAt) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: registrationId, title, scheduledAt'
      }, { status: 400 })
    }

    // Check if registration exists
    const registration = await prisma.mentorshipRegistration.findUnique({
      where: { id: registrationId }
    })

    if (!registration) {
      return NextResponse.json({
        success: false,
        message: 'Mentorship registration not found'
      }, { status: 404 })
    }

    // Create appointment
    const appointment = await prisma.mentorshipAppointment.create({
      data: {
        registrationId,
        title,
        description: description || '',
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        meetingLink: meetingLink || '',
        notes: notes || '',
        status: 'SCHEDULED'
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
      message: 'Appointment created successfully',
      data: appointment
    })

  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
