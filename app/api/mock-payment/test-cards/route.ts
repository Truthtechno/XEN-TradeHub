import { NextRequest, NextResponse } from 'next/server'
import { savePaymentIntent, getPaymentIntent, updatePaymentIntent, type MockPaymentIntent } from '@/lib/mock-payment-storage'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




const testCards = [


  {
    number: '4242424242424242',
    name: 'Success Card',
    expectedResult: 'succeeded',
    description: 'Should always succeed'
  },
  {
    number: '4000000000000002',
    name: 'Declined Card',
    expectedResult: 'declined',
    description: 'Should always be declined'
  },
  {
    number: '4000000000009995',
    name: 'Insufficient Funds Card',
    expectedResult: 'insufficient_funds',
    description: 'Should fail due to insufficient funds'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { cardNumber, testName } = await request.json()
    
    console.log(`Testing card: ${cardNumber} (${testName})`)
    
    // Create a test payment intent
    const paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const clientSecret = `pi_test_${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`

    const paymentIntent: MockPaymentIntent = {
      id: paymentIntentId,
      client_secret: clientSecret,
      amount: 19900, // $199.00 in cents
      currency: 'usd',
      status: 'requires_payment_method',
      metadata: {
        courseId: 'test-course-123',
        courseTitle: 'Test Course',
        userId: 'test_user',
        userEmail: 'test@example.com',
        testCard: cardNumber,
        testName: testName
      },
      created: Math.floor(Date.now() / 1000),
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: true,
      },
    }

    // Store the payment intent
    savePaymentIntent(paymentIntent)
    console.log('Created test payment intent:', paymentIntentId)

    // Process payment based on card number
    let result
    if (cardNumber === '4242424242424242') {
      // Success card
      result = {
        id: paymentIntentId,
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
        },
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      }
      
      updatePaymentIntent(paymentIntentId, { ...paymentIntent, ...result })
      
    } else if (cardNumber === '4000000000000002') {
      // Declined card
      result = {
        id: paymentIntentId,
        status: 'payment_failed',
        last_payment_error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.',
          decline_code: 'generic_decline'
        }
      }
      
      updatePaymentIntent(paymentIntentId, { ...paymentIntent, ...result })
      
    } else if (cardNumber === '4000000000009995') {
      // Insufficient funds card
      result = {
        id: paymentIntentId,
        status: 'payment_failed',
        last_payment_error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card has insufficient funds.',
          decline_code: 'insufficient_funds'
        }
      }
      
      updatePaymentIntent(paymentIntentId, { ...paymentIntent, ...result })
      
    } else {
      // Random outcome for other cards
      const randomOutcome = Math.random()
      if (randomOutcome < 0.85) {
        result = {
          id: paymentIntentId,
          status: 'succeeded',
          payment_method: {
            id: `pm_test_${Date.now()}`,
            type: 'card',
            card: {
              brand: 'visa',
              last4: cardNumber.slice(-4),
              exp_month: 12,
              exp_year: 2025,
            }
          },
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata,
        }
        updatePaymentIntent(paymentIntentId, { ...paymentIntent, ...result })
      } else {
        result = {
          id: paymentIntentId,
          status: 'payment_failed',
          last_payment_error: {
            type: 'card_error',
            code: 'card_declined',
            message: 'Your card was declined.',
            decline_code: 'generic_decline'
          }
        }
        updatePaymentIntent(paymentIntentId, { ...paymentIntent, ...result })
      }
    }

    console.log('Test result:', result)

    return NextResponse.json({
      success: true,
      testCard: cardNumber,
      testName: testName,
      result: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test card error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    testCards: testCards,
    message: 'Available test cards for payment testing',
    timestamp: new Date().toISOString()
  })
}
