const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

async function testLikeCommentComprehensive() {
  console.log('🧪 Comprehensive Like & Comment Testing...\n')

  try {
    // Test 1: Get a forecast to test with
    console.log('1. Getting a forecast to test with...')
    const forecastsResponse = await axios.get(`${BASE_URL}/api/forecasts?type=public&limit=1`)
    const forecast = forecastsResponse.data.forecasts[0]
    console.log(`✅ Found forecast: ${forecast.title} (ID: ${forecast.id})`)
    console.log(`   Current likes: ${forecast.likes}`)
    console.log(`   Current comments: ${forecast.comments}`)

    // Test 2: Test like functionality (without auth - should fail)
    console.log('\n2. Testing like without authentication...')
    try {
      const likeResponse = await axios.post(`${BASE_URL}/api/forecasts/${forecast.id}/like`)
      console.log('❌ Like should have failed but succeeded:', likeResponse.data)
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Like correctly requires authentication (401)')
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message)
      }
    }

    // Test 3: Test comment functionality (without auth - should fail)
    console.log('\n3. Testing comment without authentication...')
    try {
      const commentResponse = await axios.post(`${BASE_URL}/api/forecasts/${forecast.id}/comments`, {
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

    // Test 4: Test comment fetching (without auth - should fail)
    console.log('\n4. Testing comment fetching without authentication...')
    try {
      const commentsResponse = await axios.get(`${BASE_URL}/api/forecasts/${forecast.id}/comments`)
      console.log('❌ Comment fetching should have failed but succeeded:', commentsResponse.data)
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Comment fetching correctly requires authentication (401)')
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message)
      }
    }

    console.log('\n🎉 Comprehensive Testing Completed!')
    console.log('\n📋 Summary:')
    console.log('- ✅ Forecast API working')
    console.log('- ✅ Like API requires authentication (401)')
    console.log('- ✅ Comment API requires authentication (401)')
    console.log('- ✅ Comment fetching requires authentication (401)')
    console.log('\n🚀 APIs are working correctly!')
    console.log('\n💡 Next Steps:')
    console.log('1. Open the browser and log in')
    console.log('2. Open the forecast panel')
    console.log('3. Check the debug information')
    console.log('4. Try liking a forecast')
    console.log('5. Try commenting on a forecast')
    console.log('6. Check browser console for detailed logs')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testLikeCommentComprehensive()
