import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAffiliateStatus() {
  try {
    // Check for brian@corefx.com
    const user = await prisma.user.findUnique({
      where: { email: 'brian@corefx.com' },
      include: {
        affiliateProgram: true
      }
    })

    if (!user) {
      console.log('❌ User not found: brian@corefx.com')
      return
    }

    console.log('✅ User found:', user.email)
    console.log('User ID:', user.id)
    console.log('User Name:', user.name)
    
    if (user.affiliateProgram) {
      console.log('\n✅ ALREADY REGISTERED AS AFFILIATE')
      console.log('Affiliate Code:', user.affiliateProgram.affiliateCode)
      console.log('Tier:', user.affiliateProgram.tier)
      console.log('Commission Rate:', user.affiliateProgram.commissionRate + '%')
      console.log('Total Earnings:', '$' + user.affiliateProgram.totalEarnings.toFixed(2))
      console.log('Is Active:', user.affiliateProgram.isActive)
    } else {
      console.log('\n❌ NOT REGISTERED AS AFFILIATE')
      console.log('User can register now')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAffiliateStatus()
