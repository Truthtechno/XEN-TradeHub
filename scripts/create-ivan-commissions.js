const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createCommissionsForIvan() {
  try {
    console.log('🔄 Creating commissions for IVAN AFFILIATE...')
    
    // Find IVAN's user account
    const ivan = await prisma.user.findFirst({
      where: {
        email: {
          contains: 'signal',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        referredByCode: true
      }
    })

    if (!ivan) {
      console.log('❌ IVAN user not found')
      return
    }

    console.log(`✅ Found IVAN: ${ivan.email}`)
    console.log(`   Referred by code: ${ivan.referredByCode}`)

    if (!ivan.referredByCode) {
      console.log('❌ IVAN was not referred by anyone')
      return
    }

    // Find Brian's affiliate program
    const brianAffiliate = await prisma.affiliateProgram.findUnique({
      where: { affiliateCode: ivan.referredByCode },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!brianAffiliate) {
      console.log(`❌ Affiliate program not found for code: ${ivan.referredByCode}`)
      return
    }

    console.log(`✅ Found affiliate: ${brianAffiliate.user.email}`)
    console.log(`   Tier: ${brianAffiliate.tier}`)
    console.log(`   Commission Rate: ${brianAffiliate.commissionRate}%`)

    // Find IVAN's transactions
    const academyRegistrations = await prisma.academyClassRegistration.findMany({
      where: { userId: ivan.id },
      include: {
        academyClass: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    })

    const copyTradingSubscriptions = await prisma.copyTradingSubscription.findMany({
      where: { userId: ivan.id },
      include: {
        trader: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log(`\n📊 IVAN's Transactions:`)
    console.log(`   Academy Registrations: ${academyRegistrations.length}`)
    console.log(`   Copy Trading Subscriptions: ${copyTradingSubscriptions.length}`)

    let totalCommissions = 0
    let createdCount = 0

    // Create commissions for academy registrations
    for (const registration of academyRegistrations) {
      const price = registration.academyClass.price
      if (price <= 0) continue

      // Check if commission already exists
      const existing = await prisma.affiliateCommission.findFirst({
        where: {
          affiliateProgramId: brianAffiliate.id,
          referredUserId: ivan.id,
          type: 'ACADEMY',
          relatedEntityId: registration.academyClass.id
        }
      })

      if (existing) {
        console.log(`   ⏭️  Academy commission already exists for: ${registration.academyClass.title}`)
        continue
      }

      const commissionAmount = price * (brianAffiliate.commissionRate / 100)

      const commission = await prisma.affiliateCommission.create({
        data: {
          affiliateProgramId: brianAffiliate.id,
          referredUserId: ivan.id,
          amount: commissionAmount,
          type: 'ACADEMY',
          description: `Academy class enrollment commission - ${registration.academyClass.title}`,
          status: 'APPROVED',
          requiresVerification: false,
          relatedEntityType: 'ACADEMY_CLASS',
          relatedEntityId: registration.academyClass.id
        }
      })

      console.log(`   ✅ Created academy commission: $${commissionAmount.toFixed(2)} for ${registration.academyClass.title}`)
      totalCommissions += commissionAmount
      createdCount++
    }

    // Create commissions for copy trading subscriptions
    for (const subscription of copyTradingSubscriptions) {
      const investment = subscription.investmentUSD
      if (investment <= 0) continue

      // Check if commission already exists
      const existing = await prisma.affiliateCommission.findFirst({
        where: {
          affiliateProgramId: brianAffiliate.id,
          referredUserId: ivan.id,
          type: 'COPY_TRADING',
          relatedEntityId: subscription.id
        }
      })

      if (existing) {
        console.log(`   ⏭️  Copy trading commission already exists for: ${subscription.trader.name}`)
        continue
      }

      const commissionAmount = investment * (brianAffiliate.commissionRate / 100)

      const commission = await prisma.affiliateCommission.create({
        data: {
          affiliateProgramId: brianAffiliate.id,
          referredUserId: ivan.id,
          amount: commissionAmount,
          type: 'COPY_TRADING',
          description: `Copy trading subscription commission - $${investment.toFixed(2)} investment with ${subscription.trader.name}`,
          status: 'PENDING',
          requiresVerification: true,
          verificationData: {
            investmentAmount: investment,
            subscriptionId: subscription.id,
            requiresDepositVerification: true
          },
          relatedEntityType: 'COPY_TRADING_SUBSCRIPTION',
          relatedEntityId: subscription.id
        }
      })

      console.log(`   ✅ Created copy trading commission: $${commissionAmount.toFixed(2)} for ${subscription.trader.name} (PENDING VERIFICATION)`)
      totalCommissions += commissionAmount
      createdCount++
    }

    // Update affiliate earnings for approved commissions only
    if (createdCount > 0) {
      const approvedCommissions = await prisma.affiliateCommission.findMany({
        where: {
          affiliateProgramId: brianAffiliate.id,
          referredUserId: ivan.id,
          status: 'APPROVED'
        }
      })

      const approvedTotal = approvedCommissions.reduce((sum, c) => sum + c.amount, 0)

      await prisma.affiliateProgram.update({
        where: { id: brianAffiliate.id },
        data: {
          totalEarnings: approvedTotal,
          pendingEarnings: approvedTotal
        }
      })

      // Mark referral as converted
      await prisma.affiliateReferral.updateMany({
        where: {
          affiliateProgramId: brianAffiliate.id,
          referredUserId: ivan.id,
          status: 'PENDING'
        },
        data: {
          status: 'CONVERTED',
          conversionDate: new Date()
        }
      })

      console.log(`\n💰 Summary:`)
      console.log(`   Commissions Created: ${createdCount}`)
      console.log(`   Total Commission Amount: $${totalCommissions.toFixed(2)}`)
      console.log(`   Approved & Added to Earnings: $${approvedTotal.toFixed(2)}`)
      console.log(`   Pending Verification: $${(totalCommissions - approvedTotal).toFixed(2)}`)
      console.log(`\n✅ Commissions created successfully!`)
    } else {
      console.log(`\n⚠️  No new commissions to create`)
    }

  } catch (error) {
    console.error('❌ Error creating commissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createCommissionsForIvan()
