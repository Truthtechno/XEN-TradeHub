/**
 * Comprehensive Mentorship System Test
 * Tests the complete flow from student registration to admin management
 */

const BASE_URL = 'http://localhost:3000'

// Test data
const testStudent = {
  email: 'test.student@example.com',
  password: 'testpassword123',
  name: 'Test Student'
}

const testAdmin = {
  email: 'admin@corefx.com',
  password: 'adminpassword123'
}

const testRegistration = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  countryCode: '+1',
  country: 'United States',
  experience: 'Beginner',
  schedulingPreferences: 'Weekend mornings preferred'
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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Test functions
async function testStudentSignup() {
  console.log('\n👤 Testing student signup...')
  
  const { response, data } = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(testStudent)
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Student signup successful')
    return data.token
  } else {
    console.log('❌ Student signup failed:', data.message)
    return null
  }
}

async function testStudentLogin() {
  console.log('\n🔐 Testing student login...')
  
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

async function testMentorshipRegistration(token) {
  console.log('\n📝 Testing mentorship registration...')
  
  const { response, data } = await makeRequest('/api/mentorship/register', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(testRegistration)
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Mentorship registration successful')
    console.log('Registration ID:', data.data.id)
    return data.data
  } else {
    console.log('❌ Mentorship registration failed:', data.message)
    return null
  }
}

async function testMentorshipPayment(token, registrationId) {
  console.log('\n💳 Testing mentorship payment...')
  
  const { response, data } = await makeRequest('/api/mentorship/payment', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      registrationId,
      amount: 1500,
      currency: 'USD'
    })
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Mentorship payment successful')
    console.log('Payment ID:', data.data.payment.id)
    console.log('Premium access granted:', data.data.access?.subscriptionType === 'PREMIUM')
    return data.data
  } else {
    console.log('❌ Mentorship payment failed:', data.message)
    return null
  }
}

async function testPremiumAccess(token) {
  console.log('\n🔓 Testing premium access...')
  
  const { response, data } = await makeRequest('/api/user/access', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Premium access check successful')
    console.log('Subscription Type:', data.data.subscriptionType)
    console.log('Mentorship Access:', data.data.mentorship)
    console.log('Premium Signals:', data.data.premiumSignals)
    console.log('Premium Resources:', data.data.premiumResources)
    return data.data
  } else {
    console.log('❌ Premium access check failed:', data.message)
    return null
  }
}

async function testPremiumSignalsAccess(token) {
  console.log('\n📊 Testing premium signals access...')
  
  const { response, data } = await makeRequest('/api/signals', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  
  if (response?.ok) {
    console.log('✅ Premium signals access successful')
    console.log('Signals count:', data.signals?.length || 0)
    return data
  } else {
    console.log('❌ Premium signals access failed:', data.message)
    return null
  }
}

async function testPremiumResourcesAccess(token) {
  console.log('\n📚 Testing premium resources access...')
  
  const { response, data } = await makeRequest('/api/resources', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  
  if (response?.ok) {
    console.log('✅ Premium resources access successful')
    console.log('Resources count:', data.resources?.length || 0)
    return data
  } else {
    console.log('❌ Premium resources access failed:', data.message)
    return null
  }
}

async function testAdminLogin() {
  console.log('\n👨‍💼 Testing admin login...')
  
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

async function testAdminViewRegistrations(adminToken) {
  console.log('\n📋 Testing admin view registrations...')
  
  const { response, data } = await makeRequest('/api/admin/mentorship', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` }
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Admin view registrations successful')
    console.log('Total registrations:', data.data.stats.totalRegistrations)
    console.log('Total revenue:', data.data.stats.totalRevenue)
    console.log('Registrations found:', data.data.registrations.length)
    return data.data
  } else {
    console.log('❌ Admin view registrations failed:', data.message)
    return null
  }
}

async function testAdminScheduleAppointment(adminToken, registrationId) {
  console.log('\n📅 Testing admin schedule appointment...')
  
  const appointmentData = {
    registrationId,
    title: 'Initial Strategy Session',
    description: 'Discuss trading goals and current strategy',
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    meetingLink: 'https://zoom.us/j/123456789',
    notes: 'Focus on risk management'
  }

  const { response, data } = await makeRequest('/api/admin/mentorship/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(appointmentData)
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Admin schedule appointment successful')
    console.log('Appointment ID:', data.data.id)
    console.log('Scheduled for:', new Date(data.data.scheduledAt).toLocaleString())
    return data.data
  } else {
    console.log('❌ Admin schedule appointment failed:', data.message)
    return null
  }
}

async function testAdminViewAppointments(adminToken) {
  console.log('\n📋 Testing admin view appointments...')
  
  const { response, data } = await makeRequest('/api/admin/mentorship/appointments', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` }
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Admin view appointments successful')
    console.log('Total appointments:', data.data.pagination.total)
    return data.data
  } else {
    console.log('❌ Admin view appointments failed:', data.message)
    return null
  }
}

async function testAdminUpdateRegistration(adminToken, registrationId) {
  console.log('\n✏️ Testing admin update registration...')
  
  const { response, data } = await makeRequest(`/api/admin/mentorship/${registrationId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'COMPLETED',
      notes: 'Student completed all sessions successfully'
    })
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Admin update registration successful')
    console.log('Updated status:', data.data.status)
    return data.data
  } else {
    console.log('❌ Admin update registration failed:', data.message)
    return null
  }
}

// Main test runner
async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Mentorship System Test\n')
  console.log('=' * 80)
  
  const results = {
    studentSignup: false,
    studentLogin: false,
    mentorshipRegistration: false,
    mentorshipPayment: false,
    premiumAccess: false,
    premiumSignals: false,
    premiumResources: false,
    adminLogin: false,
    adminViewRegistrations: false,
    adminScheduleAppointment: false,
    adminViewAppointments: false,
    adminUpdateRegistration: false
  }
  
  let studentToken = null
  let adminToken = null
  let registrationId = null
  let appointmentId = null
  
  try {
    // Step 1: Test student signup
    studentToken = await testStudentSignup()
    results.studentSignup = !!studentToken
    
    if (!studentToken) {
      // Try login if signup failed (user might already exist)
      studentToken = await testStudentLogin()
      results.studentLogin = !!studentToken
    } else {
      results.studentLogin = true
    }
    
    if (!studentToken) {
      console.log('❌ Cannot proceed without student authentication')
      return results
    }
    
    // Step 2: Test mentorship registration
    const registration = await testMentorshipRegistration(studentToken)
    results.mentorshipRegistration = !!registration
    
    if (!registration) {
      console.log('❌ Cannot proceed without registration')
      return results
    }
    
    registrationId = registration.id
    
    // Step 3: Test mentorship payment
    const payment = await testMentorshipPayment(studentToken, registrationId)
    results.mentorshipPayment = !!payment
    
    if (!payment) {
      console.log('❌ Payment failed, but continuing with tests...')
    }
    
    // Step 4: Test premium access
    const access = await testPremiumAccess(studentToken)
    results.premiumAccess = !!access
    
    if (access) {
      console.log(`📊 Access Status - Subscription: ${access.subscriptionType}, Mentorship: ${access.mentorship}`)
    }
    
    // Step 5: Test premium signals access
    const signals = await testPremiumSignalsAccess(studentToken)
    results.premiumSignals = !!signals
    
    // Step 6: Test premium resources access
    const resources = await testPremiumResourcesAccess(studentToken)
    results.premiumResources = !!resources
    
    // Step 7: Test admin login
    adminToken = await testAdminLogin()
    results.adminLogin = !!adminToken
    
    if (!adminToken) {
      console.log('❌ Cannot proceed with admin tests without admin authentication')
      return results
    }
    
    // Step 8: Test admin view registrations
    const adminData = await testAdminViewRegistrations(adminToken)
    results.adminViewRegistrations = !!adminData
    
    if (adminData) {
      console.log(`📊 Admin Dashboard - Registrations: ${adminData.stats.totalRegistrations}, Revenue: $${adminData.stats.totalRevenue}`)
    }
    
    // Step 9: Test admin schedule appointment
    const appointment = await testAdminScheduleAppointment(adminToken, registrationId)
    results.adminScheduleAppointment = !!appointment
    
    if (appointment) {
      appointmentId = appointment.id
    }
    
    // Step 10: Test admin view appointments
    const appointments = await testAdminViewAppointments(adminToken)
    results.adminViewAppointments = !!appointments
    
    // Step 11: Test admin update registration
    const updatedRegistration = await testAdminUpdateRegistration(adminToken, registrationId)
    results.adminUpdateRegistration = !!updatedRegistration
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
  
  // Print results
  console.log('\n' + '=' * 80)
  console.log('📊 COMPREHENSIVE TEST RESULTS')
  console.log('=' * 80)
  
  const testNames = {
    studentSignup: 'Student Signup',
    studentLogin: 'Student Login',
    mentorshipRegistration: 'Mentorship Registration',
    mentorshipPayment: 'Mentorship Payment',
    premiumAccess: 'Premium Access Check',
    premiumSignals: 'Premium Signals Access',
    premiumResources: 'Premium Resources Access',
    adminLogin: 'Admin Login',
    adminViewRegistrations: 'Admin View Registrations',
    adminScheduleAppointment: 'Admin Schedule Appointment',
    adminViewAppointments: 'Admin View Appointments',
    adminUpdateRegistration: 'Admin Update Registration'
  }
  
  let passedTests = 0
  let totalTests = 0
  
  for (const [key, passed] of Object.entries(results)) {
    totalTests++
    if (passed) passedTests++
    console.log(`${passed ? '✅' : '❌'} ${testNames[key]}`)
  }
  
  console.log('=' * 80)
  console.log(`🎯 Tests Passed: ${passedTests}/${totalTests}`)
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The mentorship system is working perfectly.')
  } else if (passedTests >= totalTests * 0.8) {
    console.log('✅ Most tests passed! The system is working well with minor issues.')
  } else {
    console.log('⚠️ Several tests failed. Please check the implementation.')
  }
  
  // Additional insights
  console.log('\n📋 Test Summary:')
  console.log(`- Student Flow: ${results.studentSignup && results.studentLogin && results.mentorshipRegistration ? '✅ Working' : '❌ Issues'}`)
  console.log(`- Payment System: ${results.mentorshipPayment ? '✅ Working' : '❌ Issues'}`)
  console.log(`- Premium Access: ${results.premiumAccess && results.premiumSignals && results.premiumResources ? '✅ Working' : '❌ Issues'}`)
  console.log(`- Admin Management: ${results.adminLogin && results.adminViewRegistrations && results.adminScheduleAppointment ? '✅ Working' : '❌ Issues'}`)
  
  return results
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runComprehensiveTest().catch(console.error)
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runComprehensiveTest,
    testStudentSignup,
    testStudentLogin,
    testMentorshipRegistration,
    testMentorshipPayment,
    testPremiumAccess,
    testPremiumSignalsAccess,
    testPremiumResourcesAccess,
    testAdminLogin,
    testAdminViewRegistrations,
    testAdminScheduleAppointment,
    testAdminViewAppointments,
    testAdminUpdateRegistration
  }
}
