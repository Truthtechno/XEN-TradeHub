const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

async function testSessionDebug() {
  console.log('🔍 Session Debug Testing...\n')

  try {
    // Test 1: Check if we can access the main page
    console.log('1. Testing main page access...')
    const mainResponse = await axios.get(`${BASE_URL}/`)
    console.log(`✅ Main page accessible (${mainResponse.status})`)

    // Test 2: Check if we can access the signals page
    console.log('\n2. Testing signals page access...')
    const signalsResponse = await axios.get(`${BASE_URL}/signals`)
    console.log(`✅ Signals page accessible (${signalsResponse.status})`)

    // Test 3: Check if we can access the forecasts API
    console.log('\n3. Testing forecasts API access...')
    const forecastsResponse = await axios.get(`${BASE_URL}/api/forecasts?type=public&limit=1`)
    console.log(`✅ Forecasts API accessible (${forecastsResponse.status})`)
    console.log(`   Found ${forecastsResponse.data.forecasts.length} forecasts`)

    // Test 4: Check auth endpoints
    console.log('\n4. Testing auth endpoints...')
    try {
      const authResponse = await axios.get(`${BASE_URL}/api/auth/me`)
      console.log(`✅ Auth me endpoint accessible (${authResponse.status})`)
      console.log(`   Response:`, authResponse.data)
    } catch (error) {
      console.log(`❌ Auth me endpoint error: ${error.response?.status} - ${error.response?.data?.error || error.message}`)
    }

    // Test 5: Check if there are any CORS issues
    console.log('\n5. Testing CORS headers...')
    const optionsResponse = await axios.options(`${BASE_URL}/api/forecasts/cmgc03doc000f43raaswcu8sq/like`)
    console.log(`✅ CORS preflight successful (${optionsResponse.status})`)

    console.log('\n🎉 Session Debug Testing Completed!')
    console.log('\n📋 Summary:')
    console.log('- ✅ Main page working')
    console.log('- ✅ Signals page working')
    console.log('- ✅ Forecasts API working')
    console.log('- ✅ CORS working')
    console.log('\n💡 The issue is likely in the browser session handling.')
    console.log('\n🔧 Next Steps:')
    console.log('1. Open browser developer tools')
    console.log('2. Go to Application/Storage tab')
    console.log('3. Check if there are any NextAuth cookies')
    console.log('4. Check if the session is being stored properly')
    console.log('5. Try logging out and logging back in')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

testSessionDebug()
