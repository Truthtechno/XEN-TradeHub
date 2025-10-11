import { prisma } from '@/lib/prisma'
import { paymentGateway } from '@/lib/payment-gateway'
import { addMonths, addDays, isAfter, isBefore, subDays } from 'date-fns'

export interface SubscriptionBillingResult {
  success: boolean
  subscriptionId: string
  billingId?: string
  error?: string
  status?: string
  nextBillingDate?: Date
}

export interface BillingRetryConfig {
  maxRetries: number
  retryIntervals: number[] // in days
  gracePeriodDays: number
}

export class SubscriptionBillingService {
  private retryConfig: BillingRetryConfig = {
    maxRetries: 3,
    retryIntervals: [1, 3, 7], // 1 day, 3 days, 7 days
    gracePeriodDays: 3
  }

  /**
   * Create a new signal subscription with billing setup
   */
  async createSubscription(
    userId: string,
    plan: 'MONTHLY' | 'YEARLY' = 'MONTHLY',
    paymentMethodId?: string
  ): Promise<SubscriptionBillingResult> {
    try {
      const now = new Date()
      const amountUSD = plan === 'MONTHLY' ? 50.0 : 500.0 // $50/month or $500/year
      const billingCycle = plan === 'MONTHLY' ? 'MONTHLY' : 'YEARLY'
      
      // Calculate billing dates
      const currentPeriodStart = now
      const currentPeriodEnd = plan === 'MONTHLY' 
        ? addMonths(now, 1) 
        : addMonths(now, 12)
      const nextBillingDate = currentPeriodEnd

      // Check if user already has an active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: {
            in: ['ACTIVE', 'PAST_DUE', 'GRACE_PERIOD']
          }
        }
      })

      if (existingSubscription) {
        return {
          success: false,
          subscriptionId: existingSubscription.id,
          error: 'User already has an active subscription'
        }
      }

      // Create subscription
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          status: 'ACTIVE',
          plan: plan as any,
          currentPeriodStart,
          currentPeriodEnd
        }
      })

      // Process initial payment
      const paymentResult = await this.processBilling(subscription.id)

      return {
        success: paymentResult.success,
        subscriptionId: subscription.id,
        billingId: paymentResult.billingId,
        error: paymentResult.error,
        status: paymentResult.status,
        nextBillingDate: subscription.currentPeriodEnd || undefined
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      return {
        success: false,
        subscriptionId: '',
        error: error instanceof Error ? error.message : 'Failed to create subscription'
      }
    }
  }

  /**
   * Process billing for a subscription
   */
  async processBilling(subscriptionId: string): Promise<SubscriptionBillingResult> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { user: true }
      })

      if (!subscription) {
        return {
          success: false,
          subscriptionId,
          error: 'Subscription not found'
        }
      }

      // Create billing record
      const billingRecord = await prisma.order.create({
        data: {
          userId: subscription.userId,
          amount: 50.0,
          currency: 'USD',
          status: 'PENDING'
        }
      })

      try {
        // Process payment
        const paymentResult = await paymentGateway.createPaymentIntent(
          5000, // $50.00 in cents
          'USD',
          {
            subscriptionId,
            userId: subscription.userId,
            billingId: billingRecord.id,
            type: 'subscription_billing'
          }
        )

        if (paymentResult.success && paymentResult.paymentIntentId) {
          // Confirm payment
          const confirmResult = await paymentGateway.confirmPayment(
            paymentResult.paymentIntentId,
            {}
          )

          if (confirmResult.success) {
            // Update billing record
            await prisma.order.update({
              where: { id: billingRecord.id },
              data: {
                status: 'SUCCEEDED'
              }
            })

            // Update subscription
            const nextBillingDate = addMonths(new Date(), 1)

            await prisma.subscription.update({
              where: { id: subscriptionId },
              data: {
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: nextBillingDate
              }
            })

            return {
              success: true,
              subscriptionId,
              billingId: billingRecord.id,
              status: 'SUCCEEDED',
              nextBillingDate
            }
          } else {
            // Payment failed
            await this.handlePaymentFailure(subscriptionId, billingRecord.id, confirmResult.error || 'Payment confirmation failed')
            return {
              success: false,
              subscriptionId,
              billingId: billingRecord.id,
              error: confirmResult.error || 'Payment confirmation failed',
              status: 'FAILED'
            }
          }
        } else {
          // Payment intent creation failed
          await this.handlePaymentFailure(subscriptionId, billingRecord.id, paymentResult.error || 'Payment intent creation failed')
          return {
            success: false,
            subscriptionId,
            billingId: billingRecord.id,
            error: paymentResult.error || 'Payment intent creation failed',
            status: 'FAILED'
          }
        }
      } catch (paymentError) {
        await this.handlePaymentFailure(subscriptionId, billingRecord.id, paymentError instanceof Error ? paymentError.message : 'Payment processing error')
        return {
          success: false,
          subscriptionId,
          billingId: billingRecord.id,
          error: paymentError instanceof Error ? paymentError.message : 'Payment processing error',
          status: 'FAILED'
        }
      }
    } catch (error) {
      console.error('Error processing billing:', error)
      return {
        success: false,
        subscriptionId,
        error: error instanceof Error ? error.message : 'Failed to process billing'
      }
    }
  }

  /**
   * Handle payment failure and retry logic
   */
  private async handlePaymentFailure(
    subscriptionId: string,
    billingId: string,
    reason: string
  ): Promise<void> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId }
      })

      if (!subscription) return

      const newFailedCount = 1
      const isLastRetry = newFailedCount >= 3

      // Update billing record
      await prisma.order.update({
        where: { id: billingId },
        data: {
          status: isLastRetry ? 'FAILED' : 'RETRYING'
        }
      })

      if (isLastRetry) {
        // Cancel subscription
        await this.cancelSubscription(subscriptionId, 'PAYMENT_FAILURE')
      } else {
        // Update subscription for retry
        const gracePeriodEndsAt = addDays(new Date(), this.retryConfig.gracePeriodDays)
        
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'PAST_DUE'
          }
        })
      }
    } catch (error) {
      console.error('Error handling payment failure:', error)
    }
  }

  /**
   * Calculate next retry date based on retry count
   */
  private calculateNextRetryDate(retryCount: number): Date {
    const intervalIndex = Math.min(retryCount - 1, this.retryConfig.retryIntervals.length - 1)
    const daysToAdd = this.retryConfig.retryIntervals[intervalIndex]
    return addDays(new Date(), daysToAdd)
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, reason: string = 'USER_REQUEST'): Promise<boolean> {
    try {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'CANCELED'
        }
      })

      // Update user role back to STUDENT
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        select: { userId: true }
      })

      if (subscription) {
        await prisma.user.update({
          where: { id: subscription.userId },
          data: { role: 'STUDENT' }
        })
      }

      console.log(`Subscription ${subscriptionId} canceled. Reason: ${reason}`)
      return true
    } catch (error) {
      console.error('Error canceling subscription:', error)
      return false
    }
  }

  /**
   * Process all due subscriptions (cron job)
   */
  async processDueSubscriptions(): Promise<{ processed: number; successful: number; failed: number }> {
    try {
      const now = new Date()
      
      // Find subscriptions that are due for billing
      const dueSubscriptions = await prisma.subscription.findMany({
        where: {
          status: {
            in: ['ACTIVE', 'PAST_DUE']
          },
          currentPeriodEnd: {
            lte: now
          }
        },
        include: { user: true }
      })

      let processed = 0
      let successful = 0
      let failed = 0

      for (const subscription of dueSubscriptions) {
        processed++
        
        const result = await this.processBilling(subscription.id)
        
        if (result.success) {
          successful++
        } else {
          failed++
        }
      }

      console.log(`Processed ${processed} due subscriptions: ${successful} successful, ${failed} failed`)
      
      return { processed, successful, failed }
    } catch (error) {
      console.error('Error processing due subscriptions:', error)
      return { processed: 0, successful: 0, failed: 0 }
    }
  }

  /**
   * Check and handle grace period expirations
   */
  async processGracePeriodExpirations(): Promise<{ expired: number }> {
    try {
      const now = new Date()
      
      // Find subscriptions in grace period that have expired
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'PAST_DUE'
        }
      })

      let expired = 0

      for (const subscription of expiredSubscriptions) {
        await this.cancelSubscription(subscription.id, 'GRACE_PERIOD_EXPIRED')
        expired++
      }

      console.log(`Expired ${expired} subscriptions from grace period`)
      
      return { expired }
    } catch (error) {
      console.error('Error processing grace period expirations:', error)
      return { expired: 0 }
    }
  }

  /**
   * Retry failed payments
   */
  async retryFailedPayments(): Promise<{ retried: number; successful: number; failed: number }> {
    try {
      const now = new Date()
      
      // Find billing records that are ready for retry
      const retryableBills = await prisma.order.findMany({
        where: {
          status: 'RETRYING'
        },
      })

      let retried = 0
      let successful = 0
      let failed = 0

      for (const billing of retryableBills) {
        retried++
        
        // Find subscription by userId
        const subscription = await prisma.subscription.findFirst({
          where: { userId: billing.userId, status: 'ACTIVE' }
        })
        
        if (!subscription) {
          failed++
          continue
        }
        
        const result = await this.processBilling(subscription.id)
        
        if (result.success) {
          successful++
        } else {
          failed++
        }
      }

      console.log(`Retried ${retried} failed payments: ${successful} successful, ${failed} failed`)
      
      return { retried, successful, failed }
    } catch (error) {
      console.error('Error retrying failed payments:', error)
      return { retried: 0, successful: 0, failed: 0 }
    }
  }

  /**
   * Get subscription status for a user
   */
  async getUserSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean
    subscription?: any
    nextBillingDate?: Date
    status?: string
  }> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: {
            in: ['ACTIVE', 'PAST_DUE', 'GRACE_PERIOD']
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return {
        hasActiveSubscription: !!subscription,
        subscription,
        nextBillingDate: subscription?.currentPeriodEnd || undefined,
        status: subscription?.status
      }
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return { hasActiveSubscription: false }
    }
  }
}

// Export singleton instance
export const subscriptionBilling = new SubscriptionBillingService()
