import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixNegativePendingEarnings() {
  try {
    console.log('🔍 Checking for affiliates with negative pending earnings...')

    // Find all affiliates with negative pending earnings
    const affiliatesWithNegative = await prisma.affiliateProgram.findMany({
      where: {
        pendingEarnings: {
          lt: 0
        }
      },
      select: {
        id: true,
        affiliateCode: true,
        pendingEarnings: true,
        paidEarnings: true,
        totalEarnings: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (affiliatesWithNegative.length === 0) {
      console.log('✅ No affiliates with negative pending earnings found!')
      return
    }

    console.log(`\n⚠️  Found ${affiliatesWithNegative.length} affiliate(s) with negative pending earnings:\n`)

    for (const affiliate of affiliatesWithNegative) {
      console.log(`📋 Affiliate: ${affiliate.user.name || affiliate.user.email}`)
      console.log(`   Code: ${affiliate.affiliateCode}`)
      console.log(`   Current Pending: $${affiliate.pendingEarnings.toFixed(2)}`)
      console.log(`   Paid Earnings: $${affiliate.paidEarnings.toFixed(2)}`)
      console.log(`   Total Earnings: $${affiliate.totalEarnings.toFixed(2)}`)
      console.log('')
    }

    console.log('🔧 Fixing negative pending earnings...\n')

    // Fix each affiliate
    for (const affiliate of affiliatesWithNegative) {
      // Set pending earnings to 0 (it should never be negative)
      await prisma.affiliateProgram.update({
        where: { id: affiliate.id },
        data: {
          pendingEarnings: 0
        }
      })

      console.log(`✅ Fixed ${affiliate.affiliateCode}: Set pending earnings to $0.00`)
    }

    console.log(`\n✅ Successfully fixed ${affiliatesWithNegative.length} affiliate(s)!`)
    console.log('\n📊 Summary:')
    console.log('   - Negative pending earnings have been set to $0.00')
    console.log('   - Paid earnings remain unchanged')
    console.log('   - Total earnings remain unchanged')
    console.log('\n💡 Note: The root cause has been fixed in the API routes.')
    console.log('   Future payouts will work correctly.')

  } catch (error) {
    console.error('❌ Error fixing negative pending earnings:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixNegativePendingEarnings()
  .then(() => {
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
