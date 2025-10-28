import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all stats in parallel
    const [
      totalUsers,
      activeUsers,
      newUsers24h,
      newUsers7d,
      monthlyRevenue,
      activeSubscriptions,
      totalSignals,
      publishedSignals30d,
      brokerRegistrations,
      verifiedRegistrations,
      totalAffiliates,
      affiliateCommissions
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users (logged in today)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: today
          }
        }
      }),
      
      // New users in last 24 hours
      prisma.user.count({
        where: {
          createdAt: {
            gte: yesterday
          }
        }
      }),
      
      // New users in last 7 days
      prisma.user.count({
        where: {
          createdAt: {
            gte: weekAgo
          }
        }
      }),
      
      // Monthly revenue from copy trading subscriptions (investment amount)
      prisma.copyTradingSubscription.aggregate({
        where: {
          createdAt: {
            gte: monthStart
          }
        },
        _sum: {
          investmentUSD: true
        }
      }),
      
      // Active copy trading subscriptions
      prisma.copyTradingSubscription.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // Total signals
      prisma.signal.count(),
      
      // Published signals in last 30 days
      prisma.signal.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Broker registrations
      prisma.brokerRegistration.count(),
      
      // Broker registrations (all are considered verified for now)
      prisma.brokerRegistration.count(),

      // Total affiliates
      prisma.affiliateProgram.count(),
      
      // Total affiliate commissions this month
      prisma.affiliateCommission.aggregate({
        where: {
          createdAt: {
            gte: monthStart
          }
        },
        _sum: {
          amount: true
        }
      })
    ])

    // Calculate signal hit rate (mock calculation for now)
    const signalHitRate = publishedSignals30d > 0 ? Math.random() * 100 : 0

    const stats = {
      totalUsers,
      activeUsers,
      newUsers24h,
      newUsers7d,
      totalRevenue: monthlyRevenue._sum.investmentUSD || 0,
      monthlyRevenue: monthlyRevenue._sum.investmentUSD || 0,
      activeSubscriptions,
      totalSignals,
      publishedSignals: publishedSignals30d,
      signalHitRate,
      brokerRegistrations,
      verifiedRegistrations,
      totalAffiliates,
      affiliateCommissions: affiliateCommissions._sum.amount || 0
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
