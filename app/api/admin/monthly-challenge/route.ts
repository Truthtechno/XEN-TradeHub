import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get month from query params or use current month
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || (() => {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })()

    // Get all challenge progress for the specified month
    const challenges = await prisma.monthlyChallenge.findMany({
      where: { month },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        referralCount: 'desc'
      }
    })

    // Get qualified referral details for each challenge
    const participantsWithDetails = await Promise.all(
      challenges.map(async (challenge) => {
        const qualifiedReferralDetails = await prisma.user.findMany({
          where: {
            id: {
              in: challenge.qualifiedReferrals
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            copyTradingSubscriptions: {
              select: {
                startDate: true
              },
              orderBy: {
                startDate: 'asc'
              },
              take: 1
            }
          }
        })

        return {
          id: challenge.id,
          userId: challenge.userId,
          userName: challenge.user.name || 'User',
          userEmail: challenge.user.email,
          month: challenge.month,
          referralCount: challenge.referralCount,
          qualifiedReferrals: qualifiedReferralDetails.map(ref => ({
            id: ref.id,
            name: ref.name || 'User',
            email: ref.email,
            joinedAt: ref.copyTradingSubscriptions[0]?.startDate || new Date().toISOString()
          })),
          rewardClaimed: challenge.rewardClaimed,
          rewardAmount: challenge.rewardAmount,
          claimedAt: challenge.claimedAt,
          createdAt: challenge.createdAt
        }
      })
    )

    // Calculate stats
    const stats = {
      totalParticipants: challenges.length,
      completedChallenges: challenges.filter(c => c.referralCount >= 3).length,
      pendingRewards: challenges.filter(c => c.referralCount >= 3 && !c.rewardClaimed).length,
      totalRewardsPaid: challenges
        .filter(c => c.rewardClaimed)
        .reduce((sum, c) => sum + c.rewardAmount, 0)
    }

    return NextResponse.json({
      participants: participantsWithDetails,
      stats
    })
  } catch (error) {
    console.error('Error fetching admin challenge data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
