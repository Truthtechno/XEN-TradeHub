#!/usr/bin/env node

/**
 * Test login API endpoints
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testLoginAPI() {
  console.log('🧪 Testing login API...')
  
  const testCredentials = [
    { email: 'admin@xenforex.com', password: 'admin123', role: 'SUPERADMIN' },
    { email: 'analyst@xenforex.com', password: 'analyst123', role: 'ANALYST' },
    { email: 'editor@xenforex.com', password: 'editor123', role: 'EDITOR' }
  ]
  
  for (const cred of testCredentials) {
    console.log(`\n🔐 Testing login for ${cred.email}...`)
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cred.email,
          password: cred.password
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ Login successful for ${cred.email}`)
        console.log(`   Role: ${data.user?.role || 'Unknown'}`)
        console.log(`   Token received: ${data.token ? 'Yes' : 'No'}`)
      } else {
        console.log(`❌ Login failed for ${cred.email}`)
        console.log(`   Error: ${data.error || 'Unknown error'}`)
        console.log(`   Status: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ Network error for ${cred.email}: ${error.message}`)
    }
  }
  
  // Test invalid credentials
  console.log('\n🚫 Testing invalid credentials...')
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@xenforex.com',
        password: 'wrongpassword'
      })
    })
    
    const data = await response.json()
    
    if (response.status === 401) {
      console.log('✅ Invalid credentials properly rejected')
      console.log(`   Error: ${data.error}`)
    } else {
      console.log('❌ Invalid credentials not properly rejected')
      console.log(`   Status: ${response.status}`)
    }
  } catch (error) {
    console.log(`❌ Network error testing invalid credentials: ${error.message}`)
  }
}

// Run if this script is executed directly
if (require.main === module) {
  testLoginAPI().catch(console.error)
}

module.exports = { testLoginAPI }
