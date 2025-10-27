import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { notifyAffiliateRegistration } from '@/lib/admin-notification-utils'

// Generate unique affiliate code - Professional format: XEN-XXXX-XXXX
function generateAffiliateCode(name: string, userId: string): string {
  // Get first 2 letters of first name and last name
  const names = name.trim().split(' ')
  const firstName = names[0] || ''
  const lastName = names[names.length - 1] || ''
  
  const firstPart = firstName.substring(0, 2).toUpperCase()
  const lastPart = lastName.substring(0, 2).toUpperCase()
  
  // Generate random 4-digit number
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  
  // Use first 4 chars of userId for uniqueness
  const userPart = userId.substring(0, 4).toUpperCase()
  
  // Format: XEN-FLXX-NNNN (e.g., XEN-BRMO-4523)
  return `XEN-${firstPart}${lastPart}-${randomNum}`
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Affiliate registration API called')
    
    // Use the same auth pattern as other working endpoints
    const authUser = await getAuthenticatedUserSimple(request)
    
    if (!authUser) {
      console.log('❌ No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Authenticated user:', authUser.email)

    const body = await request.json()
    const { fullName, phone, paymentMethod, payoutDetails } = body

    console.log('📝 Registration data:', { fullName, phone, paymentMethod })

    // Get user with affiliate program
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        affiliateProgram: true
      }
    })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User found:', user.id)

    // Check if already registered
    if (user.affiliateProgram) {
      return NextResponse.json({ 
        error: 'Already registered as affiliate',
        affiliate: user.affiliateProgram 
      }, { status: 400 })
    }

    // Generate unique affiliate code
    let affiliateCode = generateAffiliateCode(user.name || user.email, user.id)
    
    // Ensure uniqueness
    let codeExists = await prisma.affiliateProgram.findUnique({
      where: { affiliateCode }
    })
    
    let attempts = 0
    while (codeExists && attempts < 10) {
      affiliateCode = generateAffiliateCode(user.name || user.email, user.id + attempts)
      codeExists = await prisma.affiliateProgram.findUnique({
        where: { affiliateCode }
      })
      attempts++
    }

    // Create affiliate program
    console.log('💾 Creating affiliate program...')
    const affiliate = await prisma.affiliateProgram.create({
      data: {
        userId: user.id,
        affiliateCode,
        fullName: fullName || user.name,
        phone,
        paymentMethod,
        payoutDetails: payoutDetails || {},
        tier: 'BRONZE',
        commissionRate: 10,
        isActive: true
      }
    })

    console.log('✅ Affiliate created successfully!', {
      id: affiliate.id,
      code: affiliate.affiliateCode,
      tier: affiliate.tier
    })

    // Notify admins about new affiliate registration
    await notifyAffiliateRegistration(
      user.name || user.email,
      user.email,
      affiliate.affiliateCode,
      `/admin/affiliates`
    )

    return NextResponse.json({ success: true, affiliate })
  } catch (error) {
    console.error('❌ Error registering affiliate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
