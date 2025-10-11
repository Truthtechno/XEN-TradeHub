import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'





import { z } from 'zod'



// POST /api/broker/register - Create a pending broker registration
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const registrationSchema = z.object({
      broker: z.string().min(1),
      accountType: z.enum(['new', 'existing']),
      timestamp: z.string().optional()
    })

    const validatedData = registrationSchema.parse(body)

    // Get the default broker link
    const defaultLink = await prisma.brokerLink.findFirst({
      where: { isActive: true }
    })

    if (!defaultLink) {
      return NextResponse.json({ error: 'No default broker link found' }, { status: 404 })
    }

    // Check if user already has a registration for this broker
    const existingRegistration = await prisma.brokerRegistration.findFirst({
      where: {
        userId: user.id,
        linkId: defaultLink.id
      }
    })

    if (existingRegistration) {
      return NextResponse.json({ 
        error: 'User already has a registration for this broker',
        registration: existingRegistration
      }, { status: 400 })
    }

    // Create pending registration
    const registration = await prisma.brokerRegistration.create({
      data: {
        userId: user.id,
        linkId: defaultLink.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        link: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Note: BrokerLink model doesn't have clicks field, so we skip updating click count

    return NextResponse.json({
      success: true,
      registration,
      message: 'Pending registration created successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating broker registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
