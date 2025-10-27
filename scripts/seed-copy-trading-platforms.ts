import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding copy trading platforms...')

  // Clear existing platforms
  await prisma.copyTradingPlatform.deleteMany({})
  console.log('✅ Cleared existing platforms')

  // Create Exness platform
  const exness = await prisma.copyTradingPlatform.create({
    data: {
      name: 'Exness',
      slug: 'exness',
      description: 'Trade with one of the world\'s leading forex brokers. Exness offers ultra-low spreads, instant execution, and excellent customer support.',
      logoUrl: '/uploads/1760975517917-exness.png', // You'll need to upload this
      copyTradingLink: 'https://one.exnesstrack.net/a/your-tracking-id',
      profitPercentage: 45.8,
      profitShareRate: 20,
      riskLevel: 'MEDIUM',
      minInvestment: 500,
      strategy: 'Scalping and day trading with focus on major currency pairs. Uses technical analysis and price action strategies.',
      roi: 45.8,
      winRate: 68.5,
      maxDrawdown: 12.3,
      isActive: true,
      displayOrder: 0,
      notes: 'Primary copy trading platform - Exness Social Trading'
    }
  })
  console.log('✅ Created Exness platform')

  // Create HFM platform
  const hfm = await prisma.copyTradingPlatform.create({
    data: {
      name: 'HFM',
      slug: 'hfm',
      description: 'HFM (HotForex) is a multi-award winning forex and commodities broker, providing trading services worldwide. Copy successful traders automatically.',
      logoUrl: '/uploads/hfm-logo.png', // You'll need to upload this
      copyTradingLink: 'https://www.hfm.com/sv/en/copy-trading',
      profitPercentage: 38.2,
      profitShareRate: 20,
      riskLevel: 'LOW',
      minInvestment: 300,
      strategy: 'Conservative swing trading approach focusing on gold, oil, and major forex pairs. Risk management is prioritized.',
      roi: 38.2,
      winRate: 72.1,
      maxDrawdown: 8.5,
      isActive: true,
      displayOrder: 1,
      notes: 'Secondary platform - HFM Copy Trading'
    }
  })
  console.log('✅ Created HFM platform')

  console.log('\n📊 Summary:')
  console.log(`- Created ${2} copy trading platforms`)
  console.log(`- Exness ID: ${exness.id}`)
  console.log(`- HFM ID: ${hfm.id}`)
  console.log('\n✨ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding copy trading platforms:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
