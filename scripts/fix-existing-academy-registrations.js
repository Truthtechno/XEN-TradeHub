const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixExistingRegistrations() {
  try {
    console.log('🔧 Fixing existing academy registrations...\n')
    
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

    // Find Brian's affiliate program
    const brianAffiliate = await prisma.affiliateProgram.findUnique({
      where: { affiliateCode: ivan.referredByCode }
    })

    if (!brianAffiliate) {
      console.log('❌ Brian\'s affiliate program not found')
      return
    }

    console.log(`✅ Found Brian's Affiliate: ${brianAffiliate.affiliateCode}`)
    console.log(`   Current earnings: $${brianAffiliate.pendingEarnings}\n`)

    // Get all academy registrations without userId
    const registrations = await prisma.academyClassRegistration.findMany({
      where: {
        userId: null,
        email: { in: ['signal@corefx.com', 'brayamooti@gmail.com'] }
      },
      include: {
        academyClass: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    })

    console.log(`📚 Found ${registrations.length} registrations to fix:\n`)

    let totalCommission = 0

    for (const reg of registrations) {
      console.log(`   - ${reg.academyClass.title}: $${reg.academyClass.price}`)
      
      // Update registration with userId
      await prisma.academyClassRegistration.update({
        where: { id: reg.id },
        data: { userId: ivan.id }
      })

      // Check if commission already exists
      const existingCommission = await prisma.affiliateCommission.findFirst({
        where: {
          affiliateProgramId: brianAffiliate.id,
          referredUserId: ivan.id,
          relatedEntityId: reg.id,
          type: 'ACADEMY'
        }
      })

      if (existingCommission) {
        console.log(`     ⚠️  Commission already exists`)
        continue
      }

      // Calculate commission
      const commissionAmount = reg.academyClass.price * (brianAffiliate.commissionRate / 100)
      totalCommission += commissionAmount

      // Create commission
      await prisma.affiliateCommission.create({
        data: {
          affiliateProgramId: brianAffiliate.id,
          referredUserId: ivan.id,
          amount: commissionAmount,
          type: 'ACADEMY',
          description: `Academy registration commission for ${reg.academyClass.title}`,
          status: 'APPROVED',
          relatedEntityType: 'ACADEMY_REGISTRATION',
          relatedEntityId: reg.id
        }
      })

      console.log(`     ✅ Commission created: $${commissionAmount.toFixed(2)}`)
    }

    // Update affiliate earnings
    if (totalCommission > 0) {
      await prisma.affiliateProgram.update({
        where: { id: brianAffiliate.id },
        data: {
          pendingEarnings: {
            increment: totalCommission
          },
          totalEarnings: {
            increment: totalCommission
          }
        }
      })

      console.log(`\n✅ Updated Brian's earnings:`)
      console.log(`   Total commission: $${totalCommission.toFixed(2)}`)
      console.log(`   New pending: $${(brianAffiliate.pendingEarnings + totalCommission).toFixed(2)}`)
    }

    // Update referral status
    await prisma.affiliateReferral.updateMany({
      where: {
        referredUserId: ivan.id,
        status: 'PENDING'
      },
      data: {
        status: 'CONVERTED',
        conversionDate: new Date()
      }
    })

    console.log(`\n✅ All done! Registrations fixed and commissions created.`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixExistingRegistrations()
