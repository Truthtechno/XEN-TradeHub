/**
 * Premium Status Sync Test
 * Tests that premium status changes in admin are properly reflected in student portal
 */

const BASE_URL = 'http://localhost:3000'

// Test data
const testStudent = {
  email: 'premium.test@example.com',
  password: 'testpassword123',
  name: 'Premium Test Student'
}

const testAdmin = {
  email: 'admin@corefx.com',
  password: 'adminpassword123'
}

// Helper functions
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    return { response, data }
  } catch (error) {
    console.error('Request failed:', error)
    return { response: null, data: { error: error.message } }
  }
}

async function loginAsStudent() {
  console.log('🔐 Logging in as student...')
  const { response, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(testStudent)
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Student login successful')
    return data.token
  } else {
    console.log('❌ Student login failed:', data.message)
    return null
  }
}

async function loginAsAdmin() {
  console.log('🔐 Logging in as admin...')
  const { response, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(testAdmin)
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Admin login successful')
    return data.token
  } else {
    console.log('❌ Admin login failed:', data.message)
    return null
  }
}

async function checkStudentAccess(token) {
  console.log('🔍 Checking student access...')
  const { response, data } = await makeRequest('/api/user/access', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Student access check successful')
    return data.data
  } else {
    console.log('❌ Student access check failed:', data.message)
    return null
  }
}

async function createTestRegistration(adminToken) {
  console.log('📝 Creating test registration...')
  const { response, data } = await makeRequest('/api/admin/mentorship', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: testStudent.name,
      email: testStudent.email,
      phone: '+1234567890',
      country: 'United States',
      experience: 'Beginner',
      goals: 'Learn trading strategies'
    })
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Test registration created')
    return data.data
  } else {
    console.log('❌ Test registration creation failed:', data.message)
    return null
  }
}

async function upgradeStudentToPremium(adminToken, registrationId) {
  console.log('⬆️ Upgrading student to premium...')
  const { response, data } = await makeRequest(`/api/admin/mentorship/${registrationId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'PAID',
      upgradeToPremium: true
    })
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Student upgraded to premium')
    return data.data
  } else {
    console.log('❌ Student upgrade failed:', data.message)
    return null
  }
}

async function downgradeStudentFromPremium(adminToken, registrationId) {
  console.log('⬇️ Downgrading student from premium...')
  const { response, data } = await makeRequest(`/api/admin/mentorship/${registrationId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'CANCELLED',
      upgradeToPremium: false
    })
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Student downgraded from premium')
    return data.data
  } else {
    console.log('❌ Student downgrade failed:', data.message)
    return null
  }
}

async function testPremiumSync() {
  console.log('🚀 Starting Premium Status Sync Test\n')
  console.log('=' * 60)
  
  const results = {
    studentLogin: false,
    adminLogin: false,
    initialAccessCheck: false,
    registrationCreation: false,
    premiumUpgrade: false,
    accessAfterUpgrade: false,
    premiumDowngrade: false,
    accessAfterDowngrade: false
  }
  
  try {
    // Step 1: Login as student
    const studentToken = await loginAsStudent()
    results.studentLogin = !!studentToken
    
    if (!studentToken) {
      console.log('❌ Cannot proceed without student login')
      return results
    }
    
    // Step 2: Check initial access (should be basic)
    const initialAccess = await checkStudentAccess(studentToken)
    results.initialAccessCheck = !!initialAccess
    
    if (initialAccess) {
      console.log(`📊 Initial access - Subscription: ${initialAccess.subscriptionType}, Mentorship: ${initialAccess.mentorship}`)
    }
    
    // Step 3: Login as admin
    const adminToken = await loginAsAdmin()
    results.adminLogin = !!adminToken
    
    if (!adminToken) {
      console.log('❌ Cannot proceed without admin login')
      return results
    }
    
    // Step 4: Create test registration
    const registration = await createTestRegistration(adminToken)
    results.registrationCreation = !!registration
    
    if (!registration) {
      console.log('❌ Cannot proceed without registration')
      return results
    }
    
    // Step 5: Upgrade student to premium via admin
    const upgradedRegistration = await upgradeStudentToPremium(adminToken, registration.id)
    results.premiumUpgrade = !!upgradedRegistration
    
    if (!upgradedRegistration) {
      console.log('❌ Premium upgrade failed')
      return results
    }
    
    // Step 6: Check student access after upgrade (should be premium)
    const accessAfterUpgrade = await checkStudentAccess(studentToken)
    results.accessAfterUpgrade = !!accessAfterUpgrade
    
    if (accessAfterUpgrade) {
      console.log(`📊 Access after upgrade - Subscription: ${accessAfterUpgrade.subscriptionType}, Mentorship: ${accessAfterUpgrade.mentorship}`)
      
      // Verify premium status
      if (accessAfterUpgrade.subscriptionType === 'PREMIUM' && accessAfterUpgrade.mentorship) {
        console.log('✅ Premium status correctly applied to student')
      } else {
        console.log('❌ Premium status not correctly applied to student')
      }
    }
    
    // Step 7: Downgrade student from premium via admin
    const downgradedRegistration = await downgradeStudentFromPremium(adminToken, registration.id)
    results.premiumDowngrade = !!downgradedRegistration
    
    if (!downgradedRegistration) {
      console.log('❌ Premium downgrade failed')
      return results
    }
    
    // Step 8: Check student access after downgrade (should be basic)
    const accessAfterDowngrade = await checkStudentAccess(studentToken)
    results.accessAfterDowngrade = !!accessAfterDowngrade
    
    if (accessAfterDowngrade) {
      console.log(`📊 Access after downgrade - Subscription: ${accessAfterDowngrade.subscriptionType}, Mentorship: ${accessAfterDowngrade.mentorship}`)
      
      // Verify downgrade
      if (accessAfterDowngrade.subscriptionType !== 'PREMIUM' && !accessAfterDowngrade.mentorship) {
        console.log('✅ Premium status correctly removed from student')
      } else {
        console.log('❌ Premium status not correctly removed from student')
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
  
  // Print results
  console.log('\n' + '=' * 60)
  console.log('📊 PREMIUM SYNC TEST RESULTS')
  console.log('=' * 60)
  
  const testNames = {
    studentLogin: 'Student Login',
    adminLogin: 'Admin Login',
    initialAccessCheck: 'Initial Access Check',
    registrationCreation: 'Registration Creation',
    premiumUpgrade: 'Premium Upgrade',
    accessAfterUpgrade: 'Access After Upgrade',
    premiumDowngrade: 'Premium Downgrade',
    accessAfterDowngrade: 'Access After Downgrade'
  }
  
  let passedTests = 0
  let totalTests = 0
  
  for (const [key, passed] of Object.entries(results)) {
    totalTests++
    if (passed) passedTests++
    console.log(`${passed ? '✅' : '❌'} ${testNames[key]}`)
  }
  
  console.log('=' * 60)
  console.log(`🎯 Tests Passed: ${passedTests}/${totalTests}`)
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All premium sync tests passed! The system is working correctly.')
  } else {
    console.log('⚠️ Some premium sync tests failed. Please check the implementation.')
  }
  
  return results
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  testPremiumSync().catch(console.error)
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testPremiumSync,
    checkStudentAccess,
    upgradeStudentToPremium,
    downgradeStudentFromPremium
  }
}
