const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAcademyRegistration() {
  try {
    console.log('🔍 Checking academy registrations...\n')
    
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

    console.log(`✅ Found IVAN: ${ivan.email} (ID: ${ivan.id})`)
    console.log(`   Referred by: ${ivan.referredByCode}\n`)

    // Check academy registrations
    const registrations = await prisma.academyClassRegistration.findMany({
      where: { userId: ivan.id },
      include: {
        academyClass: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📚 Academy Registrations: ${registrations.length}`)
    registrations.forEach(reg => {
      console.log(`\n   Class: ${reg.academyClass.title}`)
      console.log(`   Price: $${reg.academyClass.price}`)
      console.log(`   User ID: ${reg.userId || 'NULL'}`)
      console.log(`   Status: ${reg.status}`)
      console.log(`   Payment: ${reg.paymentStatus}`)
      console.log(`   Created: ${reg.createdAt}`)
    })

    // Check if commissions exist for academy
    const academyCommissions = await prisma.affiliateCommission.findMany({
      where: {
        referredUserId: ivan.id,
        type: 'ACADEMY'
      }
    })

    console.log(`\n💰 Academy Commissions: ${academyCommissions.length}`)
    academyCommissions.forEach(comm => {
      console.log(`   Amount: $${comm.amount}`)
      console.log(`   Status: ${comm.status}`)
      console.log(`   Description: ${comm.description}`)
      console.log(`   Created: ${comm.createdAt}`)
    })

    // Check Brian's affiliate program
    if (ivan.referredByCode) {
      const brianAffiliate = await prisma.affiliateProgram.findUnique({
        where: { affiliateCode: ivan.referredByCode },
        select: {
          id: true,
          affiliateCode: true,
          totalEarnings: true,
          pendingEarnings: true,
          isActive: true
        }
      })

      console.log(`\n👤 Brian's Affiliate:`)
      console.log(`   Code: ${brianAffiliate?.affiliateCode}`)
      console.log(`   Active: ${brianAffiliate?.isActive}`)
      console.log(`   Total Earnings: $${brianAffiliate?.totalEarnings}`)
      console.log(`   Pending: $${brianAffiliate?.pendingEarnings}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAcademyRegistration()
