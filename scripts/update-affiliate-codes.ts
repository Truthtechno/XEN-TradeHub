import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate new affiliate code - Professional format: XEN-XXXX-NNNN
function generateAffiliateCode(name: string, userId: string): string {
  // Get first 2 letters of first name and last name
  const names = name.trim().split(' ')
  const firstName = names[0] || ''
  const lastName = names[names.length - 1] || ''
  
  const firstPart = firstName.substring(0, 2).toUpperCase()
  const lastPart = lastName.substring(0, 2).toUpperCase()
  
  // Generate random 4-digit number
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  
  // Format: XEN-FLXX-NNNN (e.g., XEN-BRMO-4523)
  return `XEN-${firstPart}${lastPart}-${randomNum}`
}

async function updateAffiliateCodes() {
  try {
    console.log('🔄 Starting affiliate code update...')
    
    // Get all affiliate programs
    const affiliates = await prisma.affiliateProgram.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`📊 Found ${affiliates.length} affiliate programs`)

    for (const affiliate of affiliates) {
      // Check if code is already in new format
      if (affiliate.affiliateCode.startsWith('XEN-')) {
        console.log(`✅ ${affiliate.user.email} - Already has new format: ${affiliate.affiliateCode}`)
        continue
      }

      // Generate new code
      const newCode = generateAffiliateCode(
        affiliate.user.name || affiliate.user.email,
        affiliate.user.id
      )

      // Check if new code already exists
      let finalCode = newCode
      let attempts = 0
      while (attempts < 10) {
        const existing = await prisma.affiliateProgram.findUnique({
          where: { affiliateCode: finalCode }
        })

        if (!existing) break

        // Generate new code with different random number
        finalCode = generateAffiliateCode(
          affiliate.user.name || affiliate.user.email,
          affiliate.user.id + attempts
        )
        attempts++
      }

      // Update the affiliate code
      await prisma.affiliateProgram.update({
        where: { id: affiliate.id },
        data: { affiliateCode: finalCode }
      })

      console.log(`🔄 ${affiliate.user.email}:`)
      console.log(`   Old: ${affiliate.affiliateCode}`)
      console.log(`   New: ${finalCode}`)
    }

    console.log('✅ Affiliate code update complete!')
  } catch (error) {
    console.error('❌ Error updating affiliate codes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAffiliateCodes()
