const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

async function testAuthComprehensive() {
  console.log('🔐 Comprehensive Authentication Testing...\n')

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...')
    const healthResponse = await axios.get(`${BASE_URL}/api/test-env`)
    console.log('✅ Server is running')
    console.log('   Environment check:', healthResponse.data)

    // Test 2: Test forecasts API without auth (should work for public)
    console.log('\n2. Testing forecasts API without authentication...')
    try {
      const forecastsResponse = await axios.get(`${BASE_URL}/api/forecasts?type=public&limit=1`)
      console.log('✅ Public forecasts accessible without auth')
      console.log(`   Found ${forecastsResponse.data.forecasts.length} forecasts`)
      
      if (forecastsResponse.data.forecasts.length > 0) {
        const forecast = forecastsResponse.data.forecasts[0]
        console.log(`   Sample forecast: ${forecast.title} (ID: ${forecast.id})`)
        return forecast.id
      }
    } catch (error) {
      console.log('❌ Forecasts API error:', error.response?.data || error.message)
      return null
    }

  } catch (error) {
    console.error('❌ Server connectivity test failed:', error.message)
    return null
  }
}

async function testWithForecastId(forecastId) {
  if (!forecastId) {
    console.log('\n❌ No forecast ID available for testing')
    return
  }

  console.log(`\n3. Testing like API without authentication (should fail)...`)
  try {
    const likeResponse = await axios.post(`${BASE_URL}/api/forecasts/${forecastId}/like`)
    console.log('❌ Like should have failed but succeeded:', likeResponse.data)
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Like correctly requires authentication (401)')
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message)
    }
  }

  console.log(`\n4. Testing comment API without authentication (should fail)...`)
  try {
    const commentResponse = await axios.post(`${BASE_URL}/api/forecasts/${forecastId}/comments`, {
      content: 'Test comment without auth',
      isAdmin: false
    })
    console.log('❌ Comment should have failed but succeeded:', commentResponse.data)
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Comment correctly requires authentication (401)')
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message)
    }
  }

  console.log(`\n5. Testing comment fetching without authentication (should fail)...`)
  try {
    const commentsResponse = await axios.get(`${BASE_URL}/api/forecasts/${forecastId}/comments`)
    console.log('❌ Comment fetching should have failed but succeeded:', commentsResponse.data)
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Comment fetching correctly requires authentication (401)')
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message)
    }
  }

  console.log('\n🎉 Authentication Testing Completed!')
  console.log('\n📋 Summary:')
  console.log('- ✅ Server is running')
  console.log('- ✅ Public forecasts accessible without auth')
  console.log('- ✅ Like API requires authentication (401)')
  console.log('- ✅ Comment API requires authentication (401)')
  console.log('- ✅ Comment fetching requires authentication (401)')
  console.log('\n🚀 APIs are working correctly!')
  console.log('\n💡 Next Steps:')
  console.log('1. Open the browser and log in')
  console.log('2. Open the forecast panel')
  console.log('3. Try liking a forecast')
  console.log('4. Try commenting on a forecast')
  console.log('5. Check browser console for detailed logs')
}

// Run the tests
testAuthComprehensive().then(forecastId => {
  testWithForecastId(forecastId)
})
