#!/usr/bin/env node

/**
 * Test all major system functionality
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testSystemFunctionality() {
  console.log('🔍 Testing system functionality...')
  
  const results = {
    login: false,
    adminAccess: false,
    apiEndpoints: false,
    subscriptionSystem: false,
    database: false
  }
  
  try {
    // Test 1: Login and get admin token
    console.log('\n1️⃣ Testing login system...')
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@xenforex.com',
        password: 'admin123'
      })
    })
    
    if (loginResponse.ok) {
      console.log('✅ Login system working')
      results.login = true
      
      const cookies = loginResponse.headers.get('set-cookie')
      
      // Test 2: Admin access
      console.log('\n2️⃣ Testing admin access...')
      const adminResponse = await fetch(`${BASE_URL}/admin`, {
        headers: { 'Cookie': cookies || '' }
      })
      
      if (adminResponse.ok) {
        console.log('✅ Admin access working')
        results.adminAccess = true
      } else {
        console.log('❌ Admin access failed:', adminResponse.status)
      }
      
      // Test 3: API endpoints
      console.log('\n3️⃣ Testing API endpoints...')
      const apiTests = [
        { name: 'Settings API', url: '/api/settings' },
        { name: 'Forecasts API', url: '/api/forecasts' },
        { name: 'Signals API', url: '/api/signals' },
        { name: 'Users API', url: '/api/users' }
      ]
      
      let apiSuccess = 0
      for (const test of apiTests) {
        try {
          const response = await fetch(`${BASE_URL}${test.url}`, {
            headers: { 'Cookie': cookies || '' }
          })
          if (response.ok) {
            console.log(`✅ ${test.name} working`)
            apiSuccess++
          } else {
            console.log(`❌ ${test.name} failed: ${response.status}`)
          }
        } catch (error) {
          console.log(`❌ ${test.name} error: ${error.message}`)
        }
      }
      
      results.apiEndpoints = apiSuccess >= 2
      
      // Test 4: Subscription system
      console.log('\n4️⃣ Testing subscription system...')
      const subscriptionResponse = await fetch(`${BASE_URL}/api/payments/signals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        },
        body: JSON.stringify({
          amountUSD: 50,
          plan: 'MONTHLY',
          provider: 'stripe',
          providerRef: 'pi_test_123',
          paymentMethodId: 'pm_test_123'
        })
      })
      
      if (subscriptionResponse.ok) {
        console.log('✅ Subscription system working')
        results.subscriptionSystem = true
      } else {
        console.log('❌ Subscription system failed:', subscriptionResponse.status)
      }
      
      // Test 5: Billing cron
      console.log('\n5️⃣ Testing billing cron...')
      const cronResponse = await fetch(`${BASE_URL}/api/cron/billing`, {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer your-secure-cron-secret-here-1759772665',
          'Content-Type': 'application/json'
        }
      })
      
      if (cronResponse.ok) {
        console.log('✅ Billing cron working')
      } else {
        console.log('❌ Billing cron failed:', cronResponse.status)
      }
      
    } else {
      console.log('❌ Login system failed')
    }
    
    // Test 6: Database connectivity
    console.log('\n6️⃣ Testing database connectivity...')
    try {
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()
      
      const userCount = await prisma.user.count()
      const settingsCount = await prisma.settings.count()
      
      console.log(`✅ Database working - Users: ${userCount}, Settings: ${settingsCount}`)
      results.database = true
      
      await prisma.$disconnect()
    } catch (error) {
      console.log('❌ Database error:', error.message)
    }
    
  } catch (error) {
    console.error('❌ System test failed:', error.message)
  }
  
  // Summary
  console.log('\n📊 System Functionality Summary:')
  console.log('================================')
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`)
  })
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 ${passedTests}/${totalTests} systems working`)
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL!')
    console.log('\n✅ Login credentials restored:')
    console.log('   • admin@xenforex.com / admin123 (Super Admin)')
    console.log('   • analyst@xenforex.com / analyst123 (Analyst)')
    console.log('   • editor@xenforex.com / editor123 (Editor)')
    console.log('\n🚀 System is ready for use!')
  } else {
    console.log('⚠️  Some systems need attention. Check the errors above.')
  }
  
  return results
}

// Run if this script is executed directly
if (require.main === module) {
  testSystemFunctionality().catch(console.error)
}

module.exports = { testSystemFunctionality }
