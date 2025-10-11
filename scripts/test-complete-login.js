#!/usr/bin/env node

/**
 * Test complete login flow including cookie handling
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testCompleteLogin() {
  console.log('🧪 Testing complete login flow...')
  
  const credentials = {
    email: 'admin@xenforex.com',
    password: 'admin123'
  }
  
  try {
    // Step 1: Test login API
    console.log('\n1️⃣ Testing login API...')
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    
    const loginData = await loginResponse.json()
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData.error)
      return
    }
    
    console.log('✅ Login successful')
    console.log('   User:', loginData.user.email)
    console.log('   Role:', loginData.user.role)
    
    // Extract cookies from response
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('   Cookies received:', cookies ? 'Yes' : 'No')
    
    if (cookies) {
      console.log('   Cookie details:', cookies)
    }
    
    // Step 2: Test /api/auth/me endpoint
    console.log('\n2️⃣ Testing /api/auth/me endpoint...')
    
    // Create a new request with cookies
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    const meData = await meResponse.json()
    
    if (meResponse.ok) {
      console.log('✅ /api/auth/me successful')
      console.log('   User:', meData.user.email)
      console.log('   Role:', meData.user.role)
    } else {
      console.log('❌ /api/auth/me failed:', meData.error)
    }
    
    // Step 3: Test admin page access
    console.log('\n3️⃣ Testing admin page access...')
    
    const adminResponse = await fetch(`${BASE_URL}/admin`, {
      method: 'GET',
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    console.log('   Admin page status:', adminResponse.status)
    console.log('   Admin page accessible:', adminResponse.ok ? 'Yes' : 'No')
    
    if (!adminResponse.ok) {
      const adminText = await adminResponse.text()
      console.log('   Admin page error:', adminText.substring(0, 200) + '...')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run if this script is executed directly
if (require.main === module) {
  testCompleteLogin().catch(console.error)
}

module.exports = { testCompleteLogin }
