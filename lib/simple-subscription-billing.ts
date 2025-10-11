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

export class SimpleSubscriptionBillingService {
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
          status: 'ACTIVE'
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
          plan: 'MONTHLY',
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
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
          amount: 50.0, // Default amount
          currency: 'USD',
          status: 'SUCCEEDED', // For now, assume success
        }
      })

      // Update subscription
      const nextBillingDate = addMonths(new Date(), 1)

      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
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
          status: 'ACTIVE',
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
          status: 'ACTIVE'
        },
        orderBy: { createdAt: 'desc' }
      })

      return {
        hasActiveSubscription: !!subscription,
        subscription,
        nextBillingDate: subscription?.currentPeriodEnd || undefined,
        status: subscription?.status || 'INACTIVE'
      }
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return { hasActiveSubscription: false }
    }
  }
}

// Export singleton instance
export const simpleSubscriptionBilling = new SimpleSubscriptionBillingService()
