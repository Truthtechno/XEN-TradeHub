import { prisma } from './prisma'
import { accessControl } from './access-control'

export interface PaymentProcessorResult {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
  subscription?: any
  payment?: any
}

export class PaymentProcessor {
  /**
   * Process mentorship payment and upgrade user to premium
   */
  static async processMentorshipPayment(
    userId: string,
    amount: number,
    currency: string = 'USD',
    stripeId?: string,
    registrationId?: string
  ): Promise<PaymentProcessorResult> {
    try {
      console.log('Processing mentorship payment for user:', userId, 'Amount:', amount)

      // Validate payment amount
      if (amount !== 1500) {
        return {
          success: false,
          message: 'Invalid payment amount for mentorship. Expected $1500.'
        }
      }

      // Check if user already has premium access
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          mentorshipPayments: {
            where: { status: 'completed' }
          }
        }
      })

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        }
      }

      if (user.role === 'PREMIUM' || user.mentorshipPayments.length > 0) {
        return {
          success: false,
          message: 'User already has premium access'
        }
      }

      // Create mentorship payment record
      const payment = await prisma.mentorshipPayment.create({
        data: {
          userId,
          registrationId: registrationId || null,
          amount,
          currency,
          status: 'completed',
          stripeId: stripeId || null
        }
      })

      console.log('Mentorship payment created:', payment.id)

      // Update user role to PREMIUM
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: 'PREMIUM' }
      })

      console.log('User upgraded to PREMIUM:', updatedUser.email)

      // If there's a registration, update its status
      if (registrationId) {
        await prisma.mentorshipRegistration.update({
          where: { id: registrationId },
          data: { status: 'PAID' }
        })
        console.log('Registration status updated to PAID')
      }

      return {
        success: true,
        message: 'Mentorship payment processed successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name || '',
          role: updatedUser.role
        },
        payment
      }
    } catch (error) {
      console.error('Error processing mentorship payment:', error)
      return {
        success: false,
        message: 'Failed to process mentorship payment'
      }
    }
  }

  /**
   * Process signals subscription payment
   */
  static async processSignalsPayment(
    userId: string,
    plan: 'MONTHLY' | 'YEARLY' = 'MONTHLY',
    amount: number = 50,
    currency: string = 'USD',
    stripeId?: string
  ): Promise<PaymentProcessorResult> {
    try {
      console.log('Processing signals payment for user:', userId, 'Plan:', plan, 'Amount:', amount)

      // Validate payment amount
      if (amount !== 50) {
        return {
          success: false,
          message: 'Invalid payment amount for signals. Expected $50.'
        }
      }

      // Check if user already has active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE'
        }
      })

      if (existingSubscription) {
        return {
          success: false,
          message: 'User already has an active subscription'
        }
      }

      // Create subscription
      const now = new Date()
      const currentPeriodEnd = plan === 'MONTHLY' 
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

      const subscription = await prisma.subscription.create({
        data: {
          userId,
          plan,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd,
          stripeId: stripeId || null
        }
      })

      console.log('Signals subscription created:', subscription.id)

      // Update user role to SIGNALS
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: 'SIGNALS' }
      })

      console.log('User role updated to SIGNALS:', updatedUser.email)

      return {
        success: true,
        message: 'Signals subscription created successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name || '',
          role: updatedUser.role
        },
        subscription
      }
    } catch (error) {
      console.error('Error processing signals payment:', error)
      return {
        success: false,
        message: 'Failed to process signals payment'
      }
    }
  }

  /**
   * Sync user subscription status based on their current data
   * This can be used to fix any inconsistencies
   */
  static async syncUserSubscriptionStatus(userId: string): Promise<PaymentProcessorResult> {
    try {
      console.log('Syncing subscription status for user:', userId)

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
          mentorshipPayments: {
            where: { status: 'completed' }
          }
        }
      })

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        }
      }

      // Check if user has mentorship payment (should be PREMIUM, but preserve SUPERADMIN)
      const hasMentorshipPayment = user.mentorshipPayments.length > 0
      const isPremiumRole = user.role === 'PREMIUM'
      const isSuperAdmin = user.role === 'SUPERADMIN'

      if (hasMentorshipPayment && !isPremiumRole && !isSuperAdmin) {
        // User has mentorship payment but wrong role (but don't change SUPERADMIN)
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role: 'PREMIUM' }
        })
        console.log('Fixed user role to PREMIUM:', updatedUser.email)
        return {
          success: true,
          message: 'User role synced to PREMIUM',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name || '',
            role: updatedUser.role
          }
        }
      }

      // Check if user has active signals subscription (should be SIGNALS)
      const hasActiveSignalsSubscription = user.subscription && 
        user.subscription.status === 'ACTIVE' &&
        user.subscription.currentPeriodEnd &&
        new Date(user.subscription.currentPeriodEnd) > new Date()

      if (hasActiveSignalsSubscription && user.role !== 'SIGNALS' && user.role !== 'SUPERADMIN') {
        // User has active signals subscription but wrong role (but don't change SUPERADMIN)
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role: 'SIGNALS' }
        })
        console.log('Fixed user role to SIGNALS:', updatedUser.email)
        return {
          success: true,
          message: 'User role synced to SIGNALS',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name || '',
            role: updatedUser.role
          }
        }
      }

      // Check if user has expired subscription (should be STUDENT, but preserve SUPERADMIN)
      if (user.subscription && 
          user.subscription.status === 'ACTIVE' &&
          user.subscription.currentPeriodEnd &&
          new Date(user.subscription.currentPeriodEnd) <= new Date() &&
          user.role === 'SIGNALS') {
        // User has expired signals subscription (but don't change SUPERADMIN)
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: { status: 'EXPIRED' }
        })
        
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role: 'STUDENT' }
        })
        console.log('Fixed user role to STUDENT (expired subscription):', updatedUser.email)
        return {
          success: true,
          message: 'User role synced to STUDENT (subscription expired)',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name || '',
            role: updatedUser.role
          }
        }
      }

      return {
        success: true,
        message: 'User subscription status is already correct',
        user: {
          id: user.id,
          email: user.email,
          name: user.name || '',
          role: user.role
        }
      }
    } catch (error) {
      console.error('Error syncing user subscription status:', error)
      return {
        success: false,
        message: 'Failed to sync user subscription status'
      }
    }
  }

  /**
   * Sync all users' subscription statuses
   */
  static async syncAllUsersSubscriptionStatus(): Promise<{
    processed: number
    fixed: number
    errors: number
  }> {
    try {
      console.log('Starting sync of all users subscription statuses...')

      const users = await prisma.user.findMany({
        include: {
          subscription: true,
          mentorshipPayments: {
            where: { status: 'completed' }
          }
        }
      })

      let processed = 0
      let fixed = 0
      let errors = 0

      for (const user of users) {
        try {
          const result = await this.syncUserSubscriptionStatus(user.id)
          processed++
          if (result.success && result.message.includes('synced')) {
            fixed++
          }
        } catch (error) {
          console.error(`Error syncing user ${user.email}:`, error)
          errors++
        }
      }

      console.log(`Sync completed: ${processed} processed, ${fixed} fixed, ${errors} errors`)
      return { processed, fixed, errors }
    } catch (error) {
      console.error('Error syncing all users:', error)
      return { processed: 0, fixed: 0, errors: 1 }
    }
  }
}

// Export singleton instance
export const paymentProcessor = PaymentProcessor
