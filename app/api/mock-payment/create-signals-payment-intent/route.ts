import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { savePaymentIntent } from '@/lib/mock-payment-storage'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('=== PAYMENT INTENT CREATION ===')
    console.log('Request URL:', request.url)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    let user = await getAuthenticatedUserSimple(request)
    console.log('Authentication result:', user)
    
    // For testing purposes, if no user is authenticated, create a test user
    if (!user) {
      console.log('No authenticated user found, creating test user for payment intent')
      user = {
        id: 'test-user-' + Date.now(),
        name: 'Test User',
        email: 'test@example.com',
        role: 'STUDENT',
        source: 'test'
      }
    } else {
      console.log('Using authenticated user:', user.name, user.email, user.id)
    }

    const { amount, currency = 'USD', courseId, courseTitle } = await request.json()

    if (!amount || amount !== 50) {
      return NextResponse.json({ error: 'Invalid amount for signals subscription' }, { status: 400 })
    }

    console.log('Creating signals payment intent with:', { amount, currency, courseId, courseTitle, userId: user.id })

    // Create mock payment intent for signals subscription
    const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const clientSecret = `pi_mock_${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`

    // Store the payment intent in mock storage
    const paymentIntent = {
      id: paymentIntentId,
      client_secret: clientSecret,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      metadata: {
        userId: user.id,
        userEmail: user.email || '',
        subscriptionType: 'signals',
        plan: 'MONTHLY',
        courseId: courseId?.toString(),
        courseTitle: courseTitle
      },
      created: Math.floor(Date.now() / 1000),
      payment_method_types: ['card'],
      automatic_payment_methods: { enabled: true }
    }

    savePaymentIntent(paymentIntent)

    console.log('Mock signals payment intent created and stored:', {
      paymentIntentId,
      userId: user.id,
      amount,
      currency
    })

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
      metadata: paymentIntent.metadata
    })
  } catch (error) {
    console.error('Error creating mock signals payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
