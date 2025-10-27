import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing Brian Amooti monthly challenge tracking...\n')

  // Find Brian
  const brian = await prisma.user.findUnique({
    where: { email: 'brian@corefx.com' }
  })

  if (!brian) {
    console.log('❌ Brian not found!')
    return
  }

  console.log(`✅ Found Brian: ${brian.name || brian.email}`)

  // Find Brian's affiliate program
  const affiliate = await prisma.affiliateProgram.findUnique({
    where: { userId: brian.id }
  })

  if (!affiliate) {
    console.log('❌ Brian does not have an affiliate program!')
    return
  }

  console.log(`✅ Affiliate Code: ${affiliate.affiliateCode}`)

  // Find users referred by Brian
  const referredUsers = await prisma.user.findMany({
    where: { referredByCode: affiliate.affiliateCode }
  })

  console.log(`\n👥 Users referred by Brian: ${referredUsers.length}`)

  if (referredUsers.length === 0) {
    console.log('❌ No referred users found!')
    return
  }

  // Check which referred users have copy trading subscriptions
  const qualifiedUsers: string[] = []
  
  for (const user of referredUsers) {
    const subscriptions = await prisma.copyTradingSubscription.findMany({
      where: { userId: user.id },
      include: { platform: true }
    })

    if (subscriptions.length > 0) {
      console.log(`\n✅ ${user.email}:`)
      console.log(`   Subscriptions: ${subscriptions.length}`)
      subscriptions.forEach(sub => {
        console.log(`   - ${sub.platform.name}: $${sub.investmentUSD} (${sub.status})`)
      })
      qualifiedUsers.push(user.id)
    }
  }

  console.log(`\n📊 Qualified users (with copy trading): ${qualifiedUsers.length}`)

  if (qualifiedUsers.length === 0) {
    console.log('❌ No qualified users found!')
    return
  }

  // Get current month
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  console.log(`\n🏆 Updating monthly challenge for ${currentMonth}...`)

  // Update or create monthly challenge
  const challenge = await prisma.monthlyChallenge.upsert({
    where: {
      userId_month: {
        userId: brian.id,
        month: currentMonth
      }
    },
    create: {
      userId: brian.id,
      month: currentMonth,
      referralCount: qualifiedUsers.length,
      qualifiedReferrals: qualifiedUsers,
      rewardClaimed: false,
      rewardAmount: 1000
    },
    update: {
      referralCount: qualifiedUsers.length,
      qualifiedReferrals: qualifiedUsers
    }
  })

  console.log(`\n✅ Monthly challenge updated!`)
  console.log(`   Progress: ${challenge.referralCount}/3`)
  console.log(`   Qualified Referrals: ${challenge.qualifiedReferrals.length}`)
  console.log(`   Reward: $${challenge.rewardAmount}`)
  console.log(`   Claimed: ${challenge.rewardClaimed}`)

  if (challenge.referralCount >= 3) {
    console.log(`\n🎉 Brian has completed the challenge! He can claim the $1,000 reward!`)
  } else {
    console.log(`\n📈 Brian needs ${3 - challenge.referralCount} more qualified referral(s)`)
  }

  console.log('\n✅ Done!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
