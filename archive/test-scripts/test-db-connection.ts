import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 Testing database connection...\n')
  
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully\n')
    
    // Count records
    const brokerCount = await prisma.broker.count()
    const platformCount = await prisma.copyTradingPlatform.count()
    const userCount = await prisma.user.count()
    const accountOpeningCount = await prisma.brokerAccountOpening.count()
    const subscriptionCount = await prisma.copyTradingSubscription.count()
    
    console.log('📊 Record Counts:')
    console.log(`   Brokers: ${brokerCount}`)
    console.log(`   Copy Trading Platforms: ${platformCount}`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Account Openings: ${accountOpeningCount}`)
    console.log(`   Copy Trading Subscriptions: ${subscriptionCount}`)
    console.log('')
    
    // Fetch brokers
    const brokers = await prisma.broker.findMany({
      orderBy: { displayOrder: 'asc' }
    })
    
    console.log('🏢 Brokers in Database:')
    brokers.forEach((broker, idx) => {
      console.log(`   ${idx + 1}. ${broker.name} (${broker.slug}) - Active: ${broker.isActive}`)
    })
    console.log('')
    
    // Fetch platforms
    const platforms = await prisma.copyTradingPlatform.findMany({
      orderBy: { displayOrder: 'asc' }
    })
    
    console.log('👨‍💼 Copy Trading Platforms in Database:')
    platforms.forEach((platform, idx) => {
      console.log(`   ${idx + 1}. ${platform.name} (${platform.slug}) - Risk: ${platform.riskLevel}, Profit: +${platform.profitPercentage}%`)
    })
    console.log('')
    
    console.log('✅ All data verified successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
