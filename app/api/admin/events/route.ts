import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







// GET /api/admin/events - Get all events with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const pricing = searchParams.get('pricing') || 'all'
    const sortBy = searchParams.get('sortBy') || 'startDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (type !== 'all') {
      where.type = type
    }
    
    if (pricing !== 'all') {
      if (pricing === 'free') {
        where.price = 0
      } else if (pricing === 'paid') {
        where.price = { gt: 0 }
      }
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.event.count({ where })
    ])

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const eventSchema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(['WORKSHOP', 'WEBINAR', 'SEMINAR', 'CONFERENCE']),
      price: z.number().min(0).optional(),
      currency: z.string().default('USD'),
      startDate: z.string().datetime(),
      endDate: z.string().datetime().optional(),
      location: z.string().optional(),
      maxAttendees: z.number().min(1).optional(),
      isPublished: z.boolean().default(false)
    })

    const validatedData = eventSchema.parse(body)

    // Create event
    const event = await prisma.event.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_EVENT',
        entity: 'Event',
        entityId: event.id,
        diff: {
          title: event.title,
          type: event.type,
          price: event.price,
          isPublished: event.isPublished
        }
      }
    })

    // Create NEW notification for the events page
    await prisma.newNotification.create({
      data: {
        userId: 'system', // System notification
        title: 'New Event Available!',
        message: `Check out the new ${event.type.toLowerCase()}: "${event.title}"`,
        type: 'event',
        isRead: false
      }
    })

    // Create user notifications for all students about the new event
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true }
    })

    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map(student => ({
          userId: student.id,
          title: 'New Event Available!',
          message: `A new ${event.type.toLowerCase()} "${event.title}" has been added.`,
          type: 'EVENT',
          isRead: false
        }))
      })
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/events - Update an event
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const eventSchema = z.object({
      id: z.string(),
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      type: z.enum(['WORKSHOP', 'WEBINAR', 'SEMINAR', 'CONFERENCE'], {
        errorMap: () => ({ message: 'Please select a valid event type' })
      }),
      price: z.number().min(0).optional(),
      currency: z.string().default('USD'),
      startDate: z.string().datetime('Invalid start date format'),
      endDate: z.string().datetime('Invalid end date format').optional(),
      location: z.string().optional(),
      maxAttendees: z.number().min(1).optional(),
      isPublished: z.boolean().default(false)
    })

    const validatedData = eventSchema.parse(body)

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: validatedData.id }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Update event (exclude id from data object)
    const { id, ...updateData } = validatedData
    const event = await prisma.event.update({
      where: { id: id },
      data: {
        ...updateData,
        startDate: new Date(updateData.startDate),
        endDate: updateData.endDate ? new Date(updateData.endDate) : null
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'UPDATE_EVENT',
        entity: 'Event',
        entityId: event.id,
        diff: {
          title: event.title,
          type: event.type,
          price: event.price,
          isPublished: event.isPublished
        }
      }
    })

    // Send notifications if event is being published for the first time
    if (event.isPublished && !existingEvent.isPublished) {
      // Create NEW notification for the events page
      await prisma.newNotification.create({
        data: {
          userId: 'system', // System notification
          title: 'New Event Available!',
          message: `Check out the new ${event.type.toLowerCase()}: "${event.title}"`,
          type: 'event',
          isRead: false
        }
      })

      // Create user notifications for all students about the new event
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true }
      })

      if (students.length > 0) {
        await prisma.notification.createMany({
          data: students.map(student => ({
            userId: student.id,
            title: 'New Event Available!',
            message: `A new ${event.type.toLowerCase()} "${event.title}" has been published.`,
            type: 'EVENT',
            isRead: false
          }))
        })
      }
    }

    return NextResponse.json(event)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json({ 
        error: 'Validation error', 
        message: errorMessages,
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Error updating event:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
}

// DELETE /api/admin/events - Delete an event
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Delete event
    await prisma.event.delete({
      where: { id: eventId }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'DELETE_EVENT',
        entity: 'Event',
        entityId: eventId,
        diff: {
          title: existingEvent.title,
          type: existingEvent.type
        }
      }
    })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
