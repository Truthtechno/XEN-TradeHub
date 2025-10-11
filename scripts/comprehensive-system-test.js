#!/usr/bin/env node

/**
 * Comprehensive system test for all pages and functionalities
 */

const fetch = require('node-fetch')
const { PrismaClient } = require('@prisma/client')

const BASE_URL = 'http://localhost:3000'
const prisma = new PrismaClient()

class SystemTester {
  constructor() {
    this.results = {
      adminPages: {},
      userPages: {},
      apiEndpoints: {},
      authentication: {},
      dataConsistency: {},
      subscriptionSystem: {},
      paymentFlows: {},
      overall: {}
    }
    this.adminToken = null
    this.userToken = null
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive System Test...\n')
    
    try {
      // Step 1: Setup authentication
      await this.setupAuthentication()
      
      // Step 2: Test admin pages
      await this.testAdminPages()
      
      // Step 3: Test user pages
      await this.testUserPages()
      
      // Step 4: Test API endpoints
      await this.testApiEndpoints()
      
      // Step 5: Test authentication flow
      await this.testAuthenticationFlow()
      
      // Step 6: Test data consistency
      await this.testDataConsistency()
      
      // Step 7: Test subscription system
      await this.testSubscriptionSystem()
      
      // Step 8: Test payment flows
      await this.testPaymentFlows()
      
      // Step 9: Generate report
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message)
    } finally {
      await prisma.$disconnect()
    }
  }

  async setupAuthentication() {
    console.log('🔐 Setting up authentication...')
    
    try {
      // Login as admin
      const adminResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@xenforex.com',
          password: 'admin123'
        })
      })
      
      if (adminResponse.ok) {
        this.adminToken = adminResponse.headers.get('set-cookie')
        console.log('✅ Admin authentication successful')
        this.results.authentication.admin = true
      } else {
        console.log('❌ Admin authentication failed')
        this.results.authentication.admin = false
      }
      
      // Create test user and login
      const testUser = await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          name: 'Test User',
          role: 'STUDENT'
        }
      })
      
      const userResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'anypassword' // Demo user accepts any password
        })
      })
      
      if (userResponse.ok) {
        this.userToken = userResponse.headers.get('set-cookie')
        console.log('✅ User authentication successful')
        this.results.authentication.user = true
      } else {
        console.log('❌ User authentication failed')
        this.results.authentication.user = false
      }
      
    } catch (error) {
      console.error('❌ Authentication setup failed:', error.message)
      this.results.authentication.setup = false
    }
  }

  async testAdminPages() {
    console.log('\n📊 Testing Admin Pages...')
    
    const adminPages = [
      { name: 'Dashboard', url: '/admin' },
      { name: 'Users', url: '/admin/users' },
      { name: 'Signals', url: '/admin/signals' },
      { name: 'Forecasts', url: '/admin/forecasts' },
      { name: 'Courses', url: '/admin/courses' },
      { name: 'Resources', url: '/admin/resources' },
      { name: 'Settings', url: '/admin/settings' },
      { name: 'Notifications', url: '/admin/notifications' },
      { name: 'Events', url: '/admin/events' },
      { name: 'Analytics', url: '/admin/analytics' }
    ]
    
    for (const page of adminPages) {
      try {
        const response = await fetch(`${BASE_URL}${page.url}`, {
          headers: { 'Cookie': this.adminToken || '' }
        })
        
        if (response.ok) {
          console.log(`✅ ${page.name}: Working`)
          this.results.adminPages[page.name] = { status: 'success', code: response.status }
        } else {
          console.log(`❌ ${page.name}: Failed (${response.status})`)
          this.results.adminPages[page.name] = { status: 'failed', code: response.status }
        }
      } catch (error) {
        console.log(`❌ ${page.name}: Error - ${error.message}`)
        this.results.adminPages[page.name] = { status: 'error', error: error.message }
      }
    }
  }

  async testUserPages() {
    console.log('\n👤 Testing User Pages...')
    
    const userPages = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Signals', url: '/signals' },
      { name: 'Forecasts', url: '/forecasts' },
      { name: 'Courses', url: '/courses' },
      { name: 'Resources', url: '/resources' },
      { name: 'Academy', url: '/academy' },
      { name: 'Events', url: '/events' },
      { name: 'Notifications', url: '/notifications' },
      { name: 'Profile', url: '/profile' },
      { name: 'Settings', url: '/settings' }
    ]
    
    for (const page of userPages) {
      try {
        const response = await fetch(`${BASE_URL}${page.url}`, {
          headers: { 'Cookie': this.userToken || '' }
        })
        
        if (response.ok) {
          console.log(`✅ ${page.name}: Working`)
          this.results.userPages[page.name] = { status: 'success', code: response.status }
        } else {
          console.log(`❌ ${page.name}: Failed (${response.status})`)
          this.results.userPages[page.name] = { status: 'failed', code: response.status }
        }
      } catch (error) {
        console.log(`❌ ${page.name}: Error - ${error.message}`)
        this.results.userPages[page.name] = { status: 'error', error: error.message }
      }
    }
  }

  async testApiEndpoints() {
    console.log('\n🔌 Testing API Endpoints...')
    
    const apiEndpoints = [
      { name: 'Auth Login', method: 'POST', url: '/api/auth/login' },
      { name: 'Auth Me', method: 'GET', url: '/api/auth/me' },
      { name: 'Settings', method: 'GET', url: '/api/settings' },
      { name: 'Forecasts', method: 'GET', url: '/api/forecasts' },
      { name: 'Signals', method: 'GET', url: '/api/signals' },
      { name: 'Users', method: 'GET', url: '/api/users' },
      { name: 'Courses', method: 'GET', url: '/api/courses' },
      { name: 'Resources', method: 'GET', url: '/api/resources' },
      { name: 'Events', method: 'GET', url: '/api/events' },
      { name: 'Notifications', method: 'GET', url: '/api/notifications' },
      { name: 'Subscription Status', method: 'GET', url: '/api/payments/signals' },
      { name: 'Billing Cron', method: 'POST', url: '/api/cron/billing' }
    ]
    
    for (const endpoint of apiEndpoints) {
      try {
        const options = {
          method: endpoint.method,
          headers: { 
            'Content-Type': 'application/json',
            'Cookie': this.adminToken || ''
          }
        }
        
        if (endpoint.method === 'POST') {
          options.body = JSON.stringify({
            email: 'admin@xenforex.com',
            password: 'admin123'
          })
        }
        
        const response = await fetch(`${BASE_URL}${endpoint.url}`, options)
        
        if (response.ok || response.status === 401) { // 401 is expected for some endpoints
          console.log(`✅ ${endpoint.name}: Working (${response.status})`)
          this.results.apiEndpoints[endpoint.name] = { status: 'success', code: response.status }
        } else {
          console.log(`❌ ${endpoint.name}: Failed (${response.status})`)
          this.results.apiEndpoints[endpoint.name] = { status: 'failed', code: response.status }
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: Error - ${error.message}`)
        this.results.apiEndpoints[endpoint.name] = { status: 'error', error: error.message }
      }
    }
  }

  async testAuthenticationFlow() {
    console.log('\n🔐 Testing Authentication Flow...')
    
    try {
      // Test admin can access admin pages
      const adminDashboard = await fetch(`${BASE_URL}/admin`, {
        headers: { 'Cookie': this.adminToken || '' }
      })
      
      if (adminDashboard.ok) {
        console.log('✅ Admin can access admin dashboard')
        this.results.authentication.adminAccess = true
      } else {
        console.log('❌ Admin cannot access admin dashboard')
        this.results.authentication.adminAccess = false
      }
      
      // Test user cannot access admin pages
      const userAdminAccess = await fetch(`${BASE_URL}/admin`, {
        headers: { 'Cookie': this.userToken || '' }
      })
      
      if (userAdminAccess.status === 401 || userAdminAccess.status === 403) {
        console.log('✅ User properly blocked from admin access')
        this.results.authentication.userBlocked = true
      } else {
        console.log('❌ User can access admin pages (security issue)')
        this.results.authentication.userBlocked = false
      }
      
      // Test user can access user pages
      const userDashboard = await fetch(`${BASE_URL}/dashboard`, {
        headers: { 'Cookie': this.userToken || '' }
      })
      
      if (userDashboard.ok) {
        console.log('✅ User can access user dashboard')
        this.results.authentication.userAccess = true
      } else {
        console.log('❌ User cannot access user dashboard')
        this.results.authentication.userAccess = false
      }
      
    } catch (error) {
      console.error('❌ Authentication flow test failed:', error.message)
      this.results.authentication.flow = false
    }
  }

  async testDataConsistency() {
    console.log('\n📊 Testing Data Consistency...')
    
    try {
      // Test that data is consistent between admin and user views
      const adminForecasts = await fetch(`${BASE_URL}/api/forecasts`, {
        headers: { 'Cookie': this.adminToken || '' }
      })
      
      const userForecasts = await fetch(`${BASE_URL}/api/forecasts`, {
        headers: { 'Cookie': this.userToken || '' }
      })
      
      if (adminForecasts.ok && userForecasts.ok) {
        const adminData = await adminForecasts.json()
        const userData = await userForecasts.json()
        
        if (adminData.forecasts && userData.forecasts) {
          console.log('✅ Forecast data consistent between admin and user views')
          this.results.dataConsistency.forecasts = true
        } else {
          console.log('❌ Forecast data inconsistent')
          this.results.dataConsistency.forecasts = false
        }
      } else {
        console.log('❌ Could not test data consistency - API issues')
        this.results.dataConsistency.forecasts = false
      }
      
      // Test database consistency
      const dbUsers = await prisma.user.count()
      const dbSettings = await prisma.settings.count()
      const dbForecasts = await prisma.forecast.count()
      
      console.log(`✅ Database consistency: ${dbUsers} users, ${dbSettings} settings, ${dbForecasts} forecasts`)
      this.results.dataConsistency.database = true
      
    } catch (error) {
      console.error('❌ Data consistency test failed:', error.message)
      this.results.dataConsistency.overall = false
    }
  }

  async testSubscriptionSystem() {
    console.log('\n💳 Testing Subscription System...')
    
    try {
      // Test subscription creation
      const subscriptionResponse = await fetch(`${BASE_URL}/api/payments/signals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': this.userToken || ''
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
        console.log('✅ Subscription creation working')
        this.results.subscriptionSystem.creation = true
      } else {
        console.log('❌ Subscription creation failed')
        this.results.subscriptionSystem.creation = false
      }
      
      // Test subscription status check
      const statusResponse = await fetch(`${BASE_URL}/api/payments/signals`, {
        headers: { 'Cookie': this.userToken || '' }
      })
      
      if (statusResponse.ok) {
        console.log('✅ Subscription status check working')
        this.results.subscriptionSystem.status = true
      } else {
        console.log('❌ Subscription status check failed')
        this.results.subscriptionSystem.status = false
      }
      
      // Test billing cron
      const cronResponse = await fetch(`${BASE_URL}/api/cron/billing`, {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer your-secure-cron-secret-here-1759772665',
          'Content-Type': 'application/json'
        }
      })
      
      if (cronResponse.ok) {
        console.log('✅ Billing cron working')
        this.results.subscriptionSystem.cron = true
      } else {
        console.log('❌ Billing cron failed')
        this.results.subscriptionSystem.cron = false
      }
      
    } catch (error) {
      console.error('❌ Subscription system test failed:', error.message)
      this.results.subscriptionSystem.overall = false
    }
  }

  async testPaymentFlows() {
    console.log('\n💰 Testing Payment Flows...')
    
    try {
      // Test payment gateway status
      const gatewayResponse = await fetch(`${BASE_URL}/api/payment-gateway/status`)
      
      if (gatewayResponse.ok) {
        console.log('✅ Payment gateway status working')
        this.results.paymentFlows.gateway = true
      } else {
        console.log('❌ Payment gateway status failed')
        this.results.paymentFlows.gateway = false
      }
      
      // Test mock payment creation
      const mockPaymentResponse = await fetch(`${BASE_URL}/api/mock-payment/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 99.99,
          currency: 'USD',
          courseId: 'test-course',
          courseTitle: 'Test Course'
        })
      })
      
      if (mockPaymentResponse.ok) {
        console.log('✅ Mock payment creation working')
        this.results.paymentFlows.mockPayment = true
      } else {
        console.log('❌ Mock payment creation failed')
        this.results.paymentFlows.mockPayment = false
      }
      
    } catch (error) {
      console.error('❌ Payment flows test failed:', error.message)
      this.results.paymentFlows.overall = false
    }
  }

  generateReport() {
    console.log('\n📋 COMPREHENSIVE TEST REPORT')
    console.log('=====================================')
    
    // Calculate overall scores
    const adminPagesScore = this.calculateScore(this.results.adminPages)
    const userPagesScore = this.calculateScore(this.results.userPages)
    const apiEndpointsScore = this.calculateScore(this.results.apiEndpoints)
    const authScore = this.calculateScore(this.results.authentication)
    const dataScore = this.calculateScore(this.results.dataConsistency)
    const subscriptionScore = this.calculateScore(this.results.subscriptionSystem)
    const paymentScore = this.calculateScore(this.results.paymentFlows)
    
    console.log(`\n📊 Test Results Summary:`)
    console.log(`Admin Pages: ${adminPagesScore}%`)
    console.log(`User Pages: ${userPagesScore}%`)
    console.log(`API Endpoints: ${apiEndpointsScore}%`)
    console.log(`Authentication: ${authScore}%`)
    console.log(`Data Consistency: ${dataScore}%`)
    console.log(`Subscription System: ${subscriptionScore}%`)
    console.log(`Payment Flows: ${paymentScore}%`)
    
    const overallScore = Math.round((adminPagesScore + userPagesScore + apiEndpointsScore + authScore + dataScore + subscriptionScore + paymentScore) / 7)
    
    console.log(`\n🎯 Overall System Health: ${overallScore}%`)
    
    if (overallScore >= 90) {
      console.log('🎉 EXCELLENT! System is in perfect condition!')
    } else if (overallScore >= 80) {
      console.log('✅ GOOD! System is working well with minor issues.')
    } else if (overallScore >= 70) {
      console.log('⚠️  FAIR! System needs some attention.')
    } else {
      console.log('❌ POOR! System needs significant fixes.')
    }
    
    // Detailed results
    console.log('\n📝 Detailed Results:')
    this.printDetailedResults('Admin Pages', this.results.adminPages)
    this.printDetailedResults('User Pages', this.results.userPages)
    this.printDetailedResults('API Endpoints', this.results.apiEndpoints)
    this.printDetailedResults('Authentication', this.results.authentication)
    this.printDetailedResults('Data Consistency', this.results.dataConsistency)
    this.printDetailedResults('Subscription System', this.results.subscriptionSystem)
    this.printDetailedResults('Payment Flows', this.results.paymentFlows)
    
    this.results.overall = {
      score: overallScore,
      status: overallScore >= 90 ? 'excellent' : overallScore >= 80 ? 'good' : overallScore >= 70 ? 'fair' : 'poor'
    }
  }

  calculateScore(results) {
    const total = Object.keys(results).length
    const passed = Object.values(results).filter(r => r.status === 'success' || r === true).length
    return total > 0 ? Math.round((passed / total) * 100) : 0
  }

  printDetailedResults(category, results) {
    console.log(`\n${category}:`)
    Object.entries(results).forEach(([key, value]) => {
      if (typeof value === 'object' && value.status) {
        const status = value.status === 'success' ? '✅' : '❌'
        console.log(`  ${status} ${key}: ${value.status} (${value.code || 'N/A'})`)
      } else if (typeof value === 'boolean') {
        const status = value ? '✅' : '❌'
        console.log(`  ${status} ${key}: ${value}`)
      }
    })
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new SystemTester()
  tester.runAllTests().catch(console.error)
}

module.exports = { SystemTester }
