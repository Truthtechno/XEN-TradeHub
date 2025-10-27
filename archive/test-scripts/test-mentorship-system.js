/**
 * Comprehensive Mentorship System Test Suite
 * Tests both admin and student functionalities
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

const testAppointment = {
  title: 'Initial Strategy Session',
  description: 'Discuss trading goals and current strategy',
  scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  duration: 60,
  meetingLink: 'https://zoom.us/j/123456789',
  notes: 'Focus on risk management'
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

// Test functions
async function testStudentRegistration() {
  console.log('\n📝 Testing student mentorship registration...')
  
  const token = await loginAsStudent()
  if (!token) return false
  
  const { response, data } = await makeRequest('/api/mentorship/register', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(testRegistration)
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Student registration successful')
    console.log('Registration ID:', data.data.id)
    return data.data
  } else {
    console.log('❌ Student registration failed:', data.message)
    return null
  }
}

async function testStudentPayment(registrationId) {
  console.log('\n💳 Testing student payment...')
  
  const token = await loginAsStudent()
  if (!token) return false
  
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
    console.log('✅ Student payment successful')
    console.log('Payment ID:', data.data.payment.id)
    console.log('Premium access granted:', data.data.access?.subscriptionType === 'PREMIUM')
    return data.data
  } else {
    console.log('❌ Student payment failed:', data.message)
    return null
  }
}

async function testAdminViewRegistrations() {
  console.log('\n👨‍💼 Testing admin view registrations...')
  
  const token = await loginAsAdmin()
  if (!token) return false
  
  const { response, data } = await makeRequest('/api/admin/mentorship', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Admin view registrations successful')
    console.log('Total registrations:', data.data.stats.totalRegistrations)
    console.log('Total revenue:', data.data.stats.totalRevenue)
    return data.data
  } else {
    console.log('❌ Admin view registrations failed:', data.message)
    return null
  }
}

async function testAdminAddRegistration() {
  console.log('\n➕ Testing admin add registration...')
  
  const token = await loginAsAdmin()
  if (!token) return false
  
  const { response, data } = await makeRequest('/api/admin/mentorship', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1987654321',
      country: 'Canada',
      experience: 'Intermediate',
      goals: 'Learn advanced strategies'
    })
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Admin add registration successful')
    console.log('New registration ID:', data.data.id)
    return data.data
  } else {
    console.log('❌ Admin add registration failed:', data.message)
    return null
  }
}

async function testAdminUpdateRegistration(registrationId) {
  console.log('\n✏️ Testing admin update registration...')
  
  const token = await loginAsAdmin()
  if (!token) return false
  
  const { response, data } = await makeRequest(`/api/admin/mentorship/${registrationId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      status: 'PAID',
      upgradeToPremium: true
    })
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Admin update registration successful')
    console.log('Status updated to:', data.data.status)
    return data.data
  } else {
    console.log('❌ Admin update registration failed:', data.message)
    return null
  }
}

async function testAdminScheduleAppointment(registrationId) {
  console.log('\n📅 Testing admin schedule appointment...')
  
  const token = await loginAsAdmin()
  if (!token) return false
  
  const { response, data } = await makeRequest('/api/admin/mentorship/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      ...testAppointment,
      registrationId
    })
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Admin schedule appointment successful')
    console.log('Appointment ID:', data.data.id)
    return data.data
  } else {
    console.log('❌ Admin schedule appointment failed:', data.message)
    return null
  }
}

async function testAdminViewAppointments() {
  console.log('\n📋 Testing admin view appointments...')
  
  const token = await loginAsAdmin()
  if (!token) return false
  
  const { response, data } = await makeRequest('/api/admin/mentorship/appointments', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
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

async function testStudentAccessAfterPayment() {
  console.log('\n🔓 Testing student access after payment...')
  
  const token = await loginAsStudent()
  if (!token) return false
  
  const { response, data } = await makeRequest('/api/user/access', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Student access check successful')
    console.log('Subscription type:', data.data.subscriptionType)
    console.log('Mentorship access:', data.data.mentorship)
    console.log('Premium signals:', data.data.premiumSignals)
    return data.data
  } else {
    console.log('❌ Student access check failed:', data.message)
    return null
  }
}

async function testAdminDeleteRegistration(registrationId) {
  console.log('\n🗑️ Testing admin delete registration...')
  
  const token = await loginAsAdmin()
  if (!token) return false
  
  const { response, data } = await makeRequest(`/api/admin/mentorship/${registrationId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  
  if (response?.ok && data.success) {
    console.log('✅ Admin delete registration successful')
    return true
  } else {
    console.log('❌ Admin delete registration failed:', data.message)
    return false
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Mentorship System Tests\n')
  console.log('=' * 60)
  
  const results = {
    studentRegistration: false,
    studentPayment: false,
    adminViewRegistrations: false,
    adminAddRegistration: false,
    adminUpdateRegistration: false,
    adminScheduleAppointment: false,
    adminViewAppointments: false,
    studentAccessAfterPayment: false,
    adminDeleteRegistration: false
  }
  
  try {
    // Test student registration
    const registration = await testStudentRegistration()
    results.studentRegistration = !!registration
    
    if (registration) {
      // Test student payment
      const payment = await testStudentPayment(registration.id)
      results.studentPayment = !!payment
      
      // Test student access after payment
      const access = await testStudentAccessAfterPayment()
      results.studentAccessAfterPayment = !!access
    }
    
    // Test admin functionalities
    const adminData = await testAdminViewRegistrations()
    results.adminViewRegistrations = !!adminData
    
    const newRegistration = await testAdminAddRegistration()
    results.adminAddRegistration = !!newRegistration
    
    if (newRegistration) {
      // Test admin update registration
      const updatedRegistration = await testAdminUpdateRegistration(newRegistration.id)
      results.adminUpdateRegistration = !!updatedRegistration
      
      // Test admin schedule appointment
      const appointment = await testAdminScheduleAppointment(newRegistration.id)
      results.adminScheduleAppointment = !!appointment
      
      // Test admin delete registration
      const deleted = await testAdminDeleteRegistration(newRegistration.id)
      results.adminDeleteRegistration = deleted
    }
    
    // Test admin view appointments
    const appointments = await testAdminViewAppointments()
    results.adminViewAppointments = !!appointments
    
  } catch (error) {
    console.error('❌ Test suite error:', error)
  }
  
  // Print results
  console.log('\n' + '=' * 60)
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('=' * 60)
  
  const testNames = {
    studentRegistration: 'Student Registration',
    studentPayment: 'Student Payment',
    adminViewRegistrations: 'Admin View Registrations',
    adminAddRegistration: 'Admin Add Registration',
    adminUpdateRegistration: 'Admin Update Registration',
    adminScheduleAppointment: 'Admin Schedule Appointment',
    adminViewAppointments: 'Admin View Appointments',
    studentAccessAfterPayment: 'Student Access After Payment',
    adminDeleteRegistration: 'Admin Delete Registration'
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
    console.log('🎉 All tests passed! The mentorship system is working correctly.')
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.')
  }
  
  return results
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runAllTests().catch(console.error)
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testStudentRegistration,
    testStudentPayment,
    testAdminViewRegistrations,
    testAdminAddRegistration,
    testAdminUpdateRegistration,
    testAdminScheduleAppointment,
    testAdminViewAppointments,
    testStudentAccessAfterPayment,
    testAdminDeleteRegistration
  }
}
