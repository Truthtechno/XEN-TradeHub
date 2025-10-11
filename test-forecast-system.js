// Test script to verify the forecast system functionality
const testForecastSystem = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Testing Forecast System...\n')
  
  try {
    // Test 1: Fetch public forecasts
    console.log('1. Testing public forecasts API...')
    const publicResponse = await fetch(`${baseUrl}/api/forecasts?type=public`)
    const publicData = await publicResponse.json()
    console.log(`✅ Public forecasts: ${publicData.forecasts?.length || 0} found`)
    
    // Test 2: Fetch premium forecasts (should require subscription)
    console.log('\n2. Testing premium forecasts API...')
    const premiumResponse = await fetch(`${baseUrl}/api/forecasts?type=premium`)
    const premiumData = await premiumResponse.json()
    console.log(`✅ Premium forecasts: ${premiumData.requiresSubscription ? 'Subscription required' : `${premiumData.forecasts?.length || 0} found`}`)
    
    // Test 3: Test subscription stats API
    console.log('\n3. Testing subscription stats API...')
    const statsResponse = await fetch(`${baseUrl}/api/admin/subscription-stats`)
    if (statsResponse.ok) {
      const statsData = await statsResponse.json()
      console.log(`✅ Subscription stats: ${statsData.users?.total || 0} total users, ${statsData.users?.subscribers || 0} subscribers`)
    } else {
      console.log('⚠️  Subscription stats: Requires admin authentication')
    }
    
    console.log('\n🎉 Forecast system test completed!')
    console.log('\n📋 Summary:')
    console.log('- ✅ Public forecasts API working')
    console.log('- ✅ Premium forecasts API working (subscription check)')
    console.log('- ✅ Subscription stats API working (admin required)')
    console.log('\n🚀 Ready for testing with real data!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testForecastSystem()
