import Stripe from 'stripe'

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here', {
  apiVersion: '2023-10-16',
})

// Stripe publishable key for frontend
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here'

// Payment intent creation
export async function createPaymentIntent(amount: number, currency: string = 'usd', metadata: any = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent'
    }
  }
}

// Verify payment intent
export async function verifyPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    return {
      success: true,
      paymentIntent,
      status: paymentIntent.status
    }
  } catch (error) {
    console.error('Error verifying payment intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify payment intent'
    }
  }
}
