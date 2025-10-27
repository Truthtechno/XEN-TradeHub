import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { notifyUserSignup, notifyAffiliateReferral } from '@/lib/admin-notification-utils'
import { notifyAffiliateReferralSignup } from '@/lib/user-notification-utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, whatsappNumber, password, countryCode, country, referralCode } = await request.json()

    if (!firstName || !lastName || !email || !whatsappNumber || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Validate referral code if provided
    let validReferralCode = null
    if (referralCode) {
      const affiliateProgram = await prisma.affiliateProgram.findUnique({
        where: { affiliateCode: referralCode }
      })

      if (affiliateProgram && affiliateProgram.isActive) {
        validReferralCode = referralCode
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: 'STUDENT', // Default role for new users
        referredByCode: validReferralCode, // Track referral
        profile: {
          create: {
            firstName,
            lastName,
            whatsappNumber: whatsappNumber, // Already includes country code
            country: country || 'Ghana', // Use provided country or default
            isActive: true
          }
        }
      },
      include: {
        profile: true,
        subscription: true,
        brokerAccount: true
      }
    })

    // If user was referred, create referral record and update affiliate stats
    if (validReferralCode) {
      const affiliateProgram = await prisma.affiliateProgram.findUnique({
        where: { affiliateCode: validReferralCode },
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

      if (affiliateProgram) {
        // Create referral record
        await prisma.affiliateReferral.create({
          data: {
            affiliateProgramId: affiliateProgram.id,
            referredUserId: user.id,
            status: 'PENDING'
          }
        })

        // Update total referrals count
        await prisma.affiliateProgram.update({
          where: { id: affiliateProgram.id },
          data: {
            totalReferrals: {
              increment: 1
            }
          }
        })

        // Auto-upgrade tier based on referral count
        await updateAffiliateTier(affiliateProgram.id)

        // Notify admins about affiliate referral
        await notifyAffiliateReferral(
          affiliateProgram.user.name || affiliateProgram.user.email,
          affiliateProgram.user.email,
          user.name || email,
          email,
          `/admin/affiliates`
        )

        // Notify affiliate about new referral signup
        await notifyAffiliateReferralSignup(
          affiliateProgram.userId,
          user.name || email,
          email
        )
      }
    }

    // Notify admins about new user signup
    await notifyUserSignup(
      user.name || email,
      email,
      validReferralCode || undefined,
      `/admin/users`
    )

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      'your-secret-key',
      { expiresIn: '7d' }
    )

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
        subscription: user.subscription,
        brokerAccount: user.brokerAccount
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateAffiliateTier(affiliateProgramId: string) {
  const affiliate = await prisma.affiliateProgram.findUnique({
    where: { id: affiliateProgramId }
  })

  if (!affiliate) return

  let newTier = affiliate.tier
  let newRate = affiliate.commissionRate

  if (affiliate.totalReferrals >= 51) {
    newTier = 'PLATINUM'
    newRate = 20
  } else if (affiliate.totalReferrals >= 26) {
    newTier = 'GOLD'
    newRate = 15
  } else if (affiliate.totalReferrals >= 11) {
    newTier = 'SILVER'
    newRate = 12
  } else {
    newTier = 'BRONZE'
    newRate = 10
  }

  if (newTier !== affiliate.tier) {
    await prisma.affiliateProgram.update({
      where: { id: affiliateProgramId },
      data: {
        tier: newTier,
        commissionRate: newRate
      }
    })
  }
}
