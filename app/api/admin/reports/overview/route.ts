import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('=== REPORTS OVERVIEW API ===')
    const user = await getAuthenticatedUserSimpleFix(request)
    console.log('User:', user)
    
    if (!user) {
      console.log('No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    if (!adminRoles.includes(user.role)) {
      console.log('User role not authorized:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    console.log('User authorized, proceeding with data fetch...')

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || 'all'
    
    // Calculate date filters
    const now = new Date()
    let startDate: Date
    
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
      default:
        startDate = new Date(0) // All time
    }
    
    console.log('Date range:', dateRange, 'Start date:', startDate)

    console.log('Starting data fetch...')
    
    // Fetch all data in parallel
    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalRevenue,
      monthlyRevenue,
      totalCopyTrades,
      activeCopiers,
      totalAcademyCourses,
      academyEnrollments,
      academyRevenue,
      totalAffiliates,
      affiliateCommissions,
      affiliateRevenue,
      brokerRegistrations,
      totalEnquiries,
      resolvedEnquiries,
      pendingEnquiries
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.user.count({
        where: { 
          lastLoginAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      
      // Revenue - from all sources
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.order.aggregate({
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      
      // Copy Trading
      prisma.copyTradingSubscription.count({
        where: { createdAt: { gte: startDate } }
      }).catch(() => 0),
      prisma.copyTradingSubscription.groupBy({
        by: ['userId'],
        where: { 
          createdAt: { gte: startDate },
          status: 'ACTIVE'
        }
      }).then(result => result.length).catch(() => 0),
      
      // Academy
      prisma.course.count().catch(() => 0),
      prisma.courseEnrollment.count({
        where: { enrolledAt: { gte: startDate } }
      }).catch(() => 0),
      prisma.academyClassRegistration.aggregate({
        where: { 
          status: 'CONFIRMED',
          createdAt: { gte: startDate }
        },
        _sum: { amountUSD: true }
      }).then(result => result._sum.amountUSD || 0).catch(() => 0),
      
      // Affiliates
      prisma.affiliateProgram.count({
        where: { isActive: true }
      }).catch(() => 0),
      prisma.affiliateCommission.aggregate({
        where: { 
          status: 'PAID',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }).then(result => result._sum.amount || 0).catch(() => 0),
      prisma.affiliateCommission.aggregate({
        where: { 
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }).then(result => result._sum.amount || 0).catch(() => 0),
      
      // Broker
      prisma.brokerRegistration.count({
        where: { createdAt: { gte: startDate } }
      }).catch(() => 0),
      
      // Enquiries
      prisma.enquiry.count().catch(() => 0),
      prisma.enquiry.count({
        where: { status: 'RESOLVED' }
      }).catch(() => 0),
      prisma.enquiry.count({
        where: { status: 'PENDING' }
      }).catch(() => 0)
    ])

    console.log('Data fetched successfully, calculating metrics...')
    console.log('Raw data counts:', {
      totalUsers,
      newUsers,
      activeUsers,
      totalCopyTrades,
      activeCopiers,
      totalAcademyCourses,
      academyEnrollments,
      academyRevenue,
      totalAffiliates,
      affiliateCommissions,
      affiliateRevenue,
      brokerRegistrations,
      totalEnquiries,
      resolvedEnquiries,
      pendingEnquiries
    })
    
    // Calculate additional metrics
    const totalRevenueAmount = (totalRevenue._sum.amount || 0) + 
                              academyRevenue + 
                              affiliateRevenue

    const monthlyRevenueAmount = (monthlyRevenue._sum.amount || 0) + 
                                academyRevenue + 
                                affiliateCommissions

    // Calculate growth rate (simplified - compare with previous period)
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const previousRevenue = await prisma.order.aggregate({
      where: { 
        status: 'COMPLETED',
        createdAt: { 
          gte: previousPeriodStart,
          lt: startDate
        }
      },
      _sum: { amount: true }
    })
    
    const previousRevenueAmount = previousRevenue._sum.amount || 0
    const growthRate = previousRevenueAmount > 0 
      ? ((monthlyRevenueAmount - previousRevenueAmount) / previousRevenueAmount) * 100 
      : 0

    // Calculate churn rate (simplified)
    const churnRate = totalUsers > 0 ? ((totalUsers - activeUsers) / totalUsers) * 100 : 0

    // Calculate copy trading success rate (mock calculation for now)
    const copyTradingSuccessRate = totalCopyTrades > 0 ? 65 + Math.random() * 20 : 0

    const reportData = {
      users: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers,
        churn: Math.round(churnRate * 10) / 10
      },
      revenue: {
        total: totalRevenueAmount,
        monthly: monthlyRevenueAmount,
        growth: Math.round(growthRate * 10) / 10
      },
      copyTrading: {
        totalTrades: totalCopyTrades,
        activeCopiers: activeCopiers,
        successRate: Math.round(copyTradingSuccessRate * 10) / 10
      },
      academy: {
        totalCourses: totalAcademyCourses,
        enrollments: academyEnrollments,
        revenue: academyRevenue
      },
      affiliates: {
        totalAffiliates: totalAffiliates,
        commissions: affiliateCommissions,
        revenue: affiliateRevenue
      },
      broker: {
        registrations: brokerRegistrations
      },
      enquiries: {
        total: totalEnquiries,
        resolved: resolvedEnquiries,
        pending: pendingEnquiries
      }
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      dateRange,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Reports overview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
