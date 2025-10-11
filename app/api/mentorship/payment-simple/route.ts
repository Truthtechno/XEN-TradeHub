import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE PAYMENT API ===')
    const user = await getAuthenticatedUserSimple(request)
    console.log('User authenticated:', !!user)
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    console.log('Payment request body:', body)
    
    // Just test database connection
    console.log('Testing database connection...')
    const testUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, role: true }
    })
    console.log('Database connection successful, user:', testUser?.email)
    
    // Test mentorship registration lookup
    console.log('Testing mentorship registration lookup...')
    const registration = await prisma.mentorshipRegistration.findUnique({
      where: { id: body.registrationId },
      select: { id: true, name: true, status: true }
    })
    console.log('Registration found:', !!registration)
    
    if (!registration) {
      return NextResponse.json({
        success: false,
        message: 'Mentorship registration not found'
      }, { status: 404 })
    }
    
    // Test creating a simple payment record
    console.log('Testing payment record creation...')
    const payment = await prisma.mentorshipPayment.create({
      data: {
        userId: user.id,
        registrationId: body.registrationId,
        amount: body.amount,
        currency: body.currency,
        status: 'completed',
        stripeId: `test_${Date.now()}`
      }
    })
    console.log('Payment record created successfully:', payment.id)
    
    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status
      }
    })

  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
