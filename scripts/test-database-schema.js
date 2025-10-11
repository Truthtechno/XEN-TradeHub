#!/usr/bin/env node

/**
 * Test script to verify database schema is working correctly
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabaseSchema() {
  console.log('🧪 Testing database schema...')
  
  try {
    // Test creating a new subscription
    const testSubscription = await prisma.signalSubscription.create({
      data: {
        userId: 'test-user-123',
        status: 'ACTIVE',
        plan: 'MONTHLY',
        amountUSD: 50.0,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxFailedPayments: 3
      }
    })
    
    console.log('✅ Successfully created test subscription:', testSubscription.id)
    
    // Test creating billing history
    const testBilling = await prisma.signalBillingHistory.create({
      data: {
        subscriptionId: testSubscription.id,
        amountUSD: 50.0,
        currency: 'USD',
        status: 'SUCCEEDED',
        paymentMethodId: 'pm_test_123',
        stripePaymentIntentId: 'pi_test_123'
      }
    })
    
    console.log('✅ Successfully created test billing record:', testBilling.id)
    
    // Test querying subscriptions
    const subscriptions = await prisma.signalSubscription.findMany({
      where: { status: 'ACTIVE' },
      include: { billingHistory: true }
    })
    
    console.log(`✅ Found ${subscriptions.length} active subscriptions`)
    
    // Clean up test data
    await prisma.signalBillingHistory.deleteMany({
      where: { subscriptionId: testSubscription.id }
    })
    
    await prisma.signalSubscription.delete({
      where: { id: testSubscription.id }
    })
    
    console.log('✅ Cleaned up test data')
    console.log('🎉 Database schema test passed!')
    
  } catch (error) {
    console.error('❌ Database schema test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testDatabaseSchema().catch(console.error)
}

module.exports = { testDatabaseSchema }
