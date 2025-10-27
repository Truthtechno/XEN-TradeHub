import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing referral tracking...\n')

  // Get command line arguments
  const referredUserEmail = process.argv[2]
  const referrerEmail = process.argv[3]

  if (!referredUserEmail || !referrerEmail) {
    console.log('Usage: npx ts-node scripts/fix-referral-tracking.ts <referred-user-email> <referrer-email>')
    console.log('Example: npx ts-node scripts/fix-referral-tracking.ts signal@corefx.com brian@corefx.com')
    return
  }

  // Find the referrer
  const referrer = await prisma.user.findUnique({
    where: { email: referrerEmail }
  })

  if (!referrer) {
    console.log(`❌ Referrer ${referrerEmail} not found!`)
    return
  }

  // Find referrer's affiliate program
  const affiliate = await prisma.affiliateProgram.findUnique({
    where: { userId: referrer.id }
  })

  if (!affiliate) {
    console.log(`❌ ${referrerEmail} does not have an affiliate program!`)
    return
  }

  console.log(`✅ Found referrer: ${referrer.name || referrer.email}`)
  console.log(`   Referral Code: ${affiliate.affiliateCode}`)

  // Find the referred user
  const referredUser = await prisma.user.findUnique({
    where: { email: referredUserEmail }
  })

  if (!referredUser) {
    console.log(`❌ Referred user ${referredUserEmail} not found!`)
    return
  }

  console.log(`\n✅ Found referred user: ${referredUser.name || referredUser.email}`)
  console.log(`   Current referredByCode: ${referredUser.referredByCode || 'NONE'}`)

  // Update the referred user's referredByCode
  if (referredUser.referredByCode !== affiliate.affiliateCode) {
    await prisma.user.update({
      where: { id: referredUser.id },
      data: { referredByCode: affiliate.affiliateCode }
    })
    console.log(`   ✅ Updated referredByCode to: ${affiliate.affiliateCode}`)
  } else {
    console.log(`   ℹ️  Already has correct referredByCode`)
  }

  // Check if user has copy trading subscriptions
  const subscriptions = await prisma.copyTradingSubscription.findMany({
    where: { userId: referredUser.id },
    include: { platform: true }
  })

  console.log(`\n📊 Copy Trading Subscriptions: ${subscriptions.length}`)

  if (subscriptions.length === 0) {
    console.log('   ⚠️  User has no copy trading subscriptions yet')
    return
  }

  // Get current month
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Check if already tracked in monthly challenge
  const existingChallenge = await prisma.monthlyChallenge.findUnique({
    where: {
      userId_month: {
        userId: referrer.id,
        month: currentMonth
      }
    }
  })

  const isAlreadyTracked = existingChallenge?.qualifiedReferrals.includes(referredUser.id)

  if (isAlreadyTracked && existingChallenge) {
    console.log(`\n✅ User is already tracked in monthly challenge`)
    console.log(`   Current progress: ${existingChallenge.referralCount}/3`)
    return
  }

  // Add to monthly challenge
  console.log(`\n🏆 Adding to monthly challenge...`)
  
  const updatedChallenge = await prisma.monthlyChallenge.upsert({
    where: {
      userId_month: {
        userId: referrer.id,
        month: currentMonth
      }
    },
    create: {
      userId: referrer.id,
      month: currentMonth,
      referralCount: 1,
      qualifiedReferrals: [referredUser.id],
      rewardClaimed: false,
      rewardAmount: 1000
    },
    update: {
      referralCount: {
        increment: 1
      },
      qualifiedReferrals: {
        push: referredUser.id
      }
    }
  })

  console.log(`\n✅ Monthly challenge updated!`)
  console.log(`   Referrer: ${referrer.name || referrer.email}`)
  console.log(`   Month: ${currentMonth}`)
  console.log(`   Progress: ${updatedChallenge.referralCount}/3`)
  console.log(`   Qualified Referrals: ${updatedChallenge.qualifiedReferrals.length}`)

  console.log(`\n🎉 Done! Referral tracking fixed.`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
