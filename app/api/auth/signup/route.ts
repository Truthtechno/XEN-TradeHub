import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { notifyUserSignup, notifyAffiliateReferral } from '@/lib/admin-notification-utils'
import { notifyAffiliateReferralSignup } from '@/lib/user-notification-utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, referralCode } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        referredByCode: validReferralCode,
        role: 'STUDENT'
      }
    })

    // If user was referred, create referral record
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
          name,
          email,
          `/admin/affiliates`
        )

        // Notify affiliate about new referral signup
        await notifyAffiliateReferralSignup(
          affiliateProgram.userId,
          name,
          email
        )
      }
    }

    // Notify admins about new user signup
    await notifyUserSignup(
      name,
      email,
      validReferralCode || undefined,
      `/admin/users`
    )

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
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
