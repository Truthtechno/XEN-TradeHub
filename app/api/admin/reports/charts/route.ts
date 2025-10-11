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
    const dateRange = searchParams.get('dateRange') || '30d'
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
      default:
        startDate = new Date(0) // All time
        monthsBack = 12
    }

    // Generate month labels
    const monthLabels = []
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      monthLabels.push(date.toLocaleDateString('en-US', { month: 'short' }))
    }

    if (chartType === 'revenue') {
      // Revenue trend data
      const revenueData = []
      
      for (let i = monthsBack - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
        
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
          name: monthLabels[monthsBack - 1 - i],
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
      const userData = []
      
      for (let i = monthsBack - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
        
        const newUsers = await prisma.user.count({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd }
          }
        })
        
        userData.push({
          name: monthLabels[monthsBack - 1 - i],
          value: newUsers
        })
      }
      
      return NextResponse.json({
        success: true,
        data: userData,
        type: 'users'
      })
    }
    
    if (chartType === 'signals') {
      // Signal performance data
      const signalData = []
      
      for (let i = monthsBack - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
        
        const [published, likes, comments] = await Promise.all([
          prisma.signal.count({
            where: {
              publishedAt: { gte: monthStart, lte: monthEnd },
              isActive: true
            }
          }),
          prisma.userSignalLike.count({
            where: {
              createdAt: { gte: monthStart, lte: monthEnd }
            }
          }),
          prisma.userSignalComment.count({
            where: {
              createdAt: { gte: monthStart, lte: monthEnd }
            }
          })
        ])
        
        signalData.push({
          name: monthLabels[monthsBack - 1 - i],
          published,
          likes,
          comments
        })
      }
      
      return NextResponse.json({
        success: true,
        data: signalData,
        type: 'signals'
      })
    }
    
    if (chartType === 'courses') {
      // Course enrollment data
      const courseData = []
      
      for (let i = monthsBack - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
        
        const enrollments = await prisma.courseEnrollment.count({
          where: {
            enrolledAt: { gte: monthStart, lte: monthEnd }
          }
        })
        
        // Calculate revenue by getting enrollments with course data
        const enrollmentsWithCourses = await prisma.courseEnrollment.findMany({
          where: {
            enrolledAt: { gte: monthStart, lte: monthEnd }
          },
          include: {
            course: true
          }
        })
        
        const revenue = enrollmentsWithCourses.reduce((sum, enrollment) => {
          return sum + (enrollment.course.priceUSD || 0)
        }, 0)
        
        courseData.push({
          name: monthLabels[monthsBack - 1 - i],
          enrollments,
          revenue
        })
      }
      
      return NextResponse.json({
        success: true,
        data: courseData,
        type: 'courses'
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
