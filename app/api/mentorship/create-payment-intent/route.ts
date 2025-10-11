import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here', {
  apiVersion: '2023-10-16',
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('=== MENTORSHIP PAYMENT INTENT API ===')
    const user = await getAuthenticatedUserSimple(request)
    console.log('User authenticated:', !!user)
    
    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const { amount, currency, courseId, courseTitle } = await request.json()
    console.log('Payment intent request:', { amount, currency, courseId, courseTitle })

    if (!amount || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already has premium access
    if (user.role === 'PREMIUM') {
      console.log('User already has premium access')
      return NextResponse.json({
        error: 'User already has premium access'
      }, { status: 400 })
    }

    // Create payment intent with Stripe
    console.log('Creating payment intent with Stripe...')
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        courseId: courseId || 'mentorship',
        courseTitle: courseTitle || 'One-on-One Mentorship',
        userId: user.id,
        userEmail: user.email || '',
        type: 'mentorship'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log('Payment intent created successfully:', paymentIntent.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
