import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { referralCode, userId } = await request.json()

    if (!referralCode || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find the affiliate program by code
    const affiliateProgram = await prisma.affiliateProgram.findUnique({
      where: { affiliateCode: referralCode }
    })

    if (!affiliateProgram) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Check if referral already exists
    const existingReferral = await prisma.affiliateReferral.findFirst({
      where: {
        affiliateProgramId: affiliateProgram.id,
        referredUserId: userId
      }
    })

    if (existingReferral) {
      return NextResponse.json({ success: true, referral: existingReferral })
    }

    // Create referral record
    const referral = await prisma.affiliateReferral.create({
      data: {
        affiliateProgramId: affiliateProgram.id,
        referredUserId: userId,
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

    return NextResponse.json({ success: true, referral })
  } catch (error) {
    console.error('Error tracking referral:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
