#!/usr/bin/env node

/**
 * Simple test to create a subscription with minimal required fields
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSimpleSubscription() {
  console.log('🧪 Testing simple subscription creation...')
  
  try {
    // Create a test user first
    const testUser = await prisma.user.create({
      data: {
        email: 'test-simple@example.com',
        name: 'Test Simple User',
        role: 'STUDENT'
      }
    })
    
    console.log('✅ Created test user:', testUser.id)
    
    // Try to create a subscription with minimal data
    const now = new Date()
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const subscription = await prisma.signalSubscription.create({
      data: {
        userId: testUser.id,
        status: 'ACTIVE',
        plan: 'MONTHLY',
        amountUSD: 50.0,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        startedAt: now,
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        nextBillingDate: nextMonth,
        maxFailedPayments: 3
      }
    })
    
    console.log('✅ Successfully created subscription:', subscription.id)
    console.log('Available fields:', Object.keys(subscription))
    
    // Test querying
    const foundSubscription = await prisma.signalSubscription.findFirst({
      where: {
        userId: testUser.id,
        status: 'ACTIVE'
      }
    })
    
    console.log('✅ Successfully queried subscription:', foundSubscription?.id)
    
    // Clean up
    await prisma.signalSubscription.delete({
      where: { id: subscription.id }
    })
    
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    
    console.log('✅ Cleaned up test data')
    console.log('🎉 Simple subscription test passed!')
    
  } catch (error) {
    console.error('❌ Simple subscription test failed:', error.message)
    
    // Try to get the schema information
    try {
      const subscriptions = await prisma.signalSubscription.findMany({
        take: 1
      })
      
      if (subscriptions.length > 0) {
        console.log('Available fields from existing record:', Object.keys(subscriptions[0]))
      } else {
        console.log('No existing subscriptions found')
      }
    } catch (schemaError) {
      console.error('❌ Error getting schema info:', schemaError.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testSimpleSubscription().catch(console.error)
}

module.exports = { testSimpleSubscription }
