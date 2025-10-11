import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import { notifyStudentRegistration } from '@/lib/admin-notification-utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// POST /api/events/register - Register for an event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    console.log('Event registration request:', {
      eventId: body.eventId,
      email: body.email,
      amountUSD: body.amountUSD,
      provider: body.provider
    })
    
    // Validation schema
    const registrationSchema = z.object({
      eventId: z.string().min(1, 'Event ID is required'),
      fullName: z.string().min(1, 'Full name is required'),
      email: z.string().email('Valid email is required'),
      phone: z.string().optional(),
      company: z.string().optional(),
      jobTitle: z.string().optional(),
      dietaryRequirements: z.string().optional(),
      specialRequests: z.string().optional(),
      emergencyContact: z.string().optional(),
      emergencyPhone: z.string().optional(),
      amountUSD: z.number().min(0),
      currency: z.string().default('USD'),
      provider: z.enum(['free', 'stripe']),
      providerRef: z.string().optional()
    })

    const validatedData = registrationSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Check if event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId }
    })
    
    console.log('Event found:', event ? { id: event.id, title: event.title, isPublished: event.isPublished } : 'Not found')

    if (!event) {
      return NextResponse.json({ 
        success: false, 
        message: 'Event not found' 
      }, { status: 404 })
    }

    if (!event.isPublished) {
      return NextResponse.json({ 
        success: false, 
        message: 'Event is not available for registration' 
      }, { status: 400 })
    }

    // Check if event has reached max attendees
    if (event.maxAttendees) {
      const currentRegistrations = await prisma.eventRegistration.count({
        where: { 
          eventId: validatedData.eventId,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      })

      if (currentRegistrations >= event.maxAttendees) {
        return NextResponse.json({ 
          success: false, 
          message: 'Event is fully booked' 
        }, { status: 400 })
      }
    }

    // Check if user already registered for this event
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId: validatedData.eventId,
        email: validatedData.email
      }
    })

    if (existingRegistration) {
      return NextResponse.json({ 
        success: false, 
        message: 'You have already registered for this event' 
      }, { status: 400 })
    }

    // Handle payment for paid events
    let paymentIntentId = null
    let paymentStatus = 'PENDING'

    if (validatedData.amountUSD > 0 && validatedData.provider === 'stripe') {
      try {
        // Create mock payment intent using the existing mock payment system
        const mockPaymentResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mock-payment/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: validatedData.amountUSD,
            currency: validatedData.currency,
            courseId: validatedData.eventId,
            courseTitle: event.title
          })
        })

        if (!mockPaymentResponse.ok) {
          throw new Error('Failed to create payment intent')
        }

        const mockPaymentData = await mockPaymentResponse.json()
        paymentIntentId = mockPaymentData.paymentIntentId
        paymentStatus = 'PENDING'
        
        console.log('Created mock payment intent for event:', {
          eventId: validatedData.eventId,
          paymentIntentId: paymentIntentId,
          amount: validatedData.amountUSD
        })
      } catch (paymentError) {
        console.error('Payment intent creation error:', paymentError)
        return NextResponse.json({ 
          success: false, 
          message: 'Payment processing failed. Please try again.' 
        }, { status: 500 })
      }
    } else if (validatedData.amountUSD === 0) {
      // Free event - auto-confirm
      paymentStatus = 'PAID'
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: validatedData.eventId,
        userId: session?.user ? (session.user as any).id : null,
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company,
        jobTitle: validatedData.jobTitle,
        dietaryRequirements: validatedData.dietaryRequirements,
        specialRequests: validatedData.specialRequests,
        emergencyContact: validatedData.emergencyContact,
        emergencyPhone: validatedData.emergencyPhone,
        amountUSD: validatedData.amountUSD,
        currency: validatedData.currency,
        status: validatedData.amountUSD === 0 ? 'CONFIRMED' : 'PENDING',
        paymentStatus: paymentStatus,
        stripePaymentIntentId: paymentIntentId
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
        }
      }
    })

    // Create admin notification (skip if no system user exists)
    try {
      const systemUser = await prisma.user.findFirst({
        where: { role: 'SUPERADMIN' }
      })
      
      if (systemUser) {
        await prisma.newNotification.create({
          data: {
            userId: systemUser.id,
            title: 'New Event Registration',
            message: `${validatedData.fullName} registered for "${event.title}"`,
            type: 'event_registration',
            isRead: false
          }
        })
      }
    } catch (error) {
      console.log('Skipping system notification creation:', error instanceof Error ? error.message : 'Unknown error')
    }

    // Create admin notification for student registration
    await notifyStudentRegistration(
      validatedData.fullName,
      validatedData.email,
      'event',
      event.title,
      `/admin/events/${event.id}`
    )

    // Log the action (skip if no valid actor)
    try {
      const actorId = session?.user ? (session.user as any).id : null
      if (actorId) {
        await prisma.auditLog.create({
          data: {
            actorId: actorId,
            action: 'REGISTER_EVENT',
            entity: 'EventRegistration',
            entityId: registration.id,
            diff: {
              eventTitle: event.title,
              registrantName: validatedData.fullName,
              registrantEmail: validatedData.email,
              amount: validatedData.amountUSD
            }
          }
        })
      }
    } catch (error) {
      console.log('Skipping audit log creation:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json({
      success: true,
      registration,
      message: validatedData.amountUSD === 0 
        ? 'Registration successful! You will receive a confirmation email shortly.'
        : 'Registration created. Please complete payment to confirm your spot.',
      paymentIntentId: paymentIntentId
    })

  } catch (error) {
    console.error('Event registration error:', error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json({ 
        success: false,
        message: `Validation error: ${errorMessages}` 
      }, { status: 400 })
    }
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          success: false,
          message: 'You have already registered for this event' 
        }, { status: 400 })
      }
      
      if (error.message.includes('Stripe')) {
        return NextResponse.json({ 
          success: false,
          message: 'Payment processing failed. Please try again.' 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: false,
        message: `Registration failed: ${error.message}` 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: false,
      message: 'Registration failed. Please try again.' 
    }, { status: 500 })
  }
}

// GET /api/events/register - Get user's event registrations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    const where: any = {
      userId: (session.user as any).id
    }

    if (eventId) {
      where.eventId = eventId
    }

    const registrations = await prisma.eventRegistration.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            type: true,
            startDate: true,
            endDate: true,
            location: true,
            price: true,
            currency: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ registrations })

  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
