import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Generate unique affiliate code
function generateAffiliateCode(name: string, userId: string): string {
  const namePrefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()
  const randomSuffix = userId.substring(0, 6).toUpperCase()
  return `${namePrefix}${randomSuffix}`
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Direct registration endpoint called')
    
    // Get authenticated user
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('❌ No authenticated user')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.email)

    const body = await request.json()
    const { fullName, phone, paymentMethod, payoutDetails } = body

    console.log('📝 Registration data received:', { fullName, phone, paymentMethod })

    // Check if already registered
    const existingAffiliate = await prisma.affiliateProgram.findUnique({
      where: { userId: user.id }
    })

    if (existingAffiliate) {
      console.log('⚠️ User already registered as affiliate')
      return NextResponse.json({ 
        error: 'Already registered as affiliate',
        affiliate: existingAffiliate 
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

    console.log('🎫 Generated affiliate code:', affiliateCode)

    // Create affiliate program
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

    console.log('✅ Affiliate created successfully:', affiliate.id)

    return NextResponse.json({ success: true, affiliate })
  } catch (error) {
    console.error('❌ Error registering affiliate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
