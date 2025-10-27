import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Adding test data with varied dates...')

  // Update some existing users to have different creation dates
  const users = await prisma.user.findMany({ take: 12 })
  
  // 3 users from 3 days ago
  for (let i = 0; i < 3 && i < users.length; i++) {
    await prisma.user.update({
      where: { id: users[i].id },
      data: { createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    })
  }
  
  // 3 users from 15 days ago
  for (let i = 3; i < 6 && i < users.length; i++) {
    await prisma.user.update({
      where: { id: users[i].id },
      data: { createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) }
    })
  }
  
  // 3 users from 45 days ago
  for (let i = 6; i < 9 && i < users.length; i++) {
    await prisma.user.update({
      where: { id: users[i].id },
      data: { createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) }
    })
  }
  
  // 3 users from 100 days ago
  for (let i = 9; i < 12 && i < users.length; i++) {
    await prisma.user.update({
      where: { id: users[i].id },
      data: { createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) }
    })
  }

  // Update academy registrations
  const academyRegs = await prisma.academyClassRegistration.findMany()
  if (academyRegs.length > 0) {
    // 1 registration from 3 days ago
    await prisma.academyClassRegistration.update({
      where: { id: academyRegs[0].id },
      data: { createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    })
  }
  if (academyRegs.length > 1) {
    // 1 registration from 50 days ago
    await prisma.academyClassRegistration.update({
      where: { id: academyRegs[1].id },
      data: { createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000) }
    })
  }

  // Update copy trading subscriptions
  const copyTradingSubs = await prisma.copyTradingSubscription.findMany({ take: 9 })
  for (let i = 0; i < 3 && i < copyTradingSubs.length; i++) {
    await prisma.copyTradingSubscription.update({
      where: { id: copyTradingSubs[i].id },
      data: { createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    })
  }
  for (let i = 3; i < 6 && i < copyTradingSubs.length; i++) {
    await prisma.copyTradingSubscription.update({
      where: { id: copyTradingSubs[i].id },
      data: { createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) }
    })
  }
  for (let i = 6; i < 9 && i < copyTradingSubs.length; i++) {
    await prisma.copyTradingSubscription.update({
      where: { id: copyTradingSubs[i].id },
      data: { createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
    })
  }

  // Verify the changes
  const stats = await prisma.$queryRaw`
    SELECT 
      'Users' as table_name,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
    FROM users
    UNION ALL
    SELECT 
      'Academy Regs' as table_name,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
    FROM academy_class_registrations
    UNION ALL
    SELECT 
      'Copy Trading' as table_name,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
    FROM copy_trading_subscriptions
  `

  console.log('\n✅ Test data updated with varied dates:')
  console.log(stats)
  
  console.log('\n📊 Expected Results:')
  console.log('- All Time: Should show all records')
  console.log('- Last 7 days: Should show fewer records')
  console.log('- Last 30 days: Should show more than 7 days but less than all')
  console.log('- Last 90 days: Should show most records')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
