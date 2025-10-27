import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking referral tracking for Brian Amooti...\n')

  // Find Brian
  const brian = await prisma.user.findUnique({
    where: { email: 'brian@corefx.com' }
  })

  if (!brian) {
    console.log('❌ Brian not found!')
    return
  }

  console.log('👤 Brian Amooti:')
  console.log(`   ID: ${brian.id}`)
  console.log(`   Email: ${brian.email}`)

  // Find Brian's affiliate program
  const affiliate = await prisma.affiliateProgram.findUnique({
    where: { userId: brian.id }
  })

  if (!affiliate) {
    console.log('❌ Brian does not have an affiliate program!')
    return
  }

  console.log(`\n💼 Affiliate Program:`)
  console.log(`   Referral Code: ${affiliate.affiliateCode}`)
  console.log(`   Tier: ${affiliate.tier}`)

  // Find users referred by Brian
  const referredUsers = await prisma.user.findMany({
    where: { referredByCode: affiliate.affiliateCode }
  })

  console.log(`\n👥 Users Referred by Brian (${referredUsers.length}):`)
  for (const user of referredUsers) {
    console.log(`\n   📧 ${user.email}`)
    console.log(`      ID: ${user.id}`)
    console.log(`      Name: ${user.name || 'N/A'}`)
    console.log(`      Referred By Code: ${user.referredByCode}`)
    console.log(`      Created: ${user.createdAt}`)

    // Check if they have copy trading subscriptions
    const subscriptions = await prisma.copyTradingSubscription.findMany({
      where: { userId: user.id },
      include: { platform: true }
    })

    if (subscriptions.length > 0) {
      console.log(`      ✅ Copy Trading Subscriptions: ${subscriptions.length}`)
      subscriptions.forEach((sub, idx) => {
        console.log(`         ${idx + 1}. ${sub.platform.name} - $${sub.investmentUSD} (${sub.status})`)
      })
    } else {
      console.log(`      ❌ No copy trading subscriptions`)
    }
  }

  // Check Brian's monthly challenge progress
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const challenge = await prisma.monthlyChallenge.findUnique({
    where: {
      userId_month: {
        userId: brian.id,
        month: currentMonth
      }
    }
  })

  console.log(`\n🏆 Monthly Challenge Progress (${currentMonth}):`)
  if (challenge) {
    console.log(`   Referral Count: ${challenge.referralCount}/3`)
    console.log(`   Qualified Referrals: ${JSON.stringify(challenge.qualifiedReferrals)}`)
    console.log(`   Reward Claimed: ${challenge.rewardClaimed}`)
  } else {
    console.log(`   ❌ No challenge progress found`)
  }

  // Check IVAN AFFILIATE specifically
  const ivan = await prisma.user.findUnique({
    where: { email: 'signal@corefx.com' }
  })

  if (ivan) {
    console.log(`\n🔍 Checking IVAN AFFILIATE:`)
    console.log(`   Email: ${ivan.email}`)
    console.log(`   Referred By Code: ${ivan.referredByCode || 'NONE'}`)
    console.log(`   Expected Code: ${affiliate.affiliateCode}`)
    console.log(`   Match: ${ivan.referredByCode === affiliate.affiliateCode ? '✅ YES' : '❌ NO'}`)

    const ivanSubs = await prisma.copyTradingSubscription.findMany({
      where: { userId: ivan.id },
      include: { platform: true }
    })

    console.log(`   Copy Trading Subscriptions: ${ivanSubs.length}`)
    ivanSubs.forEach((sub, idx) => {
      console.log(`      ${idx + 1}. ${sub.platform.name} - $${sub.investmentUSD} (${sub.status}) - ${sub.createdAt}`)
    })
  }

  console.log('\n✅ Diagnostic complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
