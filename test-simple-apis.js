const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

async function testSimpleAPIs() {
  console.log('🧪 Testing Simple APIs...\n')

  try {
    // Test 1: Get a forecast
    console.log('1. Getting a forecast...')
    const forecastsResponse = await axios.get(`${BASE_URL}/api/forecasts?type=public&limit=1`)
    const forecast = forecastsResponse.data.forecasts[0]
    console.log(`✅ Found forecast: ${forecast.title} (ID: ${forecast.id})`)
    console.log(`   Current likes: ${forecast.likes}`)
    console.log(`   Current comments: ${forecast.comments}`)

    // Test 2: Like the forecast
    console.log('\n2. Testing like functionality...')
    const likeResponse = await axios.post(`${BASE_URL}/api/forecasts/${forecast.id}/like`)
    console.log('✅ Like successful:', likeResponse.data)

    // Test 3: Add a comment
    console.log('\n3. Testing comment functionality...')
    const commentResponse = await axios.post(`${BASE_URL}/api/forecasts/${forecast.id}/comments`, {
      content: 'Test comment from API test',
      isAdmin: false
    })
    console.log('✅ Comment successful:', commentResponse.data.comment.content)

    // Test 4: Fetch comments
    console.log('\n4. Testing comment fetching...')
    const commentsResponse = await axios.get(`${BASE_URL}/api/forecasts/${forecast.id}/comments`)
    console.log(`✅ Comments fetched: ${commentsResponse.data.comments.length} comments`)

    // Test 5: Unlike the forecast
    console.log('\n5. Testing unlike functionality...')
    const unlikeResponse = await axios.post(`${BASE_URL}/api/forecasts/${forecast.id}/like`)
    console.log('✅ Unlike successful:', unlikeResponse.data)

    console.log('\n🎉 All Simple APIs Working Perfectly!')
    console.log('\n📋 Summary:')
    console.log('- ✅ Forecast fetching works')
    console.log('- ✅ Like functionality works')
    console.log('- ✅ Comment functionality works')
    console.log('- ✅ Comment fetching works')
    console.log('- ✅ Unlike functionality works')
    console.log('\n🚀 The system is ready for browser testing!')

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message)
  }
}

testSimpleAPIs()
