/**
 * One-time script to fix Brian Amooti's monthly challenge reward
 * This script claims the reward and pushes it to his affiliate account
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Finding Brian Amooti\'s account...')

    // Find Brian's user account
    const brian = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'brian', mode: 'insensitive' } },
          { name: { contains: 'brian', mode: 'insensitive' } },
          { name: { contains: 'amooti', mode: 'insensitive' } }
        ]
      },
      include: {
        affiliateProgram: true,
        monthlyChallenges: {
          where: {
            referralCount: { gte: 3 },
            rewardClaimed: false
          }
        }
      }
    })

    if (!brian) {
      console.log('❌ Brian Amooti not found')
      return
    }

    console.log(`✅ Found Brian: ${brian.name} (${brian.email})`)

    if (!brian.affiliateProgram) {
      console.log('❌ Brian does not have an affiliate account')
      return
    }

    console.log(`✅ Affiliate Code: ${brian.affiliateProgram.affiliateCode}`)

    // Find unclaimed completed challenges
    const unclaimedChallenges = brian.monthlyChallenges

    if (unclaimedChallenges.length === 0) {
      console.log('ℹ️  No unclaimed completed challenges found')
      return
    }

    console.log(`\n📊 Found ${unclaimedChallenges.length} unclaimed challenge(s):`)
    
    for (const challenge of unclaimedChallenges) {
      console.log(`\n  Month: ${challenge.month}`)
      console.log(`  Referrals: ${challenge.referralCount}/3`)
      console.log(`  Reward: $${challenge.rewardAmount}`)
      console.log(`  Status: ${challenge.rewardClaimed ? 'Claimed' : 'Unclaimed'}`)
    }

    console.log('\n🔧 Processing rewards...\n')

    // Process each unclaimed challenge
    for (const challenge of unclaimedChallenges) {
      console.log(`Processing ${challenge.month}...`)

      await prisma.$transaction(async (tx) => {
        // Mark challenge as claimed
        await tx.monthlyChallenge.update({
          where: { id: challenge.id },
          data: {
            rewardClaimed: true,
            claimedAt: new Date()
          }
        })

        // Create payout
        const payout = await tx.affiliatePayout.create({
          data: {
            affiliateProgramId: brian.affiliateProgram!.id,
            amount: challenge.rewardAmount,
            method: brian.affiliateProgram!.paymentMethod || 'PENDING',
            status: 'PENDING',
            notes: `Monthly Challenge Reward - ${challenge.month} (3 qualified referrals) - Fixed by admin`
          }
        })

        // Update affiliate program earnings
        await tx.affiliateProgram.update({
          where: { id: brian.affiliateProgram!.id },
          data: {
            pendingEarnings: {
              increment: challenge.rewardAmount
            },
            totalEarnings: {
              increment: challenge.rewardAmount
            }
          }
        })

        console.log(`  ✅ Reward claimed: $${challenge.rewardAmount}`)
        console.log(`  ✅ Payout created: ${payout.id}`)
      })
    }

    // Fetch updated affiliate program
    const updatedAffiliate = await prisma.affiliateProgram.findUnique({
      where: { id: brian.affiliateProgram.id }
    })

    console.log('\n✨ Summary:')
    console.log(`  Total Earnings: $${updatedAffiliate?.totalEarnings}`)
    console.log(`  Pending Earnings: $${updatedAffiliate?.pendingEarnings}`)
    console.log(`  Paid Earnings: $${updatedAffiliate?.paidEarnings}`)
    console.log('\n🎉 All rewards have been successfully claimed and pushed to affiliate account!')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
