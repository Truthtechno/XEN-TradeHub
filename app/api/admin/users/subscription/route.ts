import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { AccessControlService } from '@/lib/access-control'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const accessControl = new AccessControlService()

// PUT /api/admin/users/subscription - Update user subscription
export async function PUT(request: NextRequest) {
  try {
    console.log('=== SUBSCRIPTION API CALLED ===')
    console.log('Request URL:', request.url)
    console.log('Request method:', request.method)
    
    // Get authenticated admin user
    const admin = await getAuthenticatedUserSimple(request)
    console.log('Admin user:', admin)
    
    if (!admin) {
      console.log('No admin user found - returning 401')
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    // Check if user is admin
    const adminRoles = ['SUPERADMIN', 'ADMIN']
    if (!adminRoles.includes(admin.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    // Validate request body
    const subscriptionUpdateSchema = z.object({
      userId: z.string().min(1),
      subscriptionType: z.enum(['NONE', 'SIGNALS', 'PREMIUM']),
      plan: z.enum(['MONTHLY', 'YEARLY']).optional(),
      reason: z.string().optional()
    })

    const validatedData = subscriptionUpdateSchema.parse(body)
    console.log('Validated data:', validatedData)
    
    // Get current user data
    console.log('Looking for user with ID:', validatedData.userId)
    const currentUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true
          }
        }
      }
    })
    console.log('Current user found:', currentUser)

    if (!currentUser) {
      console.log('User not found in database')
      return NextResponse.json({ 
        success: false,
        message: 'User not found' 
      }, { status: 404 })
    }

    console.log('Admin subscription update:', {
      adminId: admin.id,
      adminEmail: admin.email,
      userId: currentUser.id,
      userEmail: currentUser.email,
      currentRole: currentUser.role,
      newSubscriptionType: validatedData.subscriptionType,
      reason: validatedData.reason
    })

    let result: any = { success: true, message: 'Subscription updated successfully' }

    try {
      // Handle different subscription types
      if (validatedData.subscriptionType === 'NONE') {
        console.log('Removing all subscriptions and downgrading to STUDENT')
        // Remove all subscriptions and downgrade to STUDENT
        await prisma.subscription.deleteMany({
          where: { userId: validatedData.userId }
        })
        
        await prisma.user.update({
          where: { id: validatedData.userId },
          data: { 
            role: 'STUDENT'
          }
        })

        result.message = 'User downgraded to STUDENT - all subscriptions removed'

      } else if (validatedData.subscriptionType === 'SIGNALS') {
        console.log('Creating signals subscription')
        // Create or update signals subscription
        const plan = validatedData.plan || 'MONTHLY'
        
        // Remove existing subscriptions first
        await prisma.subscription.deleteMany({
          where: { userId: validatedData.userId }
        })

        // Create new signals subscription
        const subscriptionResult = await accessControl.createSignalsSubscription(
          validatedData.userId, 
          plan as 'MONTHLY' | 'YEARLY'
        )

        console.log('Signals subscription result:', subscriptionResult)

        if (!subscriptionResult.success) {
          return NextResponse.json({ 
            success: false,
            message: subscriptionResult.message 
          }, { status: 400 })
        }

        result.message = `User upgraded to SIGNALS with ${plan} subscription`

      } else if (validatedData.subscriptionType === 'PREMIUM') {
        console.log('Creating premium subscription')
        // Create or update premium subscription
        
        // Remove existing subscriptions first
        await prisma.subscription.deleteMany({
          where: { userId: validatedData.userId }
        })

        // Create premium subscription
        const premiumResult = await accessControl.upgradeToPremium(validatedData.userId, 1500)

        console.log('Premium subscription result:', premiumResult)

        if (!premiumResult.success) {
          return NextResponse.json({ 
            success: false,
            message: premiumResult.message 
          }, { status: 400 })
        }

        result.message = 'User upgraded to PREMIUM with mentorship access'
      }
    } catch (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError)
      return NextResponse.json({ 
        success: false,
        message: 'Failed to update subscription',
        error: subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'UPDATE_SUBSCRIPTION',
        entity: 'User',
        entityId: validatedData.userId,
        diff: {
          subscriptionType: validatedData.subscriptionType,
          plan: validatedData.plan,
          reason: validatedData.reason
        }
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating user subscription:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
