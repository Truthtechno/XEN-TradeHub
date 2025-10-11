import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { workingFinalBilling } from '@/lib/working-final-billing'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// POST /api/subscriptions/cancel - Cancel user's subscription
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
    
    const cancelSchema = z.object({
      subscriptionId: z.string().optional(),
      reason: z.string().optional().default('USER_REQUEST')
    })

    const validatedData = cancelSchema.parse(body)

    // Get user's active subscription
    const subscriptionStatus = await workingFinalBilling.getUserSubscriptionStatus(user.id)
    
    if (!subscriptionStatus.hasActiveSubscription) {
      return NextResponse.json({ 
        success: false,
        message: 'No active subscription found'
      }, { status: 404 })
    }

    const subscriptionId = validatedData.subscriptionId || subscriptionStatus.subscription?.id

    if (!subscriptionId) {
      return NextResponse.json({ 
        success: false,
        message: 'Subscription ID not found'
      }, { status: 400 })
    }

    // Cancel subscription
    const success = await workingFinalBilling.cancelSubscription(subscriptionId, validatedData.reason)

    if (!success) {
      return NextResponse.json({ 
        success: false,
        message: 'Failed to cancel subscription'
      }, { status: 500 })
    }

    console.log('Subscription canceled:', {
      userId: user.id,
      subscriptionId,
      reason: validatedData.reason
    })

    return NextResponse.json({ 
      success: true,
      message: 'Subscription canceled successfully',
      subscriptionId
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
