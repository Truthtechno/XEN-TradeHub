import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// Force dynamic rendering
export const dynamic = 'force-dynamic'





import { z } from 'zod'



// POST /api/broker/verify - Update broker registration to verified
export async function POST(request: NextRequest) {
  try {
    console.log('Broker verify API called')
    
    // Get or create anonymous user (like enquiry system)
    const anonymousUser = await prisma.user.upsert({
      where: { email: 'anonymous@corefx.com' },
      update: {},
      create: {
        email: 'anonymous@corefx.com',
        name: 'Anonymous User',
        role: 'STUDENT'
      }
    })

    console.log('Using anonymous user:', { id: anonymousUser.id, email: anonymousUser.email })

    const body = await request.json()
    console.log('Request body:', body)
    
    const verificationSchema = z.object({
      broker: z.string().min(1),
      accountType: z.enum(['new', 'existing']),
      verificationData: z.object({
        email: z.string().email(),
        fullName: z.string().min(1),
        phoneNumber: z.string().optional(),
        exnessAccountId: z.string().optional()
      })
    })

    const validatedData = verificationSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Get the default EXNESS link
    const defaultLink = await prisma.brokerLink.findFirst({
      where: { name: { contains: 'EXNESS' } }
    })

    if (!defaultLink) {
      return NextResponse.json(
        { error: 'No EXNESS broker link found' },
        { status: 500 }
      )
    }

    // Create new registration (like enquiry system)
    const registration = await prisma.brokerRegistration.create({
      data: {
        userId: anonymousUser.id,
        linkId: defaultLink.id,
        verified: false, // Start as pending for admin review
        verifiedAt: null,
        verificationData: validatedData.verificationData
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

    console.log('Created registration:', { id: registration.id, verified: registration.verified })

    // Log the verification submission action
    await prisma.auditLog.create({
      data: {
        actorId: anonymousUser.id,
        action: 'SUBMIT_BROKER_VERIFICATION',
        entity: 'BrokerRegistration',
        entityId: registration.id,
        diff: {
          verificationData: validatedData.verificationData,
          status: 'pending_admin_review'
        }
      }
    })

    return NextResponse.json({
      success: true,
      registration: registration,
      message: 'Verification data submitted successfully. Your registration is pending admin review.'
    })

  } catch (error) {
    console.error('Error verifying broker registration:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Validation error details:', error.errors)
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    
    // Provide more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Specific error:', errorMessage)
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 })
  }
}
