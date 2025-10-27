import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current month
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Get challenge progress
    const progress = await prisma.monthlyChallenge.findUnique({
      where: {
        userId_month: {
          userId: user.id,
          month: currentMonth
        }
      }
    })

    if (!progress) {
      return NextResponse.json({ error: 'No challenge progress found' }, { status: 404 })
    }

    if (progress.rewardClaimed) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
    }

    if (progress.referralCount < 3) {
      return NextResponse.json({ 
        error: `You need ${3 - progress.referralCount} more qualified referral(s)` 
      }, { status: 400 })
    }

    // Check if user has an affiliate program
    const affiliateProgram = await prisma.affiliateProgram.findUnique({
      where: { userId: user.id }
    })

    if (!affiliateProgram) {
      return NextResponse.json({ 
        error: 'You must have an affiliate account to claim rewards. Please register at /affiliates first.' 
      }, { status: 400 })
    }

    // Use a transaction to ensure both updates happen together
    const result = await prisma.$transaction(async (tx) => {
      // Update progress to mark reward as claimed
      const updatedProgress = await tx.monthlyChallenge.update({
        where: { id: progress.id },
        data: {
          rewardClaimed: true,
          claimedAt: new Date()
        }
      })

      // Create affiliate payout request
      const payout = await tx.affiliatePayout.create({
        data: {
          affiliateProgramId: affiliateProgram.id,
          amount: progress.rewardAmount,
          method: affiliateProgram.paymentMethod || 'PENDING',
          status: 'PENDING',
          notes: `Monthly Challenge Reward - ${currentMonth} (3 qualified referrals)`
        }
      })

      // Update affiliate program earnings
      await tx.affiliateProgram.update({
        where: { id: affiliateProgram.id },
        data: {
          pendingEarnings: {
            increment: progress.rewardAmount
          },
          totalEarnings: {
            increment: progress.rewardAmount
          }
        }
      })

      return { updatedProgress, payout }
    })

    return NextResponse.json({ 
      success: true, 
      progress: result.updatedProgress,
      payout: result.payout,
      message: 'Congratulations! Your $1,000 reward has been added to your pending payouts. Check the Affiliates page to track your payout.'
    })
  } catch (error) {
    console.error('Error claiming reward:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
