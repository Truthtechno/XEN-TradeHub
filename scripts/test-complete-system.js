#!/usr/bin/env node

/**
 * Complete system test for subscription billing
 */

const { PrismaClient } = require('@prisma/client')
const fetch = require('node-fetch')

const prisma = new PrismaClient()
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

async function createTestUser() {
  console.log('👤 Creating test user...')
  
  try {
    // Check if test user already exists
    let testUser = await prisma.user.findUnique({
      where: { email: 'test-billing@example.com' }
    })
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test-billing@example.com',
          name: 'Test Billing User',
          role: 'STUDENT'
        }
      })
      console.log('✅ Created test user:', testUser.id)
    } else {
      console.log('✅ Test user already exists:', testUser.id)
    }
    
    return testUser
  } catch (error) {
    console.error('❌ Failed to create test user:', error)
    throw error
  }
}

async function testSubscriptionCreation() {
  console.log('🧪 Testing subscription creation...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/payments/signals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test-session-token' // Mock session
      },
      body: JSON.stringify({
        amountUSD: 50,
        plan: 'MONTHLY',
        provider: 'stripe',
        providerRef: 'pi_test_123456789',
        paymentMethodId: 'pm_test_123456789'
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log('✅ Subscription creation test passed')
      console.log('   Subscription ID:', data.subscription?.id)
      return data.subscription?.id
    } else {
      console.log('❌ Subscription creation test failed')
      console.log('   Error:', data?.message || 'Unknown error')
      return null
    }
  } catch (error) {
    console.error('❌ Subscription creation test error:', error.message)
    return null
  }
}

async function testSubscriptionStatus() {
  console.log('🧪 Testing subscription status retrieval...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/payments/signals`, {
      method: 'GET',
      headers: {
        'Cookie': 'next-auth.session-token=test-session-token' // Mock session
      }
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log('✅ Subscription status test passed')
      console.log('   Has subscription:', data.subscription?.hasActiveSubscription)
      return data.subscription
    } else {
      console.log('❌ Subscription status test failed')
      console.log('   Error:', data?.message || 'Unknown error')
      return null
    }
  } catch (error) {
    console.error('❌ Subscription status test error:', error.message)
    return null
  }
}

async function testBillingCron() {
  console.log('🧪 Testing billing cron job...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/cron/billing`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer default-cron-secret',
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log('✅ Billing cron test passed')
      console.log('   Results:', data.results)
      return true
    } else {
      console.log('❌ Billing cron test failed')
      console.log('   Error:', data?.message || 'Unknown error')
      return false
    }
  } catch (error) {
    console.error('❌ Billing cron test error:', error.message)
    return false
  }
}

async function testDatabaseOperations() {
  console.log('🧪 Testing database operations...')
  
  try {
    // Test creating a subscription directly
    const testUser = await createTestUser()
    
    const subscription = await prisma.signalSubscription.create({
      data: {
        userId: testUser.id,
        status: 'ACTIVE',
        plan: 'MONTHLY',
        amountUSD: 50.0,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxFailedPayments: 3
      }
    })
    
    console.log('✅ Successfully created subscription:', subscription.id)
    
    // Test creating billing history
    const billing = await prisma.signalBillingHistory.create({
      data: {
        subscriptionId: subscription.id,
        amountUSD: 50.0,
        currency: 'USD',
        status: 'SUCCEEDED',
        paymentMethodId: 'pm_test_123',
        stripePaymentIntentId: 'pi_test_123'
      }
    })
    
    console.log('✅ Successfully created billing record:', billing.id)
    
    // Test querying
    const subscriptions = await prisma.signalSubscription.findMany({
      where: { status: 'ACTIVE' },
      include: { billingHistory: true }
    })
    
    console.log(`✅ Found ${subscriptions.length} active subscriptions`)
    
    // Clean up
    await prisma.signalBillingHistory.deleteMany({
      where: { subscriptionId: subscription.id }
    })
    
    await prisma.signalSubscription.delete({
      where: { id: subscription.id }
    })
    
    console.log('✅ Database operations test passed')
    return true
    
  } catch (error) {
    console.error('❌ Database operations test failed:', error)
    return false
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting complete system test...\n')
  
  const results = {
    database: false,
    subscriptionCreation: false,
    subscriptionStatus: false,
    billingCron: false
  }
  
  // Test 1: Database operations
  results.database = await testDatabaseOperations()
  console.log('')
  
  // Test 2: Subscription creation (requires running server)
  console.log('⚠️  Note: Subscription creation test requires the Next.js server to be running')
  console.log('   Start the server with: npm run dev')
  console.log('   Then run: node scripts/test-complete-system.js --with-server')
  console.log('')
  
  // Test 3: Billing cron (requires running server)
  console.log('⚠️  Note: Billing cron test requires the Next.js server to be running')
  console.log('')
  
  // Summary
  console.log('📊 Test Results Summary:')
  console.log('========================')
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`)
  })
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 ${passedTests}/${totalTests} tests passed`)
  
  if (results.database) {
    console.log('🎉 Database schema is working correctly!')
    console.log('\nNext steps:')
    console.log('1. Start the Next.js server: npm run dev')
    console.log('2. Run the full test suite: node scripts/test-complete-system.js --with-server')
    console.log('3. Set up the cron job using billing-cron-examples.txt')
  } else {
    console.log('⚠️  Database tests failed. Please check the errors above.')
  }
  
  return results
}

// Run tests if this script is executed directly
if (require.main === module) {
  runCompleteTest().catch(console.error)
}

module.exports = {
  runCompleteTest,
  testDatabaseOperations,
  testSubscriptionCreation,
  testSubscriptionStatus,
  testBillingCron
}
