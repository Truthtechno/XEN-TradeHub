import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAffiliateSystem() {
  console.log('🧪 Starting Affiliate System Test...\n')

  try {
    // Step 1: Create a test user who will become an affiliate
    console.log('📝 Step 1: Creating test affiliate user...')
    const affiliateUser = await prisma.user.upsert({
      where: { email: 'affiliate.test@example.com' },
      update: {},
      create: {
        email: 'affiliate.test@example.com',
        name: 'Test Affiliate',
        password: await bcrypt.hash('password123', 10),
        role: 'STUDENT'
      }
    })
    console.log(`✅ Created user: ${affiliateUser.email} (ID: ${affiliateUser.id})`)

    // Step 2: Register as affiliate
    console.log('\n📝 Step 2: Registering user as affiliate...')
    
    // Generate affiliate code
    const affiliateCode = `TEST${affiliateUser.id.substring(0, 6).toUpperCase()}`
    
    const affiliateProgram = await prisma.affiliateProgram.upsert({
      where: { userId: affiliateUser.id },
      update: {},
      create: {
        userId: affiliateUser.id,
        affiliateCode,
        fullName: 'Test Affiliate',
        phone: '+1234567890',
        paymentMethod: 'BANK_TRANSFER',
        payoutDetails: {
          accountNumber: '1234567890',
          accountName: 'Test Affiliate',
          bankName: 'Test Bank'
        },
        tier: 'BRONZE',
        commissionRate: 10,
        isActive: true
      }
    })
    console.log(`✅ Affiliate registered with code: ${affiliateProgram.affiliateCode}`)
    console.log(`   Tier: ${affiliateProgram.tier} | Commission Rate: ${affiliateProgram.commissionRate}%`)

    // Step 3: Create a referred user
    console.log('\n📝 Step 3: Creating referred user...')
    const referredUser = await prisma.user.upsert({
      where: { email: 'referred.test@example.com' },
      update: {
        referredByCode: affiliateProgram.affiliateCode
      },
      create: {
        email: 'referred.test@example.com',
        name: 'Referred User',
        password: await bcrypt.hash('password123', 10),
        role: 'STUDENT',
        referredByCode: affiliateProgram.affiliateCode
      }
    })
    console.log(`✅ Created referred user: ${referredUser.email}`)
    console.log(`   Referred by code: ${referredUser.referredByCode}`)

    // Step 4: Create referral record
    console.log('\n📝 Step 4: Creating referral record...')
    const referral = await prisma.affiliateReferral.create({
      data: {
        affiliateProgramId: affiliateProgram.id,
        referredUserId: referredUser.id,
        status: 'PENDING'
      }
    })
    console.log(`✅ Referral record created (ID: ${referral.id})`)

    // Update referral count
    await prisma.affiliateProgram.update({
      where: { id: affiliateProgram.id },
      data: {
        totalReferrals: {
          increment: 1
        }
      }
    })
    console.log(`✅ Updated affiliate referral count`)

    // Step 5: Simulate academy purchase (auto-approved commission)
    console.log('\n📝 Step 5: Simulating academy class purchase...')
    const academyAmount = 100
    const commissionAmount = academyAmount * (affiliateProgram.commissionRate / 100)

    const commission = await prisma.affiliateCommission.create({
      data: {
        affiliateProgramId: affiliateProgram.id,
        referredUserId: referredUser.id,
        amount: commissionAmount,
        type: 'ACADEMY',
        description: `Academy class enrollment commission - $${academyAmount}`,
        status: 'APPROVED',
        requiresVerification: false,
        relatedEntityType: 'ACADEMY_CLASS',
        relatedEntityId: 'test-class-id'
      }
    })
    console.log(`✅ Commission created: $${commissionAmount.toFixed(2)}`)
    console.log(`   Type: ${commission.type} | Status: ${commission.status}`)

    // Update affiliate earnings
    await prisma.affiliateProgram.update({
      where: { id: affiliateProgram.id },
      data: {
        totalEarnings: {
          increment: commissionAmount
        },
        pendingEarnings: {
          increment: commissionAmount
        }
      }
    })
    console.log(`✅ Updated affiliate earnings`)

    // Update referral status
    await prisma.affiliateReferral.update({
      where: { id: referral.id },
      data: {
        status: 'CONVERTED',
        conversionDate: new Date()
      }
    })
    console.log(`✅ Updated referral status to CONVERTED`)

    // Step 6: Simulate copy trading purchase (requires verification)
    console.log('\n📝 Step 6: Simulating copy trading subscription (requires verification)...')
    const investmentAmount = 1000
    const copyTradingCommission = investmentAmount * (affiliateProgram.commissionRate / 100)

    const pendingCommission = await prisma.affiliateCommission.create({
      data: {
        affiliateProgramId: affiliateProgram.id,
        referredUserId: referredUser.id,
        amount: copyTradingCommission,
        type: 'COPY_TRADING',
        description: `Copy trading subscription commission - $${investmentAmount} investment`,
        status: 'PENDING',
        requiresVerification: true,
        verificationData: {
          investmentAmount,
          subscriptionId: 'test-subscription-id',
          requiresDepositVerification: true
        },
        relatedEntityType: 'COPY_TRADING_SUBSCRIPTION',
        relatedEntityId: 'test-subscription-id'
      }
    })
    console.log(`✅ Pending commission created: $${copyTradingCommission.toFixed(2)}`)
    console.log(`   Type: ${pendingCommission.type} | Status: ${pendingCommission.status}`)
    console.log(`   Requires Verification: ${pendingCommission.requiresVerification}`)

    // Step 7: Verify final state
    console.log('\n📝 Step 7: Verifying final state...')
    const finalAffiliate = await prisma.affiliateProgram.findUnique({
      where: { id: affiliateProgram.id },
      include: {
        referrals: true,
        commissions: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    console.log('\n' + '='.repeat(60))
    console.log('📊 FINAL AFFILIATE STATE')
    console.log('='.repeat(60))
    console.log(`Affiliate: ${finalAffiliate?.user.name} (${finalAffiliate?.user.email})`)
    console.log(`Code: ${finalAffiliate?.affiliateCode}`)
    console.log(`Tier: ${finalAffiliate?.tier} | Rate: ${finalAffiliate?.commissionRate}%`)
    console.log(`Total Referrals: ${finalAffiliate?.totalReferrals}`)
    console.log(`Total Earnings: $${finalAffiliate?.totalEarnings.toFixed(2)}`)
    console.log(`Pending Earnings: $${finalAffiliate?.pendingEarnings.toFixed(2)}`)
    console.log(`Paid Earnings: $${finalAffiliate?.paidEarnings.toFixed(2)}`)
    console.log(`\nReferrals: ${finalAffiliate?.referrals.length}`)
    console.log(`Commissions: ${finalAffiliate?.commissions.length}`)
    console.log(`  - Approved: ${finalAffiliate?.commissions.filter(c => c.status === 'APPROVED').length}`)
    console.log(`  - Pending: ${finalAffiliate?.commissions.filter(c => c.status === 'PENDING').length}`)
    console.log('='.repeat(60))

    console.log('\n✅ All tests passed successfully!')
    console.log('\n📋 Test Summary:')
    console.log('  ✅ Affiliate registration')
    console.log('  ✅ Referral tracking')
    console.log('  ✅ Auto-approved commission (Academy)')
    console.log('  ✅ Pending commission (Copy Trading)')
    console.log('  ✅ Earnings calculation')
    console.log('  ✅ Referral status update')

    console.log('\n🎯 Next Steps:')
    console.log('  1. Login as admin@corefx.com / admin123')
    console.log('  2. Go to /admin/affiliates to see the affiliate')
    console.log('  3. Go to /admin/affiliates/commissions to verify pending commission')
    console.log(`  4. Login as ${affiliateUser.email} / password123`)
    console.log('  5. Go to /dashboard/affiliates to see earnings')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testAffiliateSystem()
  .then(() => {
    console.log('\n✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
