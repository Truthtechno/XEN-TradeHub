import { prisma } from './prisma'

export interface UserAccess {
  id: string
  email: string
  name: string
  role: string
  subscription?: {
    plan: string
    status: string
    currentPeriodEnd?: Date
  }
  mentorshipPayment?: {
    status: string
    amount: number
  }
}

export interface AccessPermissions {
  // Premium Signals Access
  premiumSignals: boolean
  
  // Premium Resources Access
  premiumResources: boolean
  
  // Premium Courses Access
  premiumCourses: boolean
  
  // Mentorship Access
  mentorship: boolean
  
  // Subscription Status
  subscriptionType: 'BASIC' | 'SIGNALS' | 'PREMIUM'
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'NONE'
  
  // Access Details
  accessDetails: {
    signalsAccess: {
      hasAccess: boolean
      reason: string
      expiresAt?: Date
    }
    resourcesAccess: {
      hasAccess: boolean
      reason: string
    }
    coursesAccess: {
      hasAccess: boolean
      reason: string
    }
    mentorshipAccess: {
      hasAccess: boolean
      reason: string
    }
  }
}

export class AccessControlService {
  /**
   * Get comprehensive access permissions for a user
   */
  async getUserAccess(userId: string): Promise<AccessPermissions> {
    try {
      // Get user with all related data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
          mentorshipPayments: {
            where: { status: 'completed' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      if (!user) {
        return this.getDefaultAccess()
      }

      return this.calculateAccessPermissions(user)
    } catch (error) {
      console.error('Error getting user access:', error)
      return this.getDefaultAccess()
    }
  }

  /**
   * Calculate access permissions based on user data
   */
  private calculateAccessPermissions(user: any): AccessPermissions {
    const now = new Date()
    
    // Check if user has mentorship payment (PREMIUM access)
    const hasMentorshipPayment = user.mentorshipPayments && user.mentorshipPayments.length > 0
    const isPremiumRole = user.role === 'PREMIUM'
    const isPremiumUser = hasMentorshipPayment || isPremiumRole

    // Check if user has active signals subscription
    const hasActiveSignalsSubscription = user.subscription && 
      user.subscription.status === 'ACTIVE' && 
      user.subscription.plan === 'MONTHLY' &&
      user.subscription.currentPeriodEnd && 
      new Date(user.subscription.currentPeriodEnd) > now

    // Determine subscription type
    let subscriptionType: 'BASIC' | 'SIGNALS' | 'PREMIUM' = 'BASIC'
    let subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'NONE' = 'NONE'

    if (isPremiumUser) {
      subscriptionType = 'PREMIUM'
      subscriptionStatus = 'ACTIVE'
    } else if (hasActiveSignalsSubscription) {
      subscriptionType = 'SIGNALS'
      subscriptionStatus = 'ACTIVE'
    } else if (user.subscription) {
      subscriptionStatus = 'EXPIRED'
    }

    // Calculate individual access permissions
    const signalsAccess = this.calculateSignalsAccess(user, isPremiumUser, hasActiveSignalsSubscription)
    const resourcesAccess = this.calculateResourcesAccess(user, isPremiumUser)
    const coursesAccess = this.calculateCoursesAccess(user, isPremiumUser)
    const mentorshipAccess = this.calculateMentorshipAccess(user, isPremiumUser)

    return {
      premiumSignals: signalsAccess.hasAccess,
      premiumResources: resourcesAccess.hasAccess,
      premiumCourses: coursesAccess.hasAccess,
      mentorship: mentorshipAccess.hasAccess,
      subscriptionType,
      subscriptionStatus,
      accessDetails: {
        signalsAccess,
        resourcesAccess,
        coursesAccess,
        mentorshipAccess
      }
    }
  }

  /**
   * Calculate signals access
   */
  private calculateSignalsAccess(user: any, isPremiumUser: boolean, hasActiveSignalsSubscription: boolean) {
    if (isPremiumUser) {
      return {
        hasAccess: true,
        reason: 'Premium user - full access to all signals'
      }
    }

    if (hasActiveSignalsSubscription) {
      return {
        hasAccess: true,
        reason: 'Active signals subscription',
        expiresAt: user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd) : undefined
      }
    }

    return {
      hasAccess: false,
      reason: 'Signals subscription required ($50/month)'
    }
  }

  /**
   * Calculate resources access
   */
  private calculateResourcesAccess(user: any, isPremiumUser: boolean) {
    if (isPremiumUser) {
      return {
        hasAccess: true,
        reason: 'Premium user - full access to all resources'
      }
    }

    return {
      hasAccess: false,
      reason: 'Premium subscription required or individual purchase'
    }
  }

  /**
   * Calculate courses access
   */
  private calculateCoursesAccess(user: any, isPremiumUser: boolean) {
    if (isPremiumUser) {
      return {
        hasAccess: true,
        reason: 'Premium user - full access to all courses'
      }
    }

    return {
      hasAccess: false,
      reason: 'Premium subscription required or individual purchase'
    }
  }

  /**
   * Calculate mentorship access
   */
  private calculateMentorshipAccess(user: any, isPremiumUser: boolean) {
    if (isPremiumUser) {
      return {
        hasAccess: true,
        reason: 'Premium user - mentorship access included'
      }
    }

    return {
      hasAccess: false,
      reason: 'Premium subscription required ($1500 one-time payment)'
    }
  }

  /**
   * Check if user has access to a specific resource
   */
  async checkResourceAccess(userId: string, resourceId: string): Promise<{
    hasAccess: boolean
    requiresPayment: boolean
    reason: string
    priceUSD?: number
    isIndividualPricing?: boolean
  }> {
    try {
      const access = await this.getUserAccess(userId)
      
      if (access.premiumResources) {
        return {
          hasAccess: true,
          requiresPayment: false,
          reason: 'Premium user - full access'
        }
      }

      // Check if user has purchased this specific resource
      const purchase = await prisma.resourcePurchase.findFirst({
        where: {
          userId,
          resourceId,
          status: 'COMPLETED'
        }
      })

      if (purchase) {
        return {
          hasAccess: true,
          requiresPayment: false,
          reason: 'Resource purchased individually'
        }
      }

      // Get resource details for pricing
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
        select: { title: true, priceUSD: true, isPremium: true }
      })

      if (!resource?.isPremium) {
        return {
          hasAccess: true,
          requiresPayment: false,
          reason: 'Free resource'
        }
      }

      return {
        hasAccess: false,
        requiresPayment: true,
        reason: 'Premium subscription required or individual purchase',
        priceUSD: resource.priceUSD || undefined,
        isIndividualPricing: !!resource.priceUSD
      }
    } catch (error) {
      console.error('Error checking resource access:', error)
      return {
        hasAccess: false,
        requiresPayment: true,
        reason: 'Error checking access'
      }
    }
  }

  /**
   * Check if user has access to premium signals
   */
  async checkSignalsAccess(userId: string): Promise<{
    hasAccess: boolean
    requiresPayment: boolean
    reason: string
    expiresAt?: Date
  }> {
    try {
      const access = await this.getUserAccess(userId)
      
      return {
        hasAccess: access.premiumSignals,
        requiresPayment: !access.premiumSignals,
        reason: access.accessDetails.signalsAccess.reason,
        expiresAt: access.accessDetails.signalsAccess.expiresAt
      }
    } catch (error) {
      console.error('Error checking signals access:', error)
      return {
        hasAccess: false,
        requiresPayment: true,
        reason: 'Error checking access'
      }
    }
  }

  /**
   * Check if user has access to courses
   */
  async checkCoursesAccess(userId: string, courseId?: string): Promise<{
    hasAccess: boolean
    requiresPayment: boolean
    reason: string
  }> {
    try {
      const access = await this.getUserAccess(userId)
      
      if (access.premiumCourses) {
        return {
          hasAccess: true,
          requiresPayment: false,
          reason: 'Premium user - full access'
        }
      }

      // Check if user is enrolled in the specific course
      if (courseId) {
        const enrollment = await prisma.courseEnrollment.findFirst({
          where: {
            userId,
            courseId
          }
        })

        if (enrollment) {
          return {
            hasAccess: true,
            requiresPayment: false,
            reason: 'Course enrolled'
          }
        }
      }

      return {
        hasAccess: false,
        requiresPayment: true,
        reason: access.accessDetails.coursesAccess.reason
      }
    } catch (error) {
      console.error('Error checking courses access:', error)
      return {
        hasAccess: false,
        requiresPayment: true,
        reason: 'Error checking access'
      }
    }
  }

  /**
   * Get default access (no permissions)
   */
  private getDefaultAccess(): AccessPermissions {
    return {
      premiumSignals: false,
      premiumResources: false,
      premiumCourses: false,
      mentorship: false,
      subscriptionType: 'BASIC',
      subscriptionStatus: 'NONE',
      accessDetails: {
        signalsAccess: {
          hasAccess: false,
          reason: 'Authentication required'
        },
        resourcesAccess: {
          hasAccess: false,
          reason: 'Authentication required'
        },
        coursesAccess: {
          hasAccess: false,
          reason: 'Authentication required'
        },
        mentorshipAccess: {
          hasAccess: false,
          reason: 'Authentication required'
        }
      }
    }
  }

  /**
   * Upgrade user to premium (mentorship payment)
   */
  async upgradeToPremium(userId: string, paymentAmount: number = 1500): Promise<{
    success: boolean
    message: string
    access?: AccessPermissions
  }> {
    try {
      if (paymentAmount !== 1500) {
        return {
          success: false,
          message: 'Invalid payment amount for premium upgrade'
        }
      }

      // Update user role to PREMIUM
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'PREMIUM' }
      })

      // Create mentorship payment record
      await prisma.mentorshipPayment.create({
        data: {
          userId,
          amount: paymentAmount,
          currency: 'USD',
          status: 'completed'
        }
      })

      // Get updated access permissions
      const access = await this.getUserAccess(userId)

      return {
        success: true,
        message: 'Successfully upgraded to premium',
        access
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error)
      return {
        success: false,
        message: 'Failed to upgrade to premium'
      }
    }
  }

  /**
   * Create signals subscription
   */
  async createSignalsSubscription(userId: string, plan: 'MONTHLY' | 'YEARLY' = 'MONTHLY'): Promise<{
    success: boolean
    message: string
    subscriptionId?: string
    access?: AccessPermissions
  }> {
    try {
      const now = new Date()
      const currentPeriodEnd = plan === 'MONTHLY' 
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

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
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          plan,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd
        }
      })

      // Update user role to SIGNALS
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'SIGNALS' }
      })

      // Get updated access permissions
      const access = await this.getUserAccess(userId)

      return {
        success: true,
        message: 'Signals subscription created successfully',
        subscriptionId: subscription.id,
        access
      }
    } catch (error) {
      console.error('Error creating signals subscription:', error)
      return {
        success: false,
        message: 'Failed to create signals subscription'
      }
    }
  }
}

// Export singleton instance
export const accessControl = new AccessControlService()
