/**
 * Add sample data for Trade & Broker page
 * This script creates broker links, affiliate clicks, and registrations
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedTradeBrokerData() {
  try {
    console.log('🎯 Adding sample data for Trade & Broker page...')
    
    // Get existing users
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      },
      take: 20
    })
    
    if (users.length === 0) {
      console.log('❌ No regular users found. Creating some test users first...')
      
      // Create some test users
      const testUsers = []
      for (let i = 1; i <= 15; i++) {
        const user = await prisma.user.create({
          data: {
            email: `trader${i}@example.com`,
            name: `Trader ${i}`,
            role: 'USER',
            isEmailVerified: true
          }
        })
        testUsers.push(user)
      }
      users.push(...testUsers)
    }
    
    console.log(`Using ${users.length} users for broker data simulation`)
    
    // 1. Create broker links
    console.log('\n🔗 Creating broker links...')
    
    const brokerLinks = [
      {
        name: 'Exness Main Link',
        url: 'https://exness.com/register?ref=corefx',
        isActive: true
      },
      {
        name: 'Exness Pro Link',
        url: 'https://exness.com/register?ref=corefx-pro',
        isActive: true
      },
      {
        name: 'Exness VIP Link',
        url: 'https://exness.com/register?ref=corefx-vip',
        isActive: true
      },
      {
        name: 'XM Trading Link',
        url: 'https://xm.com/register?ref=corefx',
        isActive: true
      },
      {
        name: 'IC Markets Link',
        url: 'https://icmarkets.com/register?ref=corefx',
        isActive: false
      }
    ]
    
    const createdLinks = []
    for (const linkData of brokerLinks) {
      // Check if link already exists
      let link = await prisma.brokerLink.findFirst({
        where: { url: linkData.url }
      })
      
      if (!link) {
        link = await prisma.brokerLink.create({
          data: linkData
        })
        console.log(`✅ Created broker link: ${link.name}`)
      } else {
        console.log(`ℹ️  Broker link already exists: ${link.name}`)
      }
      
      createdLinks.push(link)
    }
    
    // 2. Add affiliate clicks
    console.log('\n👆 Adding affiliate clicks...')
    
    const totalClicks = 150 // Total clicks across all links
    const clicksPerLink = Math.floor(totalClicks / createdLinks.length)
    
    for (const link of createdLinks) {
      // Random clicks for this link (between 20-40)
      const linkClicks = Math.floor(Math.random() * 21) + 20
      
      for (let i = 0; i < linkClicks; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomDaysAgo = Math.floor(Math.random() * 30) // Last 30 days
        
        await prisma.affiliateClick.create({
          data: {
            userId: randomUser.id,
            link: link.url,
            createdAt: new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000)
          }
        })
      }
      
      console.log(`✅ Added ${linkClicks} clicks for ${link.name}`)
    }
    
    // 3. Add broker registrations
    console.log('\n📝 Adding broker registrations...')
    
    const registrationStatuses = ['PENDING', 'VERIFIED', 'COMPLETED', 'REJECTED']
    const brokers = ['EXNESS', 'XM', 'IC Markets', 'FXCM', 'OANDA']
    
    // Create registrations for about 30% of clicks
    const totalRegistrations = Math.floor(totalClicks * 0.3)
    
    for (let i = 0; i < totalRegistrations; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomLink = createdLinks[Math.floor(Math.random() * createdLinks.length)]
      const randomStatus = registrationStatuses[Math.floor(Math.random() * registrationStatuses.length)]
      const randomBroker = brokers[Math.floor(Math.random() * brokers.length)]
      const randomDaysAgo = Math.floor(Math.random() * 25) // Last 25 days
      
      // Create broker registration
      const registration = await prisma.brokerRegistration.create({
        data: {
          userId: randomUser.id,
          linkId: randomLink.id,
          createdAt: new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000)
        }
      })
      
      // Create broker account for verified registrations
      if (randomStatus === 'VERIFIED' || randomStatus === 'COMPLETED') {
        await prisma.brokerAccount.upsert({
          where: { userId: randomUser.id },
          update: {
            brokerName: randomBroker,
            accountId: `ACC${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            status: randomStatus
          },
          create: {
            userId: randomUser.id,
            brokerName: randomBroker,
            accountId: `ACC${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            status: randomStatus
          }
        })
      }
    }
    
    console.log(`✅ Added ${totalRegistrations} broker registrations`)
    
    // 4. Show final statistics
    console.log('\n📊 Final Statistics:')
    
    const finalLinks = await prisma.brokerLink.findMany({
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    })
    
    const totalClicksCount = await prisma.affiliateClick.count()
    const totalRegistrationsCount = await prisma.brokerRegistration.count()
    const verifiedRegistrationsCount = await prisma.brokerAccount.count({
      where: {
        status: {
          in: ['VERIFIED', 'COMPLETED']
        }
      }
    })
    
    const conversionRate = totalClicksCount > 0 ? (totalRegistrationsCount / totalClicksCount) * 100 : 0
    
    console.log(`🔗 Total Broker Links: ${finalLinks.length}`)
    console.log(`👆 Total Clicks: ${totalClicksCount}`)
    console.log(`📝 Total Registrations: ${totalRegistrationsCount}`)
    console.log(`✅ Verified Accounts: ${verifiedRegistrationsCount}`)
    console.log(`📈 Conversion Rate: ${conversionRate.toFixed(1)}%`)
    
    console.log('\n📋 Broker Link Details:')
    for (const link of finalLinks) {
      console.log(`   ${link.name}: ${link._count.registrations} registrations`)
    }
    
    // Show recent registrations
    console.log('\n👥 Recent Registrations:')
    const recentRegistrations = await prisma.brokerRegistration.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
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
      }
    })
    
    for (const reg of recentRegistrations) {
      console.log(`   ${reg.user.name} (${reg.user.email}) - ${reg.link.name}`)
    }
    
  } catch (error) {
    console.error('❌ Error seeding trade broker data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTradeBrokerData()
