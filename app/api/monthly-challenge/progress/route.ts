import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current month in format "2025-10"
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    console.log(`[Monthly Challenge] Fetching progress for user ${user.id} for month ${currentMonth}`)

    // Get or create challenge progress for current month
    // Note: Each month automatically gets its own record due to @@unique([userId, month]) constraint
    let progress = await prisma.monthlyChallenge.findUnique({
      where: {
        userId_month: {
          userId: user.id,
          month: currentMonth
        }
      }
    })

    if (!progress) {
      // Create new progress record for this month (starts at 0/3)
      console.log(`[Monthly Challenge] Creating new progress for ${currentMonth} - starting fresh at 0/3`)
      progress = await prisma.monthlyChallenge.create({
        data: {
          userId: user.id,
          month: currentMonth,
          referralCount: 0,
          qualifiedReferrals: [],
          rewardClaimed: false,
          rewardAmount: 1000
        }
      })
    } else {
      console.log(`[Monthly Challenge] Found existing progress: ${progress.qualifiedReferrals.length}/3 qualified referrals`)
    }

    // Get details of qualified referrals
    const qualifiedReferralDetails = await prisma.user.findMany({
      where: {
        id: {
          in: progress.qualifiedReferrals
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

    const qualifiedReferralsWithDetails = qualifiedReferralDetails.map(ref => ({
      id: ref.id,
      name: ref.name || 'User',
      email: ref.email,
      joinedAt: ref.copyTradingSubscriptions[0]?.startDate || new Date().toISOString()
    }))

    return NextResponse.json({
      progress: {
        ...progress,
        qualifiedReferrals: qualifiedReferralsWithDetails
      }
    })
  } catch (error) {
    console.error('Error fetching challenge progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
