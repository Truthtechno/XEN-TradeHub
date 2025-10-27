const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAllRegistrations() {
  try {
    console.log('🔍 Checking all recent academy registrations...\n')
    
    // Get all registrations from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const registrations = await prisma.academyClassRegistration.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        academyClass: {
          select: {
            id: true,
            title: true,
            price: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            referredByCode: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📚 Total Registrations Today: ${registrations.length}\n`)

    registrations.forEach((reg, index) => {
      console.log(`Registration #${index + 1}:`)
      console.log(`   Class: ${reg.academyClass.title}`)
      console.log(`   Price: $${reg.academyClass.price}`)
      console.log(`   Full Name: ${reg.fullName}`)
      console.log(`   Email: ${reg.email}`)
      console.log(`   User ID: ${reg.userId || 'NULL (Guest Registration)'}`)
      if (reg.user) {
        console.log(`   User Email: ${reg.user.email}`)
        console.log(`   Referred By: ${reg.user.referredByCode || 'None'}`)
      }
      console.log(`   Status: ${reg.status}`)
      console.log(`   Payment: ${reg.paymentStatus}`)
      console.log(`   Created: ${reg.createdAt}`)
      console.log('')
    })

    // Check for commissions
    const commissions = await prisma.affiliateCommission.findMany({
      where: {
        type: 'ACADEMY',
        createdAt: {
          gte: today
        }
      },
      include: {
        affiliateProgram: {
          select: {
            affiliateCode: true
          }
        }
      }
    })

    console.log(`💰 Academy Commissions Today: ${commissions.length}\n`)
    commissions.forEach((comm, index) => {
      console.log(`Commission #${index + 1}:`)
      console.log(`   Amount: $${comm.amount}`)
      console.log(`   Status: ${comm.status}`)
      console.log(`   Affiliate: ${comm.affiliateProgram.affiliateCode}`)
      console.log(`   Description: ${comm.description}`)
      console.log(`   Created: ${comm.createdAt}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllRegistrations()
