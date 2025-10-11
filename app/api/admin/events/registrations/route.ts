import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/events/registrations - Get all event registrations
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (eventId) {
      where.eventId = eventId
    }
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { event: { title: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        skip,
        take: limit,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              type: true,
              startDate: true,
              location: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.eventRegistration.count({ where })
    ])

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching event registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/events/registrations - Update registration status
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const updateSchema = z.object({
      registrationId: z.string().min(1),
      status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
      paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional()
    })

    const validatedData = updateSchema.parse(body)

    // Get current registration
    const currentRegistration = await prisma.eventRegistration.findUnique({
      where: { id: validatedData.registrationId },
      include: {
        event: {
          select: {
            title: true
          }
        }
      }
    })

    if (!currentRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Update registration
    const updatedRegistration = await prisma.eventRegistration.update({
      where: { id: validatedData.registrationId },
      data: {
        status: validatedData.status,
        ...(validatedData.paymentStatus && { paymentStatus: validatedData.paymentStatus })
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            type: true,
            startDate: true,
            location: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'UPDATE_EVENT_REGISTRATION',
        entity: 'EventRegistration',
        entityId: validatedData.registrationId,
        diff: {
          before: {
            status: currentRegistration.status,
            paymentStatus: currentRegistration.paymentStatus
          },
          after: {
            status: updatedRegistration.status,
            paymentStatus: updatedRegistration.paymentStatus
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: 'Registration status updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json({ 
        error: `Validation error: ${errorMessages}` 
      }, { status: 400 })
    }
    
    console.error('Error updating registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/events/registrations - Delete a registration
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('registrationId')

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 })
    }

    // Get registration before deleting
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: {
            title: true
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Delete registration
    await prisma.eventRegistration.delete({
      where: { id: registrationId }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'DELETE_EVENT_REGISTRATION',
        entity: 'EventRegistration',
        entityId: registrationId,
        diff: {
          registrantName: registration.fullName,
          eventTitle: registration.event.title
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
