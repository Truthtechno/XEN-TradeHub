/**
 * Verify Trade & Broker data
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyTradeData() {
  try {
    console.log('🔍 Verifying Trade & Broker data...')
    
    // Check broker links
    const links = await prisma.brokerLink.findMany({
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    })
    
    console.log(`\n📊 Broker Links (${links.length}):`)
    for (const link of links) {
      console.log(`   ${link.name}: ${link._count.registrations} registrations (${link.isActive ? 'Active' : 'Inactive'})`)
    }
    
    // Check affiliate clicks
    const totalClicks = await prisma.affiliateClick.count()
    console.log(`\n👆 Total Affiliate Clicks: ${totalClicks}`)
    
    // Check registrations
    const registrations = await prisma.brokerRegistration.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        link: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    console.log(`\n📝 Recent Registrations (${registrations.length} total):`)
    for (const reg of registrations) {
      console.log(`   ${reg.user.name} (${reg.user.email}) - ${reg.link.name}`)
    }
    
    // Check broker accounts
    const accounts = await prisma.brokerAccount.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`\n🏦 Broker Accounts (${accounts.length}):`)
    for (const account of accounts) {
      console.log(`   ${account.user.name}: ${account.brokerName} - ${account.status}`)
    }
    
    // Calculate conversion rate
    const conversionRate = totalClicks > 0 ? (registrations.length / totalClicks) * 100 : 0
    console.log(`\n📈 Conversion Rate: ${conversionRate.toFixed(1)}%`)
    
  } catch (error) {
    console.error('❌ Error verifying data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyTradeData()
