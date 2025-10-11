import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        
        const courseId = paymentIntent.metadata.courseId
        const userId = paymentIntent.metadata.userId
        const subscriptionType = paymentIntent.metadata.subscriptionType
        const resourceId = paymentIntent.metadata.resourceId
        const purchaseType = paymentIntent.metadata.type
        const eventId = paymentIntent.metadata.eventId
        const eventTitle = paymentIntent.metadata.eventTitle
        const fullName = paymentIntent.metadata.fullName
        const userEmail = paymentIntent.metadata.userEmail
        
        // Handle signals subscription payment
        if (subscriptionType === 'signals' && userId) {
          try {
            console.log('Processing signals subscription payment for user:', userId)
            
            // Check if user already has active subscription
            const existingSubscription = await prisma.subscription.findFirst({
              where: {
                userId: userId,
                status: 'ACTIVE'
              }
            })
            
            if (existingSubscription) {
              console.log('User already has active subscription:', existingSubscription.id)
              break
            }
            
            // Create signals subscription
            const now = new Date()
            const currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            
            const subscription = await prisma.subscription.create({
              data: {
                userId: userId,
                plan: 'MONTHLY',
                status: 'ACTIVE',
                currentPeriodStart: now,
                currentPeriodEnd: currentPeriodEnd,
                stripeId: paymentIntent.id
              }
            })
            
            // Update user role to SIGNALS
            await prisma.user.update({
              where: { id: userId },
              data: { role: 'SIGNALS' }
            })
            
            console.log('Signals subscription created:', {
              subscriptionId: subscription.id,
              userId: userId,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              expiresAt: currentPeriodEnd
            })
          } catch (error) {
            console.error('Error creating signals subscription:', error)
          }
        }
        // Handle resource purchase payment
        else if (purchaseType === 'resource_purchase' && resourceId && userId) {
          try {
            console.log('Processing resource purchase payment for user:', userId, 'resource:', resourceId)
            
            // Update the resource purchase status to COMPLETED
            const updatedPurchase = await prisma.resourcePurchase.updateMany({
              where: {
                userId: userId,
                resourceId: resourceId,
                stripeId: paymentIntent.id
              },
              data: {
                status: 'COMPLETED'
              }
            })
            
            if (updatedPurchase.count > 0) {
              console.log('Resource purchase completed:', {
                userId,
                resourceId,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                stripeId: paymentIntent.id
              })
            } else {
              console.log('No matching purchase found for resource payment:', {
                userId,
                resourceId,
                stripeId: paymentIntent.id
              })
            }
          } catch (error) {
            console.error('Error processing resource purchase:', error)
          }
        }
        // Handle event registration payment
        else if (eventId && userEmail) {
          try {
            console.log('Processing event registration payment:', {
              eventId,
              eventTitle,
              fullName,
              userEmail,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency
            })

            // Find the registration by eventId and email
            const registration = await prisma.eventRegistration.findFirst({
              where: {
                eventId: eventId,
                email: userEmail,
                stripePaymentIntentId: paymentIntent.id
              }
            })

            if (registration) {
              // Update registration status
              await prisma.eventRegistration.update({
                where: { id: registration.id },
                data: {
                  status: 'CONFIRMED',
                  paymentStatus: 'PAID'
                }
              })

              console.log('Event registration confirmed:', {
                registrationId: registration.id,
                eventId,
                fullName,
                userEmail,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency
              })

              // Create admin notification
              await prisma.newNotification.create({
                data: {
                  userId: 'system',
                  title: 'Event Registration Payment Confirmed',
                  message: `${fullName} completed payment for "${eventTitle}"`,
                  type: 'event_payment',
                  isRead: false
                }
              })

              // Create admin notifications for all admins
              const admins = await prisma.user.findMany({
                where: { 
                  role: { in: ['SUPERADMIN', 'ADMIN', 'EDITOR'] }
                },
                select: { id: true }
              })

              if (admins.length > 0) {
                await prisma.notification.createMany({
                  data: admins.map(admin => ({
                    userId: admin.id,
                    title: 'Event Registration Payment Confirmed',
                    message: `${fullName} completed payment for "${eventTitle}"`,
                    type: 'EVENT_PAYMENT',
                    isRead: false
                  }))
                })
              }
            } else {
              console.log('Event registration not found for payment:', {
                eventId,
                userEmail,
                paymentIntentId: paymentIntent.id
              })
            }
          } catch (error) {
            console.error('Error processing event registration payment:', error)
          }
        }
        // Handle course enrollment payment
        else if (courseId && userId) {
          try {
            // Check if enrollment already exists
            const existingEnrollment = await prisma.courseEnrollment.findUnique({
              where: {
                userId_courseId: {
                  userId: userId,
                  courseId: courseId
                }
              }
            })
            
            if (!existingEnrollment) {
              // Create course enrollment
              await prisma.courseEnrollment.create({
                data: {
                  userId: userId,
                  courseId: courseId,
                  progress: 0,
                  completed: false
                }
              })
              
              console.log('Course enrollment created:', {
                courseId,
                userId,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
              })
            } else {
              console.log('Enrollment already exists for user:', userId, 'course:', courseId)
            }
          } catch (error) {
            console.error('Error creating course enrollment:', error)
          }
        } else {
          console.log('Missing courseId or userId in payment metadata:', {
            courseId,
            userId,
            metadata: paymentIntent.metadata
          })
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', failedPayment.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
