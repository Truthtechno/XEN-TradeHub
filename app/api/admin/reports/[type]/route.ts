import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/admin/reports/[type] - Get report data
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST']
    
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const format = searchParams.get('format') || 'json'

    // Build date filter
    const dateFilter: any = {}
    if (dateFrom) dateFilter.gte = new Date(dateFrom)
    if (dateTo) dateFilter.lte = new Date(dateTo)

    let reportData: any = {}

    switch (params.type) {
      case 'users':
        reportData = await generateUsersReport(dateFilter)
        break
      case 'revenue':
        reportData = await generateRevenueReport(dateFilter)
        break
      case 'signals':
        reportData = await generateSignalsReport(dateFilter)
        break
      case 'courses':
        reportData = await generateCoursesReport(dateFilter)
        break
      case 'broker':
        reportData = await generateBrokerReport(dateFilter)
        break
      case 'affiliates':
        reportData = await generateAffiliatesReport(dateFilter)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: 'GENERATE_REPORT',
        entity: 'Report',
        entityId: params.type,
        diff: {
          type: params.type,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
          format
        }
      }
    })

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions to generate different types of reports
async function generateUsersReport(dateFilter: any) {
  const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}

  const [users, totalUsers, newUsers, activeUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        subscription: true,
        brokerAccount: true,
        _count: {
          select: {
            orders: true,
            pollVotes: true,
            affiliateClicks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })
  ])

  return {
    summary: {
      totalUsers,
      newUsers,
      activeUsers
    },
    users: users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      country: user.profile?.country,
      subscription: user.subscription?.plan,
      brokerVerified: user.brokerAccount?.status === 'VERIFIED',
      ordersCount: user._count.orders,
      votesCount: user._count.pollVotes,
      clicksCount: user._count.affiliateClicks,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }))
  }
}

async function generateRevenueReport(dateFilter: any) {
  const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}

  const [orders, totalRevenue, monthlyRevenue] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.aggregate({
      where,
      _sum: { amount: true }
    }),
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      _sum: { amount: true }
    })
  ])

  return {
    summary: {
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0
    },
    orders: orders.map(order => ({
      id: order.id,
      userId: order.userId,
      user: order.user,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      stripeId: order.stripeId,
      createdAt: order.createdAt
    }))
  }
}

async function generateSignalsReport(dateFilter: any) {
  const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}

  const [signals, totalSignals, publishedSignals] = await Promise.all([
    prisma.signal.findMany({
      where,
      include: {
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.signal.count(),
    prisma.signal.count({
      where: {
        publishedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })
  ])

  return {
    summary: {
      totalSignals,
      publishedSignals
    },
    signals: signals.map(signal => ({
      id: signal.id,
      symbol: signal.symbol,
      direction: signal.direction,
      entry: signal.entry,
      sl: signal.sl,
      tp: signal.tp,
      notes: signal.notes,
      visibility: signal.visibility,
      publishedAt: signal.publishedAt,
      createdAt: signal.createdAt
    }))
  }
}

async function generateCoursesReport(dateFilter: any) {
  const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}

  const [courses, totalCourses, totalEnrollments] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.course.count(),
    prisma.userCourse.count()
  ])

  return {
    summary: {
      totalCourses,
      totalEnrollments
    },
    courses: courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      priceUSD: course.priceUSD,
      level: course.level,
      status: course.status,
      lessonsCount: course._count.lessons,
      enrollmentsCount: course._count.enrollments,
      enrollments: course.enrollments.map(enrollment => ({
        id: enrollment.id,
        user: enrollment.user,
        progress: enrollment.progress,
        completed: enrollment.completed,
        enrolledAt: enrollment.enrolledAt
      })),
      createdAt: course.createdAt
    }))
  }
}

async function generateBrokerReport(dateFilter: any) {
  const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}

  const [registrations, links, totalClicks, totalRegistrations, verifiedRegistrations] = await Promise.all([
    prisma.brokerRegistration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        link: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.brokerLink.findMany({
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    }),
    prisma.affiliateClick.count(),
    prisma.brokerRegistration.count(),
    prisma.brokerRegistration.count()
  ])

  return {
    summary: {
      totalClicks,
      totalRegistrations,
      verifiedRegistrations,
      conversionRate: totalClicks > 0 ? (totalRegistrations / totalClicks) * 100 : 0
    },
    registrations: registrations.map(reg => ({
      id: reg.id,
      user: reg.user,
      link: reg.link,
      createdAt: reg.createdAt
    })),
    links: links.map(link => ({
      id: link.id,
      name: link.name,
      isActive: link.isActive,
      registrationsCount: link._count.registrations,
      createdAt: link.createdAt
    }))
  }
}

async function generateAffiliatesReport(dateFilter: any) {
  const where = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}

  const clicks = await prisma.affiliateClick.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const totalClicks = clicks.length

  return {
    summary: {
      totalPrograms: 0, // No affiliate programs model
      totalClicks,
      totalRegistrations: 0, // No affiliate registrations model
      conversionRate: 0,
      totalCommission: 0
    },
    programs: [], // No affiliate programs model
    clicks: clicks.map(click => ({
      id: click.id,
      user: click.user,
      createdAt: click.createdAt
    })),
    registrations: [] // No affiliate registrations model
  }
}
