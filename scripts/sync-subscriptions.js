const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function syncUserSubscriptionStatus(userId) {
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
      return { success: false, message: 'User not found' }
    }

    // Check if user has mentorship payment (should be PREMIUM)
    const hasMentorshipPayment = user.mentorshipPayments.length > 0
    const isPremiumRole = user.role === 'PREMIUM'

    if (hasMentorshipPayment && !isPremiumRole) {
      // User has mentorship payment but wrong role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: 'PREMIUM' }
      })
      console.log('Fixed user role to PREMIUM:', updatedUser.email)
      return { success: true, message: 'User role synced to PREMIUM' }
    }

    // Check if user has active signals subscription (should be SIGNALS)
    const hasActiveSignalsSubscription = user.subscription && 
      user.subscription.status === 'ACTIVE' &&
      user.subscription.currentPeriodEnd &&
      new Date(user.subscription.currentPeriodEnd) > new Date()

    if (hasActiveSignalsSubscription && user.role !== 'SIGNALS') {
      // User has active signals subscription but wrong role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: 'SIGNALS' }
      })
      console.log('Fixed user role to SIGNALS:', updatedUser.email)
      return { success: true, message: 'User role synced to SIGNALS' }
    }

    // Check if user has expired subscription (should be STUDENT)
    if (user.subscription && 
        user.subscription.status === 'ACTIVE' &&
        user.subscription.currentPeriodEnd &&
        new Date(user.subscription.currentPeriodEnd) <= new Date() &&
        user.role === 'SIGNALS') {
      // User has expired signals subscription
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: { status: 'EXPIRED' }
      })
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: 'STUDENT' }
      })
      console.log('Fixed user role to STUDENT (expired subscription):', updatedUser.email)
      return { success: true, message: 'User role synced to STUDENT (subscription expired)' }
    }

    return { success: true, message: 'User subscription status is already correct' }
  } catch (error) {
    console.error('Error syncing user subscription status:', error)
    return { success: false, message: 'Failed to sync user subscription status' }
  }
}

async function syncAllUsers() {
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
        const result = await syncUserSubscriptionStatus(user.id)
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

async function main() {
  try {
    const result = await syncAllUsers()
    console.log('Final result:', result)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
