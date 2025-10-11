#!/usr/bin/env node

/**
 * Test actual page functionality by checking for runtime errors
 */

const { exec } = require('child_process')
const fs = require('fs')

class PageFunctionalityTester {
  constructor() {
    this.testResults = []
    this.passedTests = 0
    this.failedTests = 0
  }

  async testAllPages() {
    console.log('🧪 Testing page functionality...\n')
    
    try {
      // Test admin pages
      await this.testAdminPages()
      
      // Test user pages
      await this.testUserPages()
      
      // Test API endpoints
      await this.testAPIEndpoints()
      
      // Generate report
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Testing failed:', error.message)
    }
  }

  async testAdminPages() {
    console.log('📁 Testing Admin Pages...')
    
    const adminPages = [
      { name: 'Admin Dashboard', url: 'http://localhost:3000/admin' },
      { name: 'Admin Settings', url: 'http://localhost:3000/admin/settings' },
      { name: 'Admin Users', url: 'http://localhost:3000/admin/users' },
      { name: 'Admin Courses', url: 'http://localhost:3000/admin/courses' },
      { name: 'Admin Signals', url: 'http://localhost:3000/admin/signals' },
      { name: 'Admin Events', url: 'http://localhost:3000/admin/events' },
      { name: 'Admin Resources', url: 'http://localhost:3000/admin/resources' },
      { name: 'Admin Reports', url: 'http://localhost:3000/admin/reports' }
    ]

    for (const page of adminPages) {
      await this.testPage(page.name, page.url)
    }
  }

  async testUserPages() {
    console.log('\n📁 Testing User Pages...')
    
    const userPages = [
      { name: 'User Dashboard', url: 'http://localhost:3000/dashboard' },
      { name: 'User Profile', url: 'http://localhost:3000/profile' },
      { name: 'User Settings', url: 'http://localhost:3000/settings' },
      { name: 'User Courses', url: 'http://localhost:3000/courses' },
      { name: 'User Signals', url: 'http://localhost:3000/signals' },
      { name: 'User Events', url: 'http://localhost:3000/events' },
      { name: 'User Resources', url: 'http://localhost:3000/resources' },
      { name: 'User Academy', url: 'http://localhost:3000/academy' }
    ]

    for (const page of userPages) {
      await this.testPage(page.name, page.url)
    }
  }

  async testAPIEndpoints() {
    console.log('\n📁 Testing API Endpoints...')
    
    const apiEndpoints = [
      { name: 'Login API', url: 'http://localhost:3000/api/auth/login', method: 'POST' },
      { name: 'User Me API', url: 'http://localhost:3000/api/auth/me', method: 'GET' },
      { name: 'Signals API', url: 'http://localhost:3000/api/signals', method: 'GET' },
      { name: 'Users API', url: 'http://localhost:3000/api/users', method: 'GET' },
      { name: 'Payment Gateway Status', url: 'http://localhost:3000/api/payment-gateway/status', method: 'GET' }
    ]

    for (const endpoint of apiEndpoints) {
      await this.testAPIEndpoint(endpoint.name, endpoint.url, endpoint.method)
    }
  }

  async testPage(name, url) {
    return new Promise((resolve) => {
      const curlCommand = `curl -s -o /dev/null -w "%{http_code}" "${url}"`
      
      exec(curlCommand, (error, stdout, stderr) => {
        const statusCode = stdout.trim()
        const isSuccess = statusCode === '200' || statusCode === '302' || statusCode === '401'
        
        const result = {
          name,
          url,
          status: isSuccess ? 'PASS' : 'FAIL',
          statusCode,
          error: error ? error.message : null
        }
        
        this.testResults.push(result)
        
        if (isSuccess) {
          this.passedTests++
          console.log(`✅ ${name}: ${statusCode}`)
        } else {
          this.failedTests++
          console.log(`❌ ${name}: ${statusCode} ${error ? error.message : ''}`)
        }
        
        resolve()
      })
    })
  }

  async testAPIEndpoint(name, url, method) {
    return new Promise((resolve) => {
      const curlCommand = `curl -s -o /dev/null -w "%{http_code}" -X ${method} "${url}"`
      
      exec(curlCommand, (error, stdout, stderr) => {
        const statusCode = stdout.trim()
        const isSuccess = statusCode === '200' || statusCode === '401' || statusCode === '403'
        
        const result = {
          name,
          url,
          status: isSuccess ? 'PASS' : 'FAIL',
          statusCode,
          error: error ? error.message : null
        }
        
        this.testResults.push(result)
        
        if (isSuccess) {
          this.passedTests++
          console.log(`✅ ${name}: ${statusCode}`)
        } else {
          this.failedTests++
          console.log(`❌ ${name}: ${statusCode} ${error ? error.message : ''}`)
        }
        
        resolve()
      })
    })
  }

  generateReport() {
    console.log('\n📋 PAGE FUNCTIONALITY TEST REPORT')
    console.log('==================================\n')
    
    console.log(`✅ Passed Tests: ${this.passedTests}`)
    console.log(`❌ Failed Tests: ${this.failedTests}`)
    console.log(`📊 Total Tests: ${this.testResults.length}`)
    
    const successRate = ((this.passedTests / this.testResults.length) * 100).toFixed(1)
    console.log(`🎯 Success Rate: ${successRate}%`)
    
    if (this.failedTests > 0) {
      console.log('\n❌ Failed Tests:')
      this.testResults
        .filter(result => result.status === 'FAIL')
        .forEach(result => {
          console.log(`  • ${result.name}: ${result.statusCode} ${result.error || ''}`)
        })
    }
    
    if (successRate >= 90) {
      console.log('\n🎉 Excellent! Most pages are working correctly.')
    } else if (successRate >= 70) {
      console.log('\n⚠️  Good, but some pages need attention.')
    } else {
      console.log('\n🚨 Many pages have issues that need to be fixed.')
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new PageFunctionalityTester()
  tester.testAllPages().catch(console.error)
}

module.exports = { PageFunctionalityTester }
