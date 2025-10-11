#!/usr/bin/env node

/**
 * Script to check and process expired subscriptions
 * This can be run as a cron job every hour or daily
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSubscriptionExpiry() {
  try {
    console.log('=== CHECKING SUBSCRIPTION EXPIRY ===')
    console.log('Time:', new Date().toISOString())
    
    const now = new Date()
    
    // Find all active subscriptions that have expired
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: {
          lt: now // Less than current time = expired
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions`)

    if (expiredSubscriptions.length === 0) {
      console.log('No expired subscriptions found')
      return
    }

    let processed = 0
    let errors = 0

    for (const subscription of expiredSubscriptions) {
      try {
        console.log(`Processing expired subscription ${subscription.id} for user ${subscription.user.email}`)
        
        // Update subscription status to EXPIRED
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { 
            status: 'EXPIRED',
            updatedAt: now
          }
        })

        // Update user role back to STUDENT
        await prisma.user.update({
          where: { id: subscription.userId },
          data: { 
            role: 'STUDENT',
            updatedAt: now
          }
        })

        console.log(`✅ Expired subscription ${subscription.id} for user ${subscription.user.email}`)
        processed++

      } catch (error) {
        console.error(`❌ Error processing subscription ${subscription.id}:`, error)
        errors++
      }
    }

    console.log(`\n=== EXPIRY CHECK COMPLETE ===`)
    console.log(`Processed: ${processed}`)
    console.log(`Errors: ${errors}`)
    console.log(`Total: ${expiredSubscriptions.length}`)

    // Also check for subscriptions expiring soon (within 3 days)
    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: {
          gte: now, // Greater than or equal to now
          lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // Within 3 days
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (expiringSoon.length > 0) {
      console.log(`\n⚠️  ${expiringSoon.length} subscriptions expiring soon:`)
      expiringSoon.forEach(sub => {
        const daysUntilExpiry = Math.ceil((new Date(sub.currentPeriodEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        console.log(`  - ${sub.user.email}: ${daysUntilExpiry} days (expires ${new Date(sub.currentPeriodEnd).toLocaleDateString()})`)
      })
    }

  } catch (error) {
    console.error('❌ Error in subscription expiry check:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkSubscriptionExpiry()
