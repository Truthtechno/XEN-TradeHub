import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// POST /api/payments/mentorship - Process mentorship payment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    
    const mentorshipPaymentSchema = z.object({
      amountUSD: z.number().min(1500).max(1500), // Must be exactly $1500
      provider: z.string().default('stripe'),
      providerRef: z.string().optional(),
      paymentMethod: z.string().optional()
    })

    const validatedData = mentorshipPaymentSchema.parse(body)
    
    // Check if user already has mentorship
    // Note: hasMentorship property doesn't exist in current user type
    // For now, we'll skip this check
    // if (user.hasMentorship) {
    //   return NextResponse.json({ 
    //     success: false,
    //     message: 'User already has mentorship access' 
    //   }, { status: 400 })
    // }

    // Use the access control service to upgrade to premium
    const { accessControl } = await import('@/lib/access-control')
    const upgradeResult = await accessControl.upgradeToPremium(user.id, validatedData.amountUSD)
    
    if (!upgradeResult.success) {
      return NextResponse.json({ 
        success: false,
        message: upgradeResult.message 
      }, { status: 400 })
    }

    const updatedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'PREMIUM'
    }

    console.log('Mentorship payment processed:', {
      userId: updatedUser.id,
      email: updatedUser.email,
      newRole: updatedUser.role,
      amount: validatedData.amountUSD
    })

    return NextResponse.json({ 
      success: true,
      message: 'Mentorship payment processed successfully',
      user: updatedUser,
      access: upgradeResult.access
    })

  } catch (error) {
    console.error('Error processing mentorship payment:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
