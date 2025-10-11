import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




export async function POST(request: NextRequest) {


  try {
    const body = await request.json()
    const signature = request.headers.get('stripe-signature')

    // In a real implementation, you would verify the signature
    // For mock purposes, we'll just log it
    console.log('Mock webhook received:', {
      signature,
      eventType: body.type,
      eventId: body.id
    })

    // Handle the event
    switch (body.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = body.data.object
        console.log('🎉 Mock Payment succeeded:', paymentIntent.id)
        console.log('Payment intent metadata:', paymentIntent.metadata)
        
        const courseId = paymentIntent.metadata.courseId
        const userId = paymentIntent.metadata.userId
        const subscriptionType = paymentIntent.metadata.subscriptionType
        const eventId = paymentIntent.metadata.eventId
        const eventTitle = paymentIntent.metadata.eventTitle
        const courseTitle = paymentIntent.metadata.courseTitle
        
        // Handle resource purchase payment
        if (courseId && !subscriptionType) {
          try {
            console.log('Processing mock resource purchase payment for course:', courseId)
            console.log('Payment intent ID:', paymentIntent.id)
            
            // Find the resource purchase record by stripeId
            const purchase = await prisma.resourcePurchase.findFirst({
              where: {
                stripeId: paymentIntent.id
              }
            })
            
            console.log('Found purchase record:', purchase)
            
            if (purchase) {
              // Update the purchase status to COMPLETED
              const updatedPurchase = await prisma.resourcePurchase.update({
                where: { id: purchase.id },
                data: { status: 'COMPLETED' }
              })
              
              console.log('Resource purchase marked as completed:', updatedPurchase.id, 'Status:', updatedPurchase.status)
            } else {
              console.log('No resource purchase found for payment intent:', paymentIntent.id)
              
              // Let's also try to find by resourceId as a fallback
              const fallbackPurchase = await prisma.resourcePurchase.findFirst({
                where: {
                  resourceId: courseId,
                  status: 'PENDING'
                },
                orderBy: {
                  createdAt: 'desc'
                }
              })
              
              if (fallbackPurchase) {
                console.log('Found fallback purchase record:', fallbackPurchase.id)
                const updatedPurchase = await prisma.resourcePurchase.update({
                  where: { id: fallbackPurchase.id },
                  data: { 
                    status: 'COMPLETED',
                    stripeId: paymentIntent.id
                  }
                })
                console.log('Fallback purchase marked as completed:', updatedPurchase.id, 'Status:', updatedPurchase.status)
              } else {
                console.log('No fallback purchase found either')
              }
            }
          } catch (error) {
            console.error('Error processing resource purchase:', error)
          }
        }
        
        // Handle signals subscription payment
        if (subscriptionType === 'signals' && userId) {
          try {
            console.log('Processing mock signals subscription payment for user:', userId)
            
            // Check if user exists, if not create a test user
            let user = await prisma.user.findUnique({
              where: { id: userId }
            })
            
            if (!user) {
              console.log('User not found, creating test user:', userId)
              user = await prisma.user.create({
                data: {
                  id: userId,
                  name: 'Test User',
                  email: 'test@example.com',
                  role: 'STUDENT'
                }
              })
            }
            
            // Check if user already has active subscription
            const existingActiveSubscription = await prisma.subscription.findFirst({
              where: {
                userId: userId,
                status: 'ACTIVE'
              }
            })
            
            if (existingActiveSubscription) {
              console.log('User already has active subscription:', existingActiveSubscription.id)
              // Don't create a new subscription, but still update the user role if needed
              if (user.role !== 'SIGNALS') {
                await prisma.user.update({
                  where: { id: userId },
                  data: { role: 'SIGNALS' }
                })
                console.log('Updated user role to SIGNALS for existing subscription')
              }
              break
            }
            
            // Check if user has expired subscription and update it instead of creating new one
            const existingExpiredSubscription = await prisma.subscription.findFirst({
              where: {
                userId: userId,
                status: 'EXPIRED'
              }
            })
            
            if (existingExpiredSubscription) {
              console.log('User has expired subscription, renewing:', existingExpiredSubscription.id)
              
              // Update the expired subscription to active
              const now = new Date()
              const currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
              
              await prisma.subscription.update({
                where: { id: existingExpiredSubscription.id },
                data: {
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
              
              console.log('Expired subscription renewed:', existingExpiredSubscription.id)
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
            
            console.log('Mock signals subscription created:', {
              subscriptionId: subscription.id,
              userId: userId,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              expiresAt: currentPeriodEnd
            })
          } catch (error) {
            console.error('Error creating mock signals subscription:', error)
          }
        }
        
        // Handle mentorship payment
        if (courseTitle === 'One-on-One Mentorship' && userId) {
          try {
            console.log('Processing mock mentorship payment for user:', userId)
            console.log('Payment intent ID:', paymentIntent.id)
            
            // Find the mentorship registration for this user
            const registration = await prisma.mentorshipRegistration.findFirst({
              where: { 
                userId: userId,
                status: 'PENDING'
              },
              orderBy: { createdAt: 'desc' }
            })
            
            console.log('Found mentorship registration:', registration)
            
            if (registration) {
              // Update registration status to PAID
              await prisma.mentorshipRegistration.update({
                where: { id: registration.id },
                data: { status: 'PAID' }
              })
              
              // Create payment record
              await prisma.mentorshipPayment.create({
                data: {
                  userId: userId,
                  registrationId: registration.id,
                  amount: paymentIntent.amount / 100, // Convert from cents
                  currency: paymentIntent.currency.toUpperCase(),
                  status: 'completed',
                  stripeId: paymentIntent.id,
                }
              })
              
              // Upgrade user to premium
              await prisma.user.update({
                where: { id: userId },
                data: { role: 'PREMIUM' }
              })
              
              // Create premium subscription
              const now = new Date()
              const currentPeriodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
              
              await prisma.subscription.create({
                data: {
                  userId: userId,
                  plan: 'PREMIUM',
                  status: 'ACTIVE',
                  currentPeriodStart: now,
                  currentPeriodEnd: currentPeriodEnd,
                  stripeId: paymentIntent.id
                }
              })
              
              console.log('Mentorship payment processed successfully:', {
                registrationId: registration.id,
                userId: userId,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                newRole: 'PREMIUM'
              })
            } else {
              console.log('No pending mentorship registration found for user:', userId)
            }
          } catch (error) {
            console.error('Error processing mock mentorship payment:', error)
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
              
              console.log('Mock Course enrollment created:', {
                courseId,
                userId,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
              })
            } else {
              console.log('Mock Enrollment already exists for user:', userId, 'course:', courseId)
            }
          } catch (error) {
            console.error('Error creating mock course enrollment:', error)
          }
        } else if (eventId && eventTitle) {
          // Handle event registration payment
          try {
            console.log('Processing mock event registration payment for event:', eventId)
            console.log('Payment intent ID:', paymentIntent.id)
            
            // Find the event registration by eventId and payment intent
            const registration = await prisma.eventRegistration.findFirst({
              where: {
                eventId: eventId,
                stripePaymentIntentId: paymentIntent.id
              }
            })
            
            console.log('Found event registration:', registration)
            
            if (registration) {
              // Update registration status to confirmed and paid
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
                fullName: registration.fullName,
                email: registration.email,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency
              })

              // Create admin notification (skip if no system user exists)
              try {
                const systemUser = await prisma.user.findFirst({
                  where: { role: 'SUPERADMIN' }
                })
                
                if (systemUser) {
                  await prisma.newNotification.create({
                    data: {
                      userId: systemUser.id,
                      title: 'Event Registration Payment Confirmed',
                      message: `${registration.fullName} completed payment for "${eventTitle}"`,
                      type: 'event_payment',
                      isRead: false
                    }
                  })
                }
              } catch (error) {
                console.log('Skipping system notification creation:', error instanceof Error ? error.message : 'Unknown error')
              }

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
                    message: `${registration.fullName} completed payment for "${eventTitle}"`,
                    type: 'EVENT_PAYMENT',
                    isRead: false
                  }))
                })
              }
            } else {
              console.log('Event registration not found for payment:', {
                eventId,
                paymentIntentId: paymentIntent.id
              })
            }
          } catch (error) {
            console.error('Error processing mock event registration payment:', error)
          }
        } else {
          console.log('Missing courseId, eventId, or userId in mock payment metadata:', {
            courseId,
            eventId,
            userId,
            metadata: paymentIntent.metadata
          })
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = body.data.object
        console.log('Mock Payment failed:', failedPayment.id)
        break

      case 'payment_intent.requires_action':
        const actionRequired = body.data.object
        console.log('Mock Payment requires action:', actionRequired.id)
        break

      default:
        console.log(`Unhandled mock event type: ${body.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Mock webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
