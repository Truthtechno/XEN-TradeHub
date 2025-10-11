import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * API endpoint to manually trigger subscription expiry checks
 * This can be called by a cron job or scheduled task
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== PROCESSING SUBSCRIPTION EXPIRIES ===')
    
    const now = new Date()
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: {
          lt: now // Less than current time = expired
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions`)

    let processed = 0
    let errors = 0

    for (const subscription of expiredSubscriptions) {
      try {
        // Update subscription status to EXPIRED
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { 
            status: 'EXPIRED',
            updatedAt: now
          }
        })

        // Update user role back to STUDENT
        await prisma.user.update({
          where: { id: subscription.userId },
          data: { 
            role: 'STUDENT',
            updatedAt: now
          }
        })

        console.log(`Expired subscription ${subscription.id} for user ${subscription.user.email}`)
        processed++

      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processed} expired subscriptions, ${errors} errors`,
      processed,
      errors,
      total: expiredSubscriptions.length
    })

  } catch (error) {
    console.error('Error processing subscription expiries:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription expiries' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check subscription expiry status
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    
    // Get all active subscriptions that are about to expire (within 7 days)
    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: {
          gte: now, // Greater than or equal to now
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Within 7 days
        }
      },
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

    // Get all expired subscriptions
    const expired = await prisma.subscription.findMany({
      where: {
        status: 'EXPIRED',
        currentPeriodEnd: {
          lt: now
        }
      },
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

    return NextResponse.json({
      success: true,
      expiringSoon: expiringSoon.length,
      expired: expired.length,
      expiringSoonSubscriptions: expiringSoon.map(sub => ({
        id: sub.id,
        userId: sub.userId,
        userEmail: sub.user.email,
        currentPeriodEnd: sub.currentPeriodEnd,
        daysUntilExpiry: sub.currentPeriodEnd ? Math.ceil((new Date(sub.currentPeriodEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
      })),
      expiredSubscriptions: expired.map(sub => ({
        id: sub.id,
        userId: sub.userId,
        userEmail: sub.user.email,
        currentPeriodEnd: sub.currentPeriodEnd,
        daysSinceExpiry: sub.currentPeriodEnd ? Math.ceil((now.getTime() - new Date(sub.currentPeriodEnd).getTime()) / (1000 * 60 * 60 * 24)) : 0
      }))
    })

  } catch (error) {
    console.error('Error checking subscription expiry status:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription expiry status' },
      { status: 500 }
    )
  }
}
