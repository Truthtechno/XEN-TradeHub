import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/admin/users/[id] - Get detailed user information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated admin user
    const admin = await getAuthenticatedUserSimple(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'SUPPORT']
    
    if (!adminRoles.includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        subscription: true,
        brokerAccount: true,
        adminProfile: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        courses: {
          include: {
            course: true
          },
          orderBy: { enrolledAt: 'desc' },
          take: 10
        },
        signals: {
          include: {
            signal: true
          },
          orderBy: { receivedAt: 'desc' },
          take: 10
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        brokerRegistrations: {
          include: {
            link: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            orders: true,
            pollVotes: true,
            affiliateClicks: true,
            courses: true,
            signals: true,
            bookings: true,
            brokerRegistrations: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated admin user
    const admin = await getAuthenticatedUserSimple(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN']
    
    if (!adminRoles.includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()
    const { name, email, role, country } = body

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
        ...(country && {
          profile: {
            upsert: {
              create: {
                firstName: name.split(' ')[0] || '',
                lastName: name.split(' ').slice(1).join(' ') || '',
                country: country,
                isActive: true
              },
              update: {
                country: country
              }
            }
          }
        })
      },
      include: {
        profile: true,
        subscription: true,
        brokerAccount: true,
        adminProfile: true
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'UPDATE_USER',
        entity: 'User',
        entityId: userId,
        diff: {
          name,
          email,
          role,
          country
        }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Deactivate user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const adminRoles = ['SUPERADMIN', 'ADMIN']
    
    if (!adminRoles.includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = params.id

    // Update user profile to deactivate
    await prisma.userProfile.updateMany({
      where: { userId },
      data: { isActive: false }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: decoded.id,
        action: 'DEACTIVATE_USER',
        entity: 'User',
        entityId: userId,
        diff: {
          action: 'deactivated'
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
