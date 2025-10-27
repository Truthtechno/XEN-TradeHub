const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkBrianAccount() {
  try {
    console.log('🔍 Checking Brian account...\n')
    
    // Find Brian by email
    const brian = await prisma.user.findFirst({
      where: {
        email: 'brayamooti@gmail.com'
      }
    })

    if (!brian) {
      console.log('❌ Brian not found with email: brayamooti@gmail.com')
      return
    }

    console.log(`✅ Found Brian:`)
    console.log(`   ID: ${brian.id}`)
    console.log(`   Name: ${brian.name}`)
    console.log(`   Email: ${brian.email}`)
    console.log(`   Role: ${brian.role}`)
    console.log(`   Referred By: ${brian.referredByCode || 'None'}`)

    // Check if Brian has an affiliate program
    const brianAffiliate = await prisma.affiliateProgram.findFirst({
      where: { userId: brian.id }
    })

    if (brianAffiliate) {
      console.log(`\n💼 Brian's Affiliate Program:`)
      console.log(`   Code: ${brianAffiliate.affiliateCode}`)
      console.log(`   Active: ${brianAffiliate.isActive}`)
      console.log(`   Earnings: $${brianAffiliate.totalEarnings}`)
      console.log(`   Pending: $${brianAffiliate.pendingEarnings}`)
    } else {
      console.log(`\n❌ Brian does NOT have an affiliate program`)
    }

    // Check IVAN
    const ivan = await prisma.user.findFirst({
      where: {
        email: { contains: 'signal', mode: 'insensitive' }
      }
    })

    if (ivan) {
      console.log(`\n✅ Found IVAN:`)
      console.log(`   ID: ${ivan.id}`)
      console.log(`   Name: ${ivan.name}`)
      console.log(`   Email: ${ivan.email}`)
      console.log(`   Referred By: ${ivan.referredByCode || 'None'}`)
    }

    console.log(`\n📊 Summary:`)
    console.log(`   Brian (brayamooti@gmail.com) is ${brian.referredByCode ? 'REFERRED by ' + brian.referredByCode : 'NOT referred'}`)
    console.log(`   IVAN (signal@corefx.com) is ${ivan?.referredByCode ? 'REFERRED by ' + ivan.referredByCode : 'NOT referred'}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBrianAccount()
