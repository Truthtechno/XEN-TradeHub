#!/usr/bin/env node

/**
 * Final comprehensive system validation
 */

const { exec } = require('child_process')
const fs = require('fs')

class FinalSystemValidator {
  constructor() {
    this.results = {
      pages: { passed: 0, failed: 0, total: 0 },
      apis: { passed: 0, failed: 0, total: 0 },
      components: { passed: 0, failed: 0, total: 0 },
      overall: { passed: 0, failed: 0, total: 0 }
    }
    this.issues = []
  }

  async validateSystem() {
    console.log('🔍 FINAL SYSTEM VALIDATION')
    console.log('==========================\n')
    
    try {
      // Test all pages
      await this.testAllPages()
      
      // Test all APIs
      await this.testAllAPIs()
      
      // Test critical components
      await this.testCriticalComponents()
      
      // Generate final report
      this.generateFinalReport()
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message)
    }
  }

  async testAllPages() {
    console.log('📄 Testing All Pages...')
    
    const pages = [
      // Admin Pages
      { name: 'Admin Dashboard', url: 'http://localhost:3000/admin', type: 'admin' },
      { name: 'Admin Settings', url: 'http://localhost:3000/admin/settings', type: 'admin' },
      { name: 'Admin Users', url: 'http://localhost:3000/admin/users', type: 'admin' },
      { name: 'Admin Courses', url: 'http://localhost:3000/admin/courses', type: 'admin' },
      { name: 'Admin Signals', url: 'http://localhost:3000/admin/signals', type: 'admin' },
      { name: 'Admin Events', url: 'http://localhost:3000/admin/events', type: 'admin' },
      { name: 'Admin Resources', url: 'http://localhost:3000/admin/resources', type: 'admin' },
      { name: 'Admin Reports', url: 'http://localhost:3000/admin/reports', type: 'admin' },
      { name: 'Admin Analytics', url: 'http://localhost:3000/admin/analytics', type: 'admin' },
      { name: 'Admin Banners', url: 'http://localhost:3000/admin/banners', type: 'admin' },
      { name: 'Admin Calendar', url: 'http://localhost:3000/admin/calendar', type: 'admin' },
      { name: 'Admin Coaching', url: 'http://localhost:3000/admin/coaching', type: 'admin' },
      { name: 'Admin Enquiry', url: 'http://localhost:3000/admin/enquiry', type: 'admin' },
      { name: 'Admin Features', url: 'http://localhost:3000/admin/features', type: 'admin' },
      { name: 'Admin Forecasts', url: 'http://localhost:3000/admin/forecasts', type: 'admin' },
      { name: 'Admin Notifications', url: 'http://localhost:3000/admin/notifications', type: 'admin' },
      { name: 'Admin Tools', url: 'http://localhost:3000/admin/tools', type: 'admin' },
      { name: 'Admin Trade', url: 'http://localhost:3000/admin/trade', type: 'admin' },
      
      // User Pages
      { name: 'User Dashboard', url: 'http://localhost:3000/dashboard', type: 'user' },
      { name: 'User Profile', url: 'http://localhost:3000/profile', type: 'user' },
      { name: 'User Settings', url: 'http://localhost:3000/settings', type: 'user' },
      { name: 'User Courses', url: 'http://localhost:3000/courses', type: 'user' },
      { name: 'User Signals', url: 'http://localhost:3000/signals', type: 'user' },
      { name: 'User Events', url: 'http://localhost:3000/events', type: 'user' },
      { name: 'User Resources', url: 'http://localhost:3000/resources', type: 'user' },
      { name: 'User Academy', url: 'http://localhost:3000/academy', type: 'user' },
      { name: 'User Enquiry', url: 'http://localhost:3000/enquiry', type: 'user' },
      { name: 'User Forecasts', url: 'http://localhost:3000/forecasts', type: 'user' },
      { name: 'User Market Analysis', url: 'http://localhost:3000/market-analysis', type: 'user' },
      { name: 'User Notifications', url: 'http://localhost:3000/notifications', type: 'user' },
      { name: 'User One-on-One', url: 'http://localhost:3000/one-on-one', type: 'user' },
      { name: 'User Trade Core', url: 'http://localhost:3000/trade-core', type: 'user' },
      { name: 'User Trade Kojo', url: 'http://localhost:3000/trade-kojo', type: 'user' }
    ]

    for (const page of pages) {
      await this.testPage(page)
    }
  }

  async testAllAPIs() {
    console.log('\n🔌 Testing All APIs...')
    
    const apis = [
      { name: 'Login API', url: 'http://localhost:3000/api/auth/login', method: 'POST', data: '{"email":"admin@xenforex.com","password":"admin123"}' },
      { name: 'User Me API', url: 'http://localhost:3000/api/auth/me', method: 'GET' },
      { name: 'Signals API', url: 'http://localhost:3000/api/signals', method: 'GET' },
      { name: 'Users API', url: 'http://localhost:3000/api/users', method: 'GET' },
      { name: 'Payment Gateway Status', url: 'http://localhost:3000/api/payment-gateway/status', method: 'GET' },
      { name: 'Courses API', url: 'http://localhost:3000/api/courses', method: 'GET' },
      { name: 'Events API', url: 'http://localhost:3000/api/events', method: 'GET' },
      { name: 'Resources API', url: 'http://localhost:3000/api/resources', method: 'GET' },
      { name: 'Forecasts API', url: 'http://localhost:3000/api/forecasts', method: 'GET' },
      { name: 'Settings API', url: 'http://localhost:3000/api/settings', method: 'GET' }
    ]

    for (const api of apis) {
      await this.testAPI(api)
    }
  }

  async testCriticalComponents() {
    console.log('\n🧩 Testing Critical Components...')
    
    const components = [
      { name: 'Admin Layout', file: 'app/(admin)/admin/layout.tsx' },
      { name: 'User Layout', file: 'app/(authenticated)/layout.tsx' },
      { name: 'Main Layout', file: 'components/layout/main-layout.tsx' },
      { name: 'Header Component', file: 'components/layout/header.tsx' },
      { name: 'Sidebar Component', file: 'components/layout/sidebar.tsx' },
      { name: 'Admin Sidebar', file: 'components/admin/admin-sidebar.tsx' },
      { name: 'Admin Header', file: 'components/admin/admin-header.tsx' },
      { name: 'Payment Portal', file: 'components/payment/payment-portal.tsx' },
      { name: 'Subscription Management', file: 'components/ui/subscription-management.tsx' },
      { name: 'Signals Subscription Popup', file: 'components/ui/signals-subscription-popup.tsx' }
    ]

    for (const component of components) {
      await this.testComponent(component)
    }
  }

  async testPage(page) {
    return new Promise((resolve) => {
      const curlCommand = `curl -s -o /dev/null -w "%{http_code}" "${page.url}"`
      
      exec(curlCommand, (error, stdout, stderr) => {
        const statusCode = stdout.trim()
        const isSuccess = statusCode === '200' || statusCode === '302' || statusCode === '401'
        
        this.results.pages.total++
        this.results.overall.total++
        
        if (isSuccess) {
          this.results.pages.passed++
          this.results.overall.passed++
          console.log(`✅ ${page.name}: ${statusCode}`)
        } else {
          this.results.pages.failed++
          this.results.overall.failed++
          console.log(`❌ ${page.name}: ${statusCode}`)
          this.issues.push({
            type: 'page',
            name: page.name,
            url: page.url,
            status: statusCode,
            error: error ? error.message : null
          })
        }
        
        resolve()
      })
    })
  }

  async testAPI(api) {
    return new Promise((resolve) => {
      let curlCommand
      
      if (api.method === 'POST' && api.data) {
        curlCommand = `curl -s -o /dev/null -w "%{http_code}" -X ${api.method} -H "Content-Type: application/json" -d '${api.data}' "${api.url}"`
      } else {
        curlCommand = `curl -s -o /dev/null -w "%{http_code}" -X ${api.method} "${api.url}"`
      }
      
      exec(curlCommand, (error, stdout, stderr) => {
        const statusCode = stdout.trim()
        const isSuccess = statusCode === '200' || statusCode === '401' || statusCode === '403'
        
        this.results.apis.total++
        this.results.overall.total++
        
        if (isSuccess) {
          this.results.apis.passed++
          this.results.overall.passed++
          console.log(`✅ ${api.name}: ${statusCode}`)
        } else {
          this.results.apis.failed++
          this.results.overall.failed++
          console.log(`❌ ${api.name}: ${statusCode}`)
          this.issues.push({
            type: 'api',
            name: api.name,
            url: api.url,
            status: statusCode,
            error: error ? error.message : null
          })
        }
        
        resolve()
      })
    })
  }

  async testComponent(component) {
    return new Promise((resolve) => {
      const filePath = `/Volumes/BRYAN/PROJECTS/CoreFX/${component.file}`
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        
        // Check for common issues
        const hasErrors = this.checkComponentIssues(content)
        
        this.results.components.total++
        this.results.overall.total++
        
        if (!hasErrors) {
          this.results.components.passed++
          this.results.overall.passed++
          console.log(`✅ ${component.name}: OK`)
        } else {
          this.results.components.failed++
          this.results.overall.failed++
          console.log(`❌ ${component.name}: Issues found`)
          this.issues.push({
            type: 'component',
            name: component.name,
            file: component.file,
            issues: hasErrors
          })
        }
      } else {
        this.results.components.failed++
        this.results.overall.failed++
        console.log(`❌ ${component.name}: File not found`)
        this.issues.push({
          type: 'component',
          name: component.name,
          file: component.file,
          error: 'File not found'
        })
      }
      
      resolve()
    })
  }

  checkComponentIssues(content) {
    const issues = []
    
    // Check for missing imports
    const missingImports = this.findMissingImports(content)
    if (missingImports.length > 0) {
      issues.push(`Missing imports: ${missingImports.join(', ')}`)
    }
    
    // Check for syntax errors
    if (content.includes('ReferenceError:') || content.includes('is not defined')) {
      issues.push('Runtime errors detected')
    }
    
    // Check for console errors
    if (content.includes('console.error') && !content.includes('//')) {
      issues.push('Console errors present')
    }
    
    return issues
  }

  findMissingImports(content) {
    const missingImports = []
    
    // Find all used components
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g
    const usedComponents = new Set()
    let match

    while ((match = componentRegex.exec(content)) !== null) {
      usedComponents.add(match[1])
    }

    // Common icons that might be missing
    const commonIcons = [
      'CheckCircle', 'AlertCircle', 'Zap', 'Code', 'HelpCircle',
      'Eye', 'EyeOff', 'Settings', 'Save', 'RefreshCw',
      'Shield', 'Palette', 'CreditCard', 'Globe', 'Mail',
      'Phone', 'MapPin', 'Link', 'ToggleLeft', 'ToggleRight',
      'TestTube', 'Plus', 'Edit', 'Trash2', 'Search', 'Filter'
    ]

    // Check which common icons are used but not imported
    for (const component of usedComponents) {
      if (commonIcons.includes(component)) {
        const hasImport = content.includes(`import { ${component}`) || 
                         content.includes(`import ${component}`) ||
                         content.includes(`import * as ${component}`) ||
                         content.includes(`{ ${component}`) ||
                         content.includes(`${component},`) ||
                         content.includes(`, ${component}`)
        
        if (!hasImport) {
          missingImports.push(component)
        }
      }
    }

    return missingImports
  }

  generateFinalReport() {
    console.log('\n📋 FINAL SYSTEM VALIDATION REPORT')
    console.log('==================================\n')
    
    // Overall statistics
    const overallSuccessRate = ((this.results.overall.passed / this.results.overall.total) * 100).toFixed(1)
    
    console.log('📊 OVERALL STATISTICS:')
    console.log(`  Total Tests: ${this.results.overall.total}`)
    console.log(`  Passed: ${this.results.overall.passed}`)
    console.log(`  Failed: ${this.results.overall.failed}`)
    console.log(`  Success Rate: ${overallSuccessRate}%`)
    
    // Breakdown by category
    console.log('\n📈 BREAKDOWN BY CATEGORY:')
    console.log(`  Pages: ${this.results.pages.passed}/${this.results.pages.total} (${((this.results.pages.passed / this.results.pages.total) * 100).toFixed(1)}%)`)
    console.log(`  APIs: ${this.results.apis.passed}/${this.results.apis.total} (${((this.results.apis.passed / this.results.apis.total) * 100).toFixed(1)}%)`)
    console.log(`  Components: ${this.results.components.passed}/${this.results.components.total} (${((this.results.components.passed / this.results.components.total) * 100).toFixed(1)}%)`)
    
    // Issues summary
    if (this.issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:')
      this.issues.forEach(issue => {
        console.log(`  • ${issue.type.toUpperCase()}: ${issue.name}`)
        if (issue.status) console.log(`    Status: ${issue.status}`)
        if (issue.error) console.log(`    Error: ${issue.error}`)
        if (issue.issues) console.log(`    Issues: ${issue.issues.join(', ')}`)
      })
    } else {
      console.log('\n✅ NO ISSUES FOUND!')
    }
    
    // Final assessment
    console.log('\n🎯 FINAL ASSESSMENT:')
    if (overallSuccessRate >= 95) {
      console.log('🟢 EXCELLENT: System is in excellent condition!')
    } else if (overallSuccessRate >= 90) {
      console.log('🟡 GOOD: System is working well with minor issues.')
    } else if (overallSuccessRate >= 80) {
      console.log('🟠 FAIR: System has some issues that need attention.')
    } else {
      console.log('🔴 POOR: System has significant issues that need immediate attention.')
    }
    
    console.log(`\n📝 Summary: ${this.results.overall.passed}/${this.results.overall.total} tests passed (${overallSuccessRate}%)`)
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new FinalSystemValidator()
  validator.validateSystem().catch(console.error)
}

module.exports = { FinalSystemValidator }
