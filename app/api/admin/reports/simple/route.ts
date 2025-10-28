import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user || !['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || 'all'
    
    console.log('📅 Date Range Received:', dateRange)
    
    // Calculate start date based on range
    const now = new Date()
    let startDate = new Date(0) // Default to all time
    
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDate = new Date(0)
    }

    console.log('📅 Start Date Calculated:', startDate.toISOString())

    // Get real data from database with date filtering
    // Note: In XEN TradeHub, the only revenue-generating source is Academy class registrations
    const [
      totalUsers,
      newUsers,
      copyTradingSubs,
      activeCopiers,
      academyClasses,
      academyRegistrations,
      academyRevenue,
      affiliatePrograms,
      affiliatePaidCommissions,
      affiliateTotalCommissions,
      brokerAccounts
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.copyTradingSubscription.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.copyTradingSubscription.count({
        where: { 
          status: 'ACTIVE',
          createdAt: { gte: startDate }
        }
      }),
      prisma.academyClass.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.academyClassRegistration.count({
        where: { 
          status: 'CONFIRMED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.academyClassRegistration.aggregate({
        where: {
          status: 'CONFIRMED',
          createdAt: { gte: startDate }
        },
        _sum: { amountUSD: true }
      }).then(r => r._sum.amountUSD || 0),
      prisma.affiliateProgram.count({
        where: { 
          isActive: true,
          createdAt: { gte: startDate }
        }
      }),
      prisma.affiliateCommission.aggregate({
        where: { 
          status: 'PAID',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }).then(r => r._sum.amount || 0),
      prisma.affiliateCommission.aggregate({
        where: { 
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }).then(r => r._sum.amount || 0),
      prisma.brokerAccountOpening.count({
        where: { createdAt: { gte: startDate } }
      })
    ])

    // In XEN TradeHub, revenue comes only from Academy class registrations
    // Copy trading subscriptions are user investments, not company revenue
    // Broker account openings don't generate revenue
    // Affiliate commissions are payouts to affiliates, not revenue
    const totalRevenueAmount = academyRevenue

    const reportData = {
      users: {
        total: totalUsers,
        new: newUsers,
        active: activeCopiers,
        churn: 0
      },
      revenue: {
        total: totalRevenueAmount,
        monthly: totalRevenueAmount,
        growth: 0
      },
      copyTrading: {
        totalTrades: copyTradingSubs,
        activeCopiers: activeCopiers,
        successRate: 75
      },
      academy: {
        totalCourses: academyClasses,
        enrollments: academyRegistrations,
        revenue: academyRevenue
      },
      affiliates: {
        totalAffiliates: affiliatePrograms,
        commissions: affiliatePaidCommissions,
        revenue: affiliateTotalCommissions
      },
      broker: {
        registrations: brokerAccounts
      },
      enquiries: {
        total: 0,
        resolved: 0,
        pending: 0
      }
    }

    return NextResponse.json({
      success: true,
      data: reportData
    })

  } catch (error) {
    console.error('Simple reports error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
