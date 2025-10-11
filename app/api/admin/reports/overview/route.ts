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
    const dateRange = searchParams.get('dateRange') || '30d'
    
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

    console.log('Starting data fetch...')
    
    // Fetch all data in parallel
    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalRevenue,
      monthlyRevenue,
      totalSignals,
      publishedSignals,
      signalSubscribers,
      totalCourses,
      courseEnrollments,
      courseRevenue,
      brokerRegistrations,
      mentorshipPayments,
      resourcePurchases,
      eventRegistrations,
      academyRegistrations,
      totalForecasts,
      forecastLikes,
      forecastComments
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
      
      // Signals
      prisma.signal.count(),
      prisma.signal.count({
        where: { 
          publishedAt: { gte: startDate },
          isActive: true
        }
      }),
      prisma.subscription.count({
        where: { 
          status: 'ACTIVE',
          plan: { in: ['SIGNALS', 'PREMIUM'] }
        }
      }),
      
      // Courses
      prisma.course.count(),
      prisma.courseEnrollment.count({
        where: { enrolledAt: { gte: startDate } }
      }),
      // Simplified course revenue calculation
      prisma.courseEnrollment.findMany({
        where: { 
          enrolledAt: { gte: startDate }
        },
        include: { course: true }
      }).then(enrollments => 
        enrollments.reduce((sum, enrollment) => sum + (enrollment.course.priceUSD || 0), 0)
      ),
      
      // Broker
      prisma.brokerRegistration.count({
        where: { createdAt: { gte: startDate } }
      }),
      
      // Mentorship
      prisma.mentorshipPayment.aggregate({
        where: { 
          status: 'completed',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      
      // Resources
      prisma.resourcePurchase.aggregate({
        where: { 
          status: 'completed',
          createdAt: { gte: startDate }
        },
        _sum: { amountUSD: true }
      }),
      
      // Events
      prisma.eventRegistration.aggregate({
        where: { 
          status: 'CONFIRMED',
          createdAt: { gte: startDate }
        },
        _sum: { amountUSD: true }
      }),
      
      // Academy
      prisma.academyClassRegistration.aggregate({
        where: { 
          status: 'CONFIRMED',
          createdAt: { gte: startDate }
        },
        _sum: { amountUSD: true }
      }),
      
      // Forecasts
      prisma.forecast.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.userForecastLike.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.userForecastComment.count({
        where: { createdAt: { gte: startDate } }
      })
    ])

    console.log('Data fetched successfully, calculating metrics...')
    
    // Calculate additional metrics
    const totalRevenueAmount = (totalRevenue._sum.amount || 0) + 
                              (mentorshipPayments._sum.amount || 0) + 
                              (resourcePurchases._sum.amountUSD || 0) + 
                              (eventRegistrations._sum.amountUSD || 0) + 
                              (academyRegistrations._sum.amountUSD || 0)

    const monthlyRevenueAmount = (monthlyRevenue._sum.amount || 0) + 
                                (mentorshipPayments._sum.amount || 0) + 
                                (resourcePurchases._sum.amountUSD || 0) + 
                                (eventRegistrations._sum.amountUSD || 0) + 
                                (academyRegistrations._sum.amountUSD || 0)

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

    // Calculate signal hit rate (mock calculation for now)
    const signalHitRate = publishedSignals > 0 ? Math.random() * 100 : 0

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
      signals: {
        total: totalSignals,
        published: publishedSignals,
        hitRate: Math.round(signalHitRate * 10) / 10,
        subscribers: signalSubscribers
      },
        courses: {
          total: totalCourses,
          enrollments: courseEnrollments,
          revenue: courseRevenue
        },
      broker: {
        registrations: brokerRegistrations
      },
      mentorship: {
        payments: mentorshipPayments._sum.amount || 0
      },
      resources: {
        purchases: resourcePurchases._sum.amountUSD || 0
      },
      events: {
        revenue: eventRegistrations._sum.amountUSD || 0
      },
      academy: {
        revenue: academyRegistrations._sum.amountUSD || 0
      },
      forecasts: {
        total: totalForecasts,
        likes: forecastLikes,
        comments: forecastComments
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
