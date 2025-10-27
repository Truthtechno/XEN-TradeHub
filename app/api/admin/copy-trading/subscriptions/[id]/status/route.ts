import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUserSimple(request)
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id }
    })

    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['PENDING', 'ACTIVE', 'PAUSED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get subscription details
    const subscription = await prisma.copyTradingSubscription.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            referredByCode: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const oldStatus = subscription.status

    // Update subscription status
    const updatedSubscription = await prisma.copyTradingSubscription.update({
      where: { id: params.id },
      data: { status }
    })

    // If status changed from PENDING to ACTIVE, create and approve commission
    if (oldStatus === 'PENDING' && status === 'ACTIVE') {
      console.log(`✅ Subscription activated - Creating commission for user ${subscription.user.id}`)
      
      // Check if user was referred
      if (subscription.user.referredByCode) {
        // Find affiliate program
        const affiliateProgram = await prisma.affiliateProgram.findUnique({
          where: { affiliateCode: subscription.user.referredByCode }
        })

        if (affiliateProgram && affiliateProgram.isActive) {
          // Calculate commission
          const commissionAmount = subscription.investmentUSD * (affiliateProgram.commissionRate / 100)

          // Check if commission already exists
          const existingCommission = await prisma.affiliateCommission.findFirst({
            where: {
              affiliateProgramId: affiliateProgram.id,
              referredUserId: subscription.user.id,
              relatedEntityId: subscription.id,
              type: 'COPY_TRADING'
            }
          })

          if (existingCommission) {
            // Update existing commission to APPROVED
            await prisma.affiliateCommission.update({
              where: { id: existingCommission.id },
              data: {
                status: 'APPROVED',
                verifiedAt: new Date(),
                verifiedBy: user.id
              }
            })

            // Update affiliate earnings
            await prisma.affiliateProgram.update({
              where: { id: affiliateProgram.id },
              data: {
                totalEarnings: {
                  increment: commissionAmount
                },
                pendingEarnings: {
                  increment: commissionAmount
                }
              }
            })

            console.log(`✅ Existing commission approved: $${commissionAmount}`)
          } else {
            // Create new commission as APPROVED
            await prisma.affiliateCommission.create({
              data: {
                affiliateProgramId: affiliateProgram.id,
                referredUserId: subscription.user.id,
                amount: commissionAmount,
                type: 'COPY_TRADING',
                description: `Copy trading subscription commission - $${subscription.investmentUSD.toFixed(2)} investment`,
                status: 'APPROVED',
                requiresVerification: false,
                verifiedAt: new Date(),
                verifiedBy: user.id,
                relatedEntityType: 'COPY_TRADING_SUBSCRIPTION',
                relatedEntityId: subscription.id
              }
            })

            // Update affiliate earnings
            await prisma.affiliateProgram.update({
              where: { id: affiliateProgram.id },
              data: {
                totalEarnings: {
                  increment: commissionAmount
                },
                pendingEarnings: {
                  increment: commissionAmount
                }
              }
            })

            console.log(`✅ New commission created and approved: $${commissionAmount}`)
          }

          // Mark referral as converted
          await prisma.affiliateReferral.updateMany({
            where: {
              affiliateProgramId: affiliateProgram.id,
              referredUserId: subscription.user.id,
              status: 'PENDING'
            },
            data: {
              status: 'CONVERTED',
              conversionDate: new Date()
            }
          })
        }
      }
    }

    return NextResponse.json({ success: true, subscription: updatedSubscription })
  } catch (error) {
    console.error('Error updating subscription status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
