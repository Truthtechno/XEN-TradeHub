const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetIvanSubscriptions() {
  try {
    console.log('🔄 Resetting IVAN\'s subscriptions to PENDING status...\n')
    
    // Find IVAN
    const ivan = await prisma.user.findFirst({
      where: {
        email: { contains: 'signal', mode: 'insensitive' }
      }
    })

    if (!ivan) {
      console.log('❌ IVAN not found')
      return
    }

    console.log(`✅ Found IVAN: ${ivan.email}`)

    // Update all ACTIVE subscriptions to PENDING
    const result = await prisma.copyTradingSubscription.updateMany({
      where: {
        userId: ivan.id,
        status: 'ACTIVE'
      },
      data: {
        status: 'PENDING'
      }
    })

    console.log(`✅ Updated ${result.count} subscriptions to PENDING status`)

    // Delete existing commissions (they'll be recreated when admin activates)
    const deleteResult = await prisma.affiliateCommission.deleteMany({
      where: {
        referredUserId: ivan.id,
        type: 'COPY_TRADING'
      }
    })

    console.log(`✅ Deleted ${deleteResult.count} existing commissions`)

    // Reset affiliate earnings
    const brianAffiliate = await prisma.affiliateProgram.findUnique({
      where: { affiliateCode: ivan.referredByCode }
    })

    if (brianAffiliate) {
      await prisma.affiliateProgram.update({
        where: { id: brianAffiliate.id },
        data: {
          totalEarnings: 0,
          pendingEarnings: 0
        }
      })
      console.log(`✅ Reset Brian's earnings to $0.00`)
    }

    // Reset referral status to PENDING
    await prisma.affiliateReferral.updateMany({
      where: {
        referredUserId: ivan.id
      },
      data: {
        status: 'PENDING',
        conversionDate: null
      }
    })

    console.log(`✅ Reset referral status to PENDING`)

    console.log(`\n✅ Reset complete! Now admin can:`)
    console.log(`   1. Go to /admin/copy-trading`)
    console.log(`   2. Change IVAN's subscriptions from PENDING to ACTIVE`)
    console.log(`   3. Commissions will be created and approved automatically`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetIvanSubscriptions()
