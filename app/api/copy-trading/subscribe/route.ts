import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { notifyCopyTradingSubscription } from '@/lib/admin-notification-utils'
import { createCopyTradingCommission } from '@/lib/affiliate-commission-utils'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUserSimple(request)
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platformId, investmentUSD, copyRatio, stopLossPercent, brokerAccountId } = body

    if (!platformId || !investmentUSD || investmentUSD <= 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: authUser.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify platform exists and get min investment
    const platform = await prisma.copyTradingPlatform.findUnique({
      where: { id: platformId }
    })

    if (!platform) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 })
    }

    if (investmentUSD < platform.minInvestment) {
      return NextResponse.json({ 
        error: `Minimum investment is $${platform.minInvestment}` 
      }, { status: 400 })
    }

    // Create subscription with PENDING status (admin must verify and activate)
    const subscription = await prisma.copyTradingSubscription.create({
      data: {
        userId: user.id,
        platformId,
        investmentUSD,
        copyRatio: copyRatio || 1.0,
        stopLossPercent: stopLossPercent || 10,
        brokerAccountId: brokerAccountId || null,
        status: 'PENDING' // Admin must verify deposit and change to ACTIVE
      }
    })

    // Notify admins about new copy trading subscription
    await notifyCopyTradingSubscription(
      user.name || user.email,
      user.email,
      platform.name,
      `/admin/copy-trading`
    )

    // Note: Commission will be created when admin changes status to ACTIVE
    // This ensures deposit is verified before commission is awarded

    // Track monthly challenge progress if user was referred
    if (user.referredByCode) {
      try {
        // Find the affiliate who referred this user
        const affiliate = await prisma.affiliateProgram.findUnique({
          where: { affiliateCode: user.referredByCode }
        })

        if (affiliate) {
          const now = new Date()
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

          // Get or create challenge progress for the referrer
          const progress = await prisma.monthlyChallenge.upsert({
            where: {
              userId_month: {
                userId: affiliate.userId,
                month: currentMonth
              }
            },
            create: {
              userId: affiliate.userId,
              month: currentMonth,
              referralCount: 1,
              qualifiedReferrals: [user.id],
              rewardClaimed: false,
              rewardAmount: 1000
            },
            update: {
              referralCount: {
                increment: 1
              },
              qualifiedReferrals: {
                push: user.id
              }
            }
          })

          console.log('Monthly challenge progress updated:', progress)

          // Auto-claim reward if 3 referrals reached and not yet claimed
          if (progress.referralCount >= 3 && !progress.rewardClaimed) {
            try {
              await prisma.$transaction(async (tx) => {
                // Mark challenge as claimed
                await tx.monthlyChallenge.update({
                  where: { id: progress.id },
                  data: {
                    rewardClaimed: true,
                    claimedAt: new Date()
                  }
                })

                // Create payout and update affiliate earnings
                await tx.affiliatePayout.create({
                  data: {
                    affiliateProgramId: affiliate.id,
                    amount: progress.rewardAmount,
                    method: affiliate.paymentMethod || 'PENDING',
                    status: 'PENDING',
                    notes: `Monthly Challenge Reward - ${currentMonth} (3 qualified referrals) - Auto-claimed`
                  }
                })

                // Update affiliate program earnings
                await tx.affiliateProgram.update({
                  where: { id: affiliate.id },
                  data: {
                    pendingEarnings: {
                      increment: progress.rewardAmount
                    },
                    totalEarnings: {
                      increment: progress.rewardAmount
                    }
                  }
                })
              })

              console.log(`🎉 Monthly challenge reward auto-claimed for affiliate ${affiliate.affiliateCode}!`)
            } catch (claimError) {
              console.error('Error auto-claiming monthly challenge reward:', claimError)
              // Don't fail the subscription if auto-claim fails
            }
          }
        }
      } catch (challengeError) {
        console.error('Error updating monthly challenge:', challengeError)
        // Don't fail the subscription if challenge tracking fails
      }
    }

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
