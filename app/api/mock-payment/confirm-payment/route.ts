import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'





import { getPaymentIntent, updatePaymentIntent, getPaymentIntents } from '@/lib/mock-payment-storage'



export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    // For mock payments, we'll allow unauthenticated requests for testing
    // In production, you might want to require authentication
    if (!user) {
      console.log('Mock payment: No user found, proceeding with mock user')
    }

    const { paymentIntentId, paymentMethod } = await request.json()

    console.log('Confirm payment request:', { paymentIntentId, paymentMethod })

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID required' }, { status: 400 })
    }

    // Retrieve the payment intent
    const paymentIntent = getPaymentIntent(paymentIntentId)
    
    console.log('Retrieved payment intent:', paymentIntent)
    const allIntents = getPaymentIntents()
    console.log('Available payment intents:', Object.keys(allIntents))
    
    if (!paymentIntent) {
      return NextResponse.json({ 
        error: 'Payment intent not found',
        availableIntents: Object.keys(allIntents),
        requestedId: paymentIntentId
      }, { status: 404 })
    }

    // Get success rate from settings
    let successRate = 85 // Default success rate
    try {
      const settings = await prisma.settings.findMany()
      const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)
      successRate = parseInt(settingsObject.mockPaymentSuccessRate || '85')
    } catch (error) {
      console.error('Error fetching settings:', error)
    }

    // Check for specific test card numbers first
    const cardNumber = paymentMethod.card.number
    console.log('Processing payment for card number:', cardNumber)
    
    if (cardNumber === '4242424242424242') {
      console.log('Success card detected - processing success')
      // Success card - always succeed
      const updatedIntent = {
        ...paymentIntent,
        status: 'succeeded',
        payment_method: {
          id: `pm_mock_${Date.now()}`,
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          }
        }
      }
      
      console.log('Updated payment intent:', updatedIntent)
      updatePaymentIntent(paymentIntentId, updatedIntent)
      
      // Simulate webhook immediately
      console.log('Simulating webhook for payment intent:', updatedIntent.id)
      try {
        await simulateWebhook(updatedIntent)
        console.log('Webhook simulation completed')
      } catch (error) {
        console.error('Webhook simulation failed:', error)
      }

      return NextResponse.json({
        id: updatedIntent.id,
        status: 'succeeded',
        payment_method: updatedIntent.payment_method,
        amount: updatedIntent.amount,
        currency: updatedIntent.currency,
        metadata: updatedIntent.metadata,
      })
    } else if (cardNumber === '4000000000000002') {
      console.log('Declined card detected - processing decline')
      // Declined card - always fail
      const updatedIntent = {
        ...paymentIntent,
        status: 'payment_failed',
        last_payment_error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.',
          decline_code: 'generic_decline'
        }
      }
      
      updatePaymentIntent(paymentIntentId, updatedIntent)
      
      return NextResponse.json({
        id: updatedIntent.id,
        status: 'payment_failed',
        last_payment_error: updatedIntent.last_payment_error,
      }, { status: 402 })
    } else if (cardNumber === '4000000000009995') {
      console.log('Insufficient funds card detected - processing decline')
      // Insufficient funds card - always fail
      const updatedIntent = {
        ...paymentIntent,
        status: 'payment_failed',
        last_payment_error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card has insufficient funds.',
          decline_code: 'insufficient_funds'
        }
      }
      
      updatePaymentIntent(paymentIntentId, updatedIntent)
      
      return NextResponse.json({
        id: updatedIntent.id,
        status: 'payment_failed',
        last_payment_error: updatedIntent.last_payment_error,
      }, { status: 402 })
    }

    // For other cards, use random outcome based on success rate
    const randomOutcome = Math.random()
    
    if (randomOutcome < (successRate / 100)) {
      // Success based on configured rate
      const updatedIntent = {
        ...paymentIntent,
        status: 'succeeded',
        payment_method: {
          id: `pm_mock_${Date.now()}`,
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          }
        }
      }
      
      // Store updated payment intent
      updatePaymentIntent(paymentIntentId, updatedIntent)
      
      // Simulate webhook call (in production, this would be handled by Stripe)
      setTimeout(() => {
        simulateWebhook(updatedIntent)
      }, 1000)

      return NextResponse.json({
        id: updatedIntent.id,
        status: 'succeeded',
        payment_method: updatedIntent.payment_method,
        amount: updatedIntent.amount,
        currency: updatedIntent.currency,
        metadata: updatedIntent.metadata,
      })
    } else if (randomOutcome < 0.95) {
      // 10% requires action (3D Secure simulation)
      const updatedIntent = {
        ...paymentIntent,
        status: 'requires_action',
        next_action: {
          type: 'use_stripe_sdk',
          use_stripe_sdk: {
            type: 'three_d_secure_redirect',
            three_d_secure_redirect: {
              url: `https://mock-payment.com/3ds?payment_intent=${paymentIntentId}`
            }
          }
        }
      }
      
      updatePaymentIntent(paymentIntentId, updatedIntent)
      
      return NextResponse.json({
        id: updatedIntent.id,
        status: 'requires_action',
        next_action: updatedIntent.next_action,
      })
    } else {
      // 5% failure rate
      const updatedIntent = {
        ...paymentIntent,
        status: 'payment_failed',
        last_payment_error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.',
          decline_code: 'generic_decline'
        }
      }
      
      updatePaymentIntent(paymentIntentId, updatedIntent)
      
      return NextResponse.json({
        id: updatedIntent.id,
        status: 'payment_failed',
        last_payment_error: updatedIntent.last_payment_error,
      }, { status: 402 })
    }
  } catch (error) {
    console.error('Error confirming mock payment:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}

// Simulate webhook call for successful payments
async function simulateWebhook(paymentIntent: any) {
  try {
    const webhookPayload = {
      id: `evt_mock_${Date.now()}`,
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: paymentIntent
      },
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: `req_mock_${Date.now()}`,
        idempotency_key: null
      }
    }

    // Call the webhook endpoint
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mock-payment/webhook`
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=mock_signature_${Math.random().toString(36).substr(2, 9)}`
      },
      body: JSON.stringify(webhookPayload)
    })
  } catch (error) {
    console.error('Error simulating webhook:', error)
  }
}
