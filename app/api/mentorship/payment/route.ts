import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { accessControl } from '@/lib/access-control'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('=== MENTORSHIP PAYMENT API ===')
    const user = await getAuthenticatedUserSimple(request)
    console.log('User authenticated:', !!user)
    
    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    console.log('Payment request body:', body)
    
    // Validate required fields
    const requiredFields = ['registrationId', 'amount', 'currency']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields)
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate amount
    if (body.amount !== 1500 || body.currency !== 'USD') {
      console.log('Invalid amount or currency:', body.amount, body.currency)
      return NextResponse.json(
        { success: false, message: 'Invalid payment amount or currency' },
        { status: 400 }
      )
    }

    // Check if registration exists
    console.log('Looking for registration:', body.registrationId)
    const registration = await prisma.mentorshipRegistration.findUnique({
      where: { id: body.registrationId },
      include: { user: true }
    })
    console.log('Registration found:', !!registration)

    if (!registration) {
      console.log('Registration not found')
      return NextResponse.json({
        success: false,
        message: 'Mentorship registration not found'
      }, { status: 404 })
    }

    // Check if user already has premium access
    console.log('Checking user access...')
    const userAccess = await accessControl.getUserAccess(user.id)
    console.log('User access:', userAccess.subscriptionType)
    if (userAccess.subscriptionType === 'PREMIUM') {
      console.log('User already has premium access')
      return NextResponse.json({
        success: false,
        message: 'User already has premium access'
      }, { status: 400 })
    }

    // Process payment (mock for now - in production, integrate with Stripe)
    console.log('Processing payment...')
    const paymentResult = {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      stripeId: `pi_${Date.now()}`
    }

    // Create payment record
    console.log('Creating payment record...')
    const payment = await prisma.mentorshipPayment.create({
      data: {
        userId: user.id,
        registrationId: body.registrationId,
        amount: body.amount,
        currency: body.currency,
        status: paymentResult.success ? 'completed' : 'failed',
        stripeId: paymentResult.stripeId
      }
    })
    console.log('Payment record created:', payment.id)

    // Update registration status
    console.log('Updating registration status...')
    await prisma.mentorshipRegistration.update({
      where: { id: body.registrationId },
      data: { status: 'PAID' }
    })

    // Upgrade user to premium
    console.log('Upgrading user to premium...')
    const upgradeResult = await accessControl.upgradeToPremium(user.id, body.amount)
    console.log('Upgrade result:', upgradeResult)
    
    if (!upgradeResult.success) {
      console.error('Failed to upgrade user to premium:', upgradeResult.message)
    }

    console.log('Mentorship Payment processed:', payment.id)

    if (!paymentResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Payment failed. Please try again.',
        data: payment
      }, { status: 402 })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment,
        access: upgradeResult.access
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Mentorship payment endpoint',
    methods: ['POST'],
    requiredFields: ['registrationId', 'amount', 'currency'],
    note: 'For testing purposes, all payments are automatically approved'
  })
}