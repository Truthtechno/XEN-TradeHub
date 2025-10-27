const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkBrianAffiliate() {
  try {
    console.log('🔍 Checking Brian affiliate...\n')
    
    // Find Brian by email
    const brian = await prisma.user.findFirst({
      where: {
        email: 'brian@corefx.com'
      }
    })

    if (!brian) {
      console.log('❌ Brian not found')
      return
    }

    console.log(`✅ Found Brian:`)
    console.log(`   ID: ${brian.id}`)
    console.log(`   Email: ${brian.email}`)

    // Find Brian's affiliate program
    const brianAffiliate = await prisma.affiliateProgram.findFirst({
      where: { userId: brian.id }
    })

    if (!brianAffiliate) {
      console.log('\n❌ Brian does not have an affiliate program')
      return
    }

    console.log(`\n✅ Brian's Affiliate Program:`)
    console.log(`   ID: ${brianAffiliate.id}`)
    console.log(`   Code: ${brianAffiliate.affiliateCode}`)
    console.log(`   Earnings: $${brianAffiliate.totalEarnings}`)

    // Find all commissions for Brian's affiliate program
    const commissions = await prisma.affiliateCommission.findMany({
      where: {
        affiliateProgramId: brianAffiliate.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        status: true,
        createdAt: true
      }
    })

    console.log(`\n💰 Commissions for Brian: ${commissions.length}`)
    commissions.forEach((comm, index) => {
      console.log(`\n   ${index + 1}. ${comm.type}`)
      console.log(`      Amount: $${comm.amount}`)
      console.log(`      Status: ${comm.status}`)
      console.log(`      Description: ${comm.description}`)
      console.log(`      Date: ${comm.createdAt}`)
    })

    console.log(`\n📊 Summary:`)
    console.log(`   Total Commissions: ${commissions.length}`)
    console.log(`   Approved: $${commissions.filter(c => c.status === 'APPROVED').reduce((sum, c) => sum + c.amount, 0).toFixed(2)}`)
    console.log(`   Pending: $${commissions.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.amount, 0).toFixed(2)}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBrianAffiliate()
