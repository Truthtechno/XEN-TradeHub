/**
 * API Routes Testing Script
 * Run with: npx tsx test-api-routes.ts
 */

const BASE_URL = 'http://localhost:3000'

interface TestResult {
  endpoint: string
  method: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  statusCode?: number
  error?: string
}

const results: TestResult[] = []

async function testEndpoint(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  requiresAuth: boolean = true
): Promise<TestResult> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    
    // If requires auth and we get 401, that's expected without session
    if (requiresAuth && response.status === 401) {
      return {
        endpoint,
        method,
        status: 'PASS',
        statusCode: 401,
        error: 'Auth required (expected)'
      }
    }

    return {
      endpoint,
      method,
      status: response.ok || response.status === 401 ? 'PASS' : 'FAIL',
      statusCode: response.status,
    }
  } catch (error) {
    return {
      endpoint,
      method,
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function runTests() {
  console.log('🧪 Testing XEN TradeHub API Routes\n')
  console.log('=' .repeat(60))

  // User API Routes
  console.log('\n📱 USER API ROUTES')
  console.log('-'.repeat(60))

  results.push(await testEndpoint('/api/brokers', 'GET'))
  results.push(await testEndpoint('/api/brokers/open-account', 'POST', {
    brokerId: 'test',
    fullName: 'Test User',
    email: 'test@test.com',
    phone: '1234567890'
  }))
  
  results.push(await testEndpoint('/api/copy-trading/traders', 'GET'))
  results.push(await testEndpoint('/api/copy-trading/subscribe', 'POST', {
    traderId: 'test',
    investmentUSD: 1000
  }))
  
  results.push(await testEndpoint('/api/affiliates/program', 'GET'))
  results.push(await testEndpoint('/api/affiliates/register', 'POST'))

  // Admin API Routes
  console.log('\n👨‍💼 ADMIN API ROUTES')
  console.log('-'.repeat(60))

  // Brokers Admin
  results.push(await testEndpoint('/api/admin/brokers', 'GET'))
  results.push(await testEndpoint('/api/admin/brokers', 'POST', {
    name: 'Test Broker',
    slug: 'test-broker',
    referralLink: 'https://test.com'
  }))
  results.push(await testEndpoint('/api/admin/brokers/account-openings', 'GET'))

  // Copy Trading Admin
  results.push(await testEndpoint('/api/admin/copy-trading/traders', 'GET'))
  results.push(await testEndpoint('/api/admin/copy-trading/traders', 'POST', {
    name: 'Test Trader',
    slug: 'test-trader',
    profitPercentage: 50,
    minInvestment: 1000
  }))
  results.push(await testEndpoint('/api/admin/copy-trading/subscriptions', 'GET'))

  // Affiliates Admin
  results.push(await testEndpoint('/api/admin/affiliates', 'GET'))
  results.push(await testEndpoint('/api/admin/affiliates/payouts', 'GET'))
  results.push(await testEndpoint('/api/admin/affiliates/referrals', 'GET'))

  // Print Results
  console.log('\n📊 TEST RESULTS')
  console.log('='.repeat(60))
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌'
    const statusCode = result.statusCode ? `[${result.statusCode}]` : ''
    console.log(`${icon} ${result.method.padEnd(6)} ${result.endpoint.padEnd(40)} ${statusCode}`)
    if (result.error && result.statusCode !== 401) {
      console.log(`   └─ Error: ${result.error}`)
    }
  })

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📊 Total:  ${results.length}`)
  
  if (failed === 0) {
    console.log('\n🎉 All API routes are accessible!')
    console.log('ℹ️  Note: 401 responses are expected without authentication')
  } else {
    console.log('\n⚠️  Some routes failed. Check the errors above.')
  }
}

runTests().catch(console.error)
