import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔗 Updating copy trading platform links...')

  // Update Exness
  const exness = await prisma.copyTradingPlatform.findFirst({
    where: { name: { contains: 'Exness', mode: 'insensitive' } }
  })

  if (exness) {
    await prisma.copyTradingPlatform.update({
      where: { id: exness.id },
      data: {
        copyTradingLink: 'https://www.exness.com/accounts/social-trading/'
      }
    })
    console.log('✅ Updated Exness copy trading link')
  }

  // Update HFM
  const hfm = await prisma.copyTradingPlatform.findFirst({
    where: { name: { contains: 'HFM', mode: 'insensitive' } }
  })

  if (hfm) {
    await prisma.copyTradingPlatform.update({
      where: { id: hfm.id },
      data: {
        copyTradingLink: 'https://www.hfm.com/en/copy-trading'
      }
    })
    console.log('✅ Updated HFM copy trading link')
  }

  // List all platforms
  const platforms = await prisma.copyTradingPlatform.findMany()
  console.log('\n📋 Current platforms:')
  platforms.forEach(p => {
    console.log(`  - ${p.name}: ${p.copyTradingLink || 'NO LINK SET'}`)
  })

  console.log('\n🎉 Done!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
