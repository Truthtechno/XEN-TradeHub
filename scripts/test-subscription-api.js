#!/usr/bin/env node

/**
 * Test subscription API endpoints
 */

const fetch = require('node-fetch')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000'

async function createTestUserAndSession() {
  console.log('👤 Creating test user and session...')
  
  try {
    // Create or get test user
    let testUser = await prisma.user.findUnique({
      where: { email: 'test-subscription@example.com' }
    })
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test-subscription@example.com',
          name: 'Test Subscription User',
          role: 'STUDENT'
        }
      })
    }
    
    console.log('✅ Test user ready:', testUser.id)
    return testUser
  } catch (error) {
    console.error('❌ Failed to create test user:', error)
    throw error
  }
}

async function testSubscriptionCreation() {
  console.log('🧪 Testing subscription creation API...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/payments/signals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Mock authentication by setting a cookie
        'Cookie': 'next-auth.session-token=mock-session-token'
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
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    if (response.ok && data.success) {
      console.log('✅ Subscription creation test passed')
      return data.subscription?.id
    } else {
      console.log('❌ Subscription creation test failed')
      return null
    }
  } catch (error) {
    console.error('❌ Subscription creation test error:', error.message)
    return null
  }
}

async function testSubscriptionStatus() {
  console.log('🧪 Testing subscription status API...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/payments/signals`, {
      method: 'GET',
      headers: {
        'Cookie': 'next-auth.session-token=mock-session-token'
      }
    })
    
    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    if (response.ok && data.success) {
      console.log('✅ Subscription status test passed')
      return data.subscription
    } else {
      console.log('❌ Subscription status test failed')
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
        'Authorization': 'Bearer your-secure-cron-secret-here',
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    if (response.ok && data.success) {
      console.log('✅ Billing cron test passed')
      return true
    } else {
      console.log('❌ Billing cron test failed')
      return false
    }
  } catch (error) {
    console.error('❌ Billing cron test error:', error.message)
    return false
  }
}

async function testSubscriptionCancellation(subscriptionId) {
  console.log('🧪 Testing subscription cancellation...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=mock-session-token'
      },
      body: JSON.stringify({
        subscriptionId: subscriptionId,
        reason: 'TEST_CANCELLATION'
      })
    })
    
    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    if (response.ok && data.success) {
      console.log('✅ Subscription cancellation test passed')
      return true
    } else {
      console.log('❌ Subscription cancellation test failed')
      return false
    }
  } catch (error) {
    console.error('❌ Subscription cancellation test error:', error.message)
    return false
  }
}

async function runApiTests() {
  console.log('🚀 Starting API tests...\n')
  
  const results = {
    userCreation: false,
    subscriptionCreation: false,
    subscriptionStatus: false,
    billingCron: false,
    subscriptionCancellation: false
  }
  
  // Test 1: Create test user
  try {
    await createTestUserAndSession()
    results.userCreation = true
    console.log('')
  } catch (error) {
    console.log('❌ User creation failed')
    console.log('')
  }
  
  // Test 2: Subscription creation
  const subscriptionId = await testSubscriptionCreation()
  results.subscriptionCreation = !!subscriptionId
  console.log('')
  
  // Test 3: Subscription status
  const subscription = await testSubscriptionStatus()
  results.subscriptionStatus = !!subscription
  console.log('')
  
  // Test 4: Billing cron
  results.billingCron = await testBillingCron()
  console.log('')
  
  // Test 5: Subscription cancellation (if we have a subscription)
  if (subscriptionId) {
    results.subscriptionCancellation = await testSubscriptionCancellation(subscriptionId)
  } else {
    console.log('⚠️  Skipping cancellation test - no subscription ID')
  }
  console.log('')
  
  // Summary
  console.log('📊 API Test Results Summary:')
  console.log('============================')
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`)
  })
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All API tests passed! The subscription system is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.')
  }
  
  return results
}

// Run tests if this script is executed directly
if (require.main === module) {
  runApiTests().catch(console.error)
}

module.exports = {
  runApiTests,
  testSubscriptionCreation,
  testSubscriptionStatus,
  testBillingCron,
  testSubscriptionCancellation
}
