import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { savePaymentIntent, getPaymentIntents, type MockPaymentIntent } from '@/lib/mock-payment-storage'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    // For mock payments, we'll allow unauthenticated requests for testing
    // In production, you might want to require authentication
    const userId = user?.id || 'mock_user_' + Date.now()
    const userEmail = user?.email || 'test@example.com'

    const { amount, currency, courseId, courseTitle } = await request.json()

    if (!amount || !currency || !courseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate mock payment intent
    const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const clientSecret = `pi_mock_${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`

    const paymentIntent: MockPaymentIntent = {
      id: paymentIntentId,
      client_secret: clientSecret,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      metadata: {
        courseId: courseId.toString(),
        courseTitle: courseTitle || 'Course Registration',
        userId: userId,
        userEmail: userEmail,
      },
      created: Math.floor(Date.now() / 1000),
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: true,
      },
    }

    // Store the payment intent
    savePaymentIntent(paymentIntent)
    
    console.log('Created payment intent:', paymentIntentId)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating mock payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve payment intent status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID required' }, { status: 400 })
    }

    const paymentIntents = getPaymentIntents()
    const paymentIntent = paymentIntents[paymentIntentId]
    
    if (!paymentIntent) {
      return NextResponse.json({ error: 'Payment intent not found' }, { status: 404 })
    }

    return NextResponse.json(paymentIntent)
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve payment intent' },
      { status: 500 }
    )
  }
}
