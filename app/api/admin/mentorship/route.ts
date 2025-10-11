import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/mentorship - Get all mentorship data
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get registrations with pagination
    const [registrations, total] = await Promise.all([
      prisma.mentorshipRegistration.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true
            }
          },
          appointments: {
            orderBy: { scheduledAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.mentorshipRegistration.count({ where })
    ])

    // Get payments for these registrations
    const registrationIds = registrations.map(r => r.id)
    const payments = await prisma.mentorshipPayment.findMany({
      where: {
        registrationId: { in: registrationIds }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get statistics
    const stats = await getMentorshipStats()

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        payments,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching mentorship data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch mentorship data' },
      { status: 500 }
    )
  }
}

// POST /api/admin/mentorship - Create new mentorship registration
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, country, experience, goals, userId } = body

    // Validate required fields
    if (!name || !email || !phone || !country) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Check if user exists
    let targetUser = null
    if (userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: userId }
      })
    } else {
      // Find user by email or create new one
      targetUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (!targetUser) {
        // Create new user
        targetUser = await prisma.user.create({
          data: {
            email,
            name,
            role: 'STUDENT'
          }
        })
      }
    }

    // Create mentorship registration
    if (!targetUser) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    const registration = await prisma.mentorshipRegistration.create({
      data: {
        userId: targetUser.id,
        name,
        email,
        phone,
        country,
        experience: experience || '',
        goals: goals || '',
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mentorship registration created successfully',
      data: registration
    })

  } catch (error) {
    console.error('Error creating mentorship registration:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create mentorship registration' },
      { status: 500 }
    )
  }
}

// Helper function to get mentorship statistics
async function getMentorshipStats() {
  const [
    totalRegistrations,
    pendingRegistrations,
    completedRegistrations,
    totalPayments,
    completedPayments,
    totalRevenue,
    upcomingAppointments,
    completedAppointments
  ] = await Promise.all([
    prisma.mentorshipRegistration.count(),
    prisma.mentorshipRegistration.count({ where: { status: 'PENDING' } }),
    prisma.mentorshipRegistration.count({ where: { status: 'COMPLETED' } }),
    prisma.mentorshipPayment.count(),
    prisma.mentorshipPayment.count({ where: { status: 'completed' } }),
    prisma.mentorshipPayment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true }
    }),
    prisma.mentorshipAppointment.count({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() }
      }
    }),
    prisma.mentorshipAppointment.count({
      where: { status: 'COMPLETED' }
    })
  ])

  return {
    totalRegistrations,
    pendingRegistrations,
    completedRegistrations,
    totalPayments,
    completedPayments,
    totalRevenue: totalRevenue._sum.amount || 0,
    upcomingAppointments,
    completedAppointments
  }
}
