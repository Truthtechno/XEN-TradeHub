import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || 'all'
    const chartType = searchParams.get('type') || 'revenue'
    
    // Calculate date filters
    const now = new Date()
    let startDate: Date
    let monthsBack = 12
    
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        monthsBack = 1
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        monthsBack = 3
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        monthsBack = 6
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        monthsBack = 12
        break
      case 'all':
      default:
        startDate = new Date(0) // All time
        monthsBack = 12
    }

    // Generate month labels - Jan to current month of current year
    const monthLabels: string[] = []
    const currentMonth = now.getMonth() // 0-11 (0=Jan, 9=Oct)
    for (let i = 0; i <= currentMonth; i++) {
      const date = new Date(now.getFullYear(), i, 1)
      monthLabels.push(date.toLocaleDateString('en-US', { month: 'short' }))
    }
    monthsBack = currentMonth + 1 // Update monthsBack to match actual months

    if (chartType === 'revenue') {
      // Revenue trend data
      const revenueData: Array<{
        name: string;
        value: number;
        orders: number;
        mentorship: number;
        resources: number;
        events: number;
        academy: number;
      }> = []
      
      for (let i = 0; i < monthsBack; i++) {
        const monthStart = new Date(now.getFullYear(), i, 1)
        const monthEnd = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59)
        
        const [orders, mentorship, resources, events, academy] = await Promise.all([
          prisma.order.aggregate({
            where: {
              status: 'COMPLETED',
              createdAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amount: true }
          }),
          prisma.mentorshipPayment.aggregate({
            where: {
              status: 'completed',
              createdAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amount: true }
          }),
          prisma.resourcePurchase.aggregate({
            where: {
              status: 'completed',
              createdAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amountUSD: true }
          }),
          prisma.eventRegistration.aggregate({
            where: {
              status: 'CONFIRMED',
              createdAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amountUSD: true }
          }),
          prisma.academyClassRegistration.aggregate({
            where: {
              status: 'CONFIRMED',
              createdAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amountUSD: true }
          })
        ])
        
        const totalRevenue = (orders._sum.amount || 0) + 
                           (mentorship._sum.amount || 0) + 
                           (resources._sum.amountUSD || 0) + 
                           (events._sum.amountUSD || 0) + 
                           (academy._sum.amountUSD || 0)
        
        revenueData.push({
          name: monthLabels[i],
          value: totalRevenue,
          orders: orders._sum.amount || 0,
          mentorship: mentorship._sum.amount || 0,
          resources: resources._sum.amountUSD || 0,
          events: events._sum.amountUSD || 0,
          academy: academy._sum.amountUSD || 0
        })
      }
      
      return NextResponse.json({
        success: true,
        data: revenueData,
        type: 'revenue'
      })
    }
    
    if (chartType === 'users') {
      // User growth data
      const userData: Array<{
        name: string;
        value: number;
        newUsers: number;
        activeUsers: number;
        premiumUsers: number;
      }> = []
      
      for (let i = 0; i < monthsBack; i++) {
        const monthStart = new Date(now.getFullYear(), i, 1)
        const monthEnd = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59)
        
        const newUsers = await prisma.user.count({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd }
          }
        })
        
        userData.push({
          name: monthLabels[i],
          value: newUsers,
          newUsers: newUsers,
          activeUsers: 0, // TODO: Calculate active users
          premiumUsers: 0 // TODO: Calculate premium users
        })
      }
      
      return NextResponse.json({
        success: true,
        data: userData,
        type: 'users'
      })
    }
    
    if (chartType === 'copyTrading') {
      // Copy Trading performance data
      const copyTradingData: Array<{
        name: string;
        value: number;
        trades: number;
        copiers: number;
      }> = []
      
      for (let i = 0; i < monthsBack; i++) {
        const monthStart = new Date(now.getFullYear(), i, 1)
        const monthEnd = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59)
        
        const [trades, copiers] = await Promise.all([
          prisma.copyTradingSubscription.count({
            where: {
              createdAt: { gte: monthStart, lte: monthEnd }
            }
          }).catch(() => 0),
          prisma.copyTradingSubscription.groupBy({
            by: ['userId'],
            where: {
              createdAt: { gte: monthStart, lte: monthEnd },
              status: 'ACTIVE'
            }
          }).then(result => result.length).catch(() => 0)
        ])
        
        copyTradingData.push({
          name: monthLabels[i],
          value: trades,
          trades: trades,
          copiers: copiers
        })
      }
      
      return NextResponse.json({
        success: true,
        data: copyTradingData,
        type: 'copyTrading'
      })
    }
    
    if (chartType === 'academy') {
      // Academy enrollment data
      const academyData: Array<{
        name: string;
        value: number;
        enrollments: number;
        revenue: number;
      }> = []
      
      for (let i = 0; i < monthsBack; i++) {
        const monthStart = new Date(now.getFullYear(), i, 1)
        const monthEnd = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59)
        
        const [enrollments, revenue] = await Promise.all([
          prisma.courseEnrollment.count({
            where: {
              enrolledAt: { gte: monthStart, lte: monthEnd }
            }
          }).catch(() => 0),
          prisma.academyClassRegistration.aggregate({
            where: {
              status: 'CONFIRMED',
              createdAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amountUSD: true }
          }).then(result => result._sum.amountUSD || 0).catch(() => 0)
        ])
        
        academyData.push({
          name: monthLabels[i],
          value: enrollments,
          enrollments: enrollments,
          revenue: revenue
        })
      }
      
      return NextResponse.json({
        success: true,
        data: academyData,
        type: 'academy'
      })
    }
    
    if (chartType === 'affiliates') {
      // Affiliates data
      const affiliatesData: Array<{
        name: string;
        value: number;
        affiliates: number;
        commissions: number;
      }> = []
      
      for (let i = 0; i < monthsBack; i++) {
        const monthStart = new Date(now.getFullYear(), i, 1)
        const monthEnd = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59)
        
        const [affiliates, commissions] = await Promise.all([
          prisma.affiliateProgram.count({
            where: {
              createdAt: { gte: monthStart, lte: monthEnd },
              isActive: true
            }
          }).catch(() => 0),
          prisma.affiliateCommission.aggregate({
            where: {
              status: 'PAID',
              createdAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amount: true }
          }).then(result => result._sum.amount || 0).catch(() => 0)
        ])
        
        affiliatesData.push({
          name: monthLabels[i],
          value: affiliates,
          affiliates: affiliates,
          commissions: commissions
        })
      }
      
      return NextResponse.json({
        success: true,
        data: affiliatesData,
        type: 'affiliates'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid chart type'
    }, { status: 400 })

  } catch (error) {
    console.error('Reports charts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
