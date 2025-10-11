import { NextRequest, NextResponse } from 'next/server'
import { getPaymentIntents, savePaymentIntent, type MockPaymentIntent } from '@/lib/mock-payment-storage'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




// Mock payment intents store (same as other endpoints)


const mockPaymentIntents = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, courseId, courseTitle } = await request.json()

    console.log('Test flow request:', { amount, currency, courseId, courseTitle })

    // Create a test payment intent
    const paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const clientSecret = `pi_test_${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`

    const paymentIntent = {
      id: paymentIntentId,
      client_secret: clientSecret,
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      metadata: {
        courseId: courseId.toString(),
        courseTitle: courseTitle || 'Test Course',
        userId: 'test_user',
        userEmail: 'test@example.com',
      },
      created: Math.floor(Date.now() / 1000),
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: true,
      },
    }

    // Store the payment intent
    mockPaymentIntents.set(paymentIntentId, paymentIntent)
    
    console.log('Created test payment intent:', paymentIntentId)

    // Simulate immediate payment confirmation for testing
    const testCardNumber = '4242424242424242'
    const randomOutcome = Math.random()
    
    if (randomOutcome < 0.85) {
      // 85% success rate
      const updatedIntent = {
        ...paymentIntent,
        status: 'succeeded',
        payment_method: {
          id: `pm_test_${Date.now()}`,
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          }
        }
      }
      
      savePaymentIntent(updatedIntent)
      
      return NextResponse.json({
        success: true,
        message: 'Test payment successful',
        paymentIntent: {
          id: updatedIntent.id,
          status: 'succeeded',
          payment_method: updatedIntent.payment_method,
          amount: updatedIntent.amount,
          currency: updatedIntent.currency,
          metadata: updatedIntent.metadata,
        },
        testData: {
          cardNumber: testCardNumber,
          successRate: '85%',
          randomOutcome: randomOutcome.toFixed(3)
        }
      })
    } else {
      // 15% failure rate
      const updatedIntent = {
        ...paymentIntent,
        status: 'payment_failed',
        last_payment_error: {
        type: 'card_error',
        code: 'card_declined',
        message: 'Test payment failed (simulated)',
        decline_code: 'generic_decline'
        }
      }
      
      savePaymentIntent(updatedIntent)
      
      return NextResponse.json({
        success: false,
        message: 'Test payment failed (simulated)',
        paymentIntent: {
          id: updatedIntent.id,
          status: 'payment_failed',
          last_payment_error: updatedIntent.last_payment_error,
        },
        testData: {
          cardNumber: testCardNumber,
          successRate: '85%',
          randomOutcome: randomOutcome.toFixed(3)
        }
      }, { status: 402 })
    }
  } catch (error) {
    console.error('Test flow error:', error)
    return NextResponse.json({
      success: false,
      message: 'Test flow failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
