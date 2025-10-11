import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { paymentProcessor } from '@/lib/payment-processor'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.log('No stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here'
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Webhook event received:', event.type)

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment succeeded:', paymentIntent.id)

      const { userId, courseId, type } = paymentIntent.metadata

      if (!userId) {
        console.log('Missing userId in payment intent metadata')
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
      }

      // Only process mentorship payments
      if (type !== 'mentorship') {
        console.log('Not a mentorship payment, skipping')
        return NextResponse.json({ received: true })
      }

      try {
        // Find the mentorship registration for this user
        const registration = await prisma.mentorshipRegistration.findFirst({
          where: { 
            userId: userId,
            status: 'PENDING'
          },
          orderBy: { createdAt: 'desc' }
        })

        if (!registration) {
          console.log('No pending mentorship registration found for user:', userId)
          return NextResponse.json({ error: 'No pending registration found' }, { status: 400 })
        }

        // Process mentorship payment using the payment processor
        const result = await paymentProcessor.processMentorshipPayment(
          userId,
          paymentIntent.amount / 100, // Convert from cents
          paymentIntent.currency.toUpperCase(),
          paymentIntent.id,
          registration.id
        )

        if (!result.success) {
          console.error('Failed to process mentorship payment:', result.message)
          return NextResponse.json({ error: result.message }, { status: 400 })
        }

        console.log('Mentorship payment processed successfully:', result.user?.email)
        return NextResponse.json({ success: true, message: 'Payment processed successfully' })
      } catch (error) {
        console.error('Error processing payment:', error)
        return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
