import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { paymentProcessor } from '@/lib/payment-processor'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// POST /api/payments/signals - Process signals subscription payment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    
    const signalsPaymentSchema = z.object({
      amountUSD: z.number().min(50).max(50), // Must be exactly $50
      plan: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
      provider: z.string().default('stripe'),
      providerRef: z.string().optional(),
      paymentMethodId: z.string().optional()
    })

    const validatedData = signalsPaymentSchema.parse(body)
    
    // Process signals payment using the payment processor
    const result = await paymentProcessor.processSignalsPayment(
      user.id,
      validatedData.plan,
      validatedData.amountUSD,
      'USD',
      validatedData.providerRef
    )

    if (!result.success) {
      return NextResponse.json({ 
        success: false,
        message: result.message
      }, { status: 400 })
    }

    console.log('Signals subscription created:', {
      userId: result.user?.id,
      email: result.user?.email,
      newRole: result.user?.role,
      subscriptionId: result.subscription?.id,
      plan: validatedData.plan,
      amount: validatedData.amountUSD
    })

    return NextResponse.json({ 
      success: true,
      message: 'Signals subscription created successfully',
      subscription: {
        id: result.subscription?.id,
        userId: result.user?.id,
        email: result.user?.email,
        role: result.user?.role,
        plan: validatedData.plan,
        amount: validatedData.amountUSD,
        status: 'active'
      }
    })

  } catch (error) {
    console.error('Error processing signals subscription payment:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/payments/signals - Get subscription status
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    // Sync user subscription status first to ensure consistency
    await paymentProcessor.syncUserSubscriptionStatus(user.id)

    // Get subscription status using the access control service
    const { accessControl } = await import('@/lib/access-control')
    const access = await accessControl.getUserAccess(user.id)

    return NextResponse.json({ 
      success: true,
      subscription: {
        hasActiveSubscription: access.subscriptionType !== 'BASIC',
        subscriptionType: access.subscriptionType,
        nextBillingDate: undefined, // TODO: Get from subscription data
        status: access.subscriptionStatus
      }
    })

  } catch (error) {
    console.error('Error getting subscription status:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
