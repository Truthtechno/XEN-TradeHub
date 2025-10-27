const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkIvanTransactions() {
  try {
    console.log('🔍 Checking IVAN\'s transactions...\n')
    
    // Find IVAN
    const ivan = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'signal', mode: 'insensitive' } },
          { email: { contains: 'ivan', mode: 'insensitive' } }
        ]
      }
    })

    if (!ivan) {
      console.log('❌ IVAN not found')
      return
    }

    console.log(`✅ Found IVAN: ${ivan.email} (ID: ${ivan.id})`)
    console.log(`   Referred by: ${ivan.referredByCode}\n`)

    // Check academy registrations
    const academyRegs = await prisma.academyClassRegistration.findMany({
      where: { userId: ivan.id },
      include: {
        academyClass: {
          select: {
            title: true,
            price: true
          }
        }
      }
    })

    console.log(`📚 Academy Registrations: ${academyRegs.length}`)
    academyRegs.forEach(reg => {
      console.log(`   - ${reg.academyClass.title}: $${reg.academyClass.price}`)
      console.log(`     Status: ${reg.status}, Payment: ${reg.paymentStatus}`)
      console.log(`     Created: ${reg.createdAt}`)
    })

    // Check copy trading subscriptions
    const copyTradingSubs = await prisma.copyTradingSubscription.findMany({
      where: { userId: ivan.id },
      include: {
        trader: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`\n📈 Copy Trading Subscriptions: ${copyTradingSubs.length}`)
    copyTradingSubs.forEach(sub => {
      console.log(`   - ${sub.trader.name}: $${sub.investmentUSD}`)
      console.log(`     Status: ${sub.status}`)
      console.log(`     Created: ${sub.createdAt}`)
    })

    // Check broker account openings
    const brokerAccounts = await prisma.brokerAccountOpening.findMany({
      where: { userId: ivan.id },
      include: {
        broker: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`\n🏦 Broker Account Openings: ${brokerAccounts.length}`)
    brokerAccounts.forEach(acc => {
      console.log(`   - ${acc.broker.name}`)
      console.log(`     Status: ${acc.status}`)
      console.log(`     Account ID: ${acc.accountId || 'N/A'}`)
      console.log(`     Created: ${acc.createdAt}`)
    })

    // Check existing commissions
    const commissions = await prisma.affiliateCommission.findMany({
      where: { referredUserId: ivan.id },
      include: {
        affiliateProgram: {
          select: {
            affiliateCode: true
          }
        }
      }
    })

    console.log(`\n💰 Existing Commissions: ${commissions.length}`)
    commissions.forEach(comm => {
      console.log(`   - ${comm.type}: $${comm.amount}`)
      console.log(`     Status: ${comm.status}`)
      console.log(`     Description: ${comm.description}`)
      console.log(`     Created: ${comm.createdAt}`)
    })

    // Check referral status
    const referral = await prisma.affiliateReferral.findFirst({
      where: { referredUserId: ivan.id }
    })

    console.log(`\n🔗 Referral Status:`)
    if (referral) {
      console.log(`   Status: ${referral.status}`)
      console.log(`   Created: ${referral.createdAt}`)
      console.log(`   Converted: ${referral.conversionDate || 'Not yet'}`)
    } else {
      console.log(`   ❌ No referral record found`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkIvanTransactions()
