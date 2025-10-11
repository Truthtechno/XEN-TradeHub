import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







// GET /api/admin/subscription-stats - Get subscription statistics
export async function GET(request: NextRequest) {
  try {
    // Use simple authentication that works
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      console.log('Subscription stats - No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      console.log('Subscription stats - User role not authorized:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Subscription stats - User authorized:', user.name, user.role)

    // Get total active users (exclude deactivated users)
    const totalUsers = await prisma.user.count({
      where: {
        // Only show active users (exclude deactivated users)
        // Include users without profiles (they are considered active by default)
        OR: [
          {
            profile: {
              isActive: true
            }
          },
          {
            profile: null
          }
        ]
      }
    })

    // Count users with SIGNALS or PREMIUM subscriptions
    const totalSubscribers = await prisma.subscription.count({
      where: { 
        status: 'ACTIVE',
        plan: {
          in: ['SIGNALS', 'PREMIUM']
        },
        user: {
          OR: [
            {
              profile: {
                isActive: true
              }
            },
            {
              profile: null
            }
          ]
        }
      }
    })

    // Get users without signal subscriptions
    const nonSubscribers = totalUsers - totalSubscribers

    // Get signal statistics
    const totalSignals = await prisma.signal.count()
    const activeSignals = await prisma.signal.count({
      where: { isActive: true }
    })

    // Get course statistics
    const totalCourses = await prisma.course.count()
    const activeCourses = await prisma.course.count({
      where: { status: 'PUBLISHED' }
    })

    // Get recent activity
    const recentSignals = await prisma.signal.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        symbol: true,
        action: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      users: {
        total: totalUsers,
        subscribers: totalSubscribers,
        nonSubscribers: nonSubscribers,
        subscriptionRate: totalUsers > 0 ? (totalSubscribers / totalUsers) * 100 : 0
      },
      signals: {
        total: totalSignals,
        active: activeSignals
      },
      courses: {
        total: totalCourses,
        active: activeCourses
      },
      recentSignals
    })
  } catch (error) {
    console.error('Error fetching subscription stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
