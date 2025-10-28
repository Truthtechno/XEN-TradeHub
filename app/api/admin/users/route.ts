import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { hasPermission } from '@/lib/admin-permissions'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







// GET /api/admin/users - Get all users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Use simple authentication that works
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('Admin users API - No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'SUPPORT', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      console.log('Admin users API - User role not authorized:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check feature-specific permissions for ADMIN role (SUPERADMIN bypasses)
    if (user.role === 'ADMIN') {
      const canViewUsers = await hasPermission(user.id, 'users', 'view')
      if (!canViewUsers) {
        console.log('Admin users API - User does not have permission to view users')
        return NextResponse.json({ error: 'Insufficient permissions to view users' }, { status: 403 })
      }
    }

    console.log('Admin users API - User authorized:', user.name, user.role)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      ]
    }
    
    if (role !== 'all') {
      where.role = role
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder


    // Add filter to exclude deactivated users (only if profile exists)
    where.OR = [
      { profile: { isActive: true } },
      { profile: null } // Include users without profiles
    ]

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          profile: true,
          subscription: true,
          brokerAccount: true,
          adminProfile: true,
          mentorshipPayments: {
            where: { status: 'completed' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.user.count({ where })
    ])

    console.log('Admin users API - Found users:', users.length)
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users - Batch delete users
export async function DELETE(request: NextRequest) {
  try {
    // Use simple authentication that works
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('Admin users batch delete API - No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN']
    
    if (!adminRoles.includes(user.role)) {
      console.log('Admin users batch delete API - User role not authorized:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check feature-specific permissions for ADMIN role (SUPERADMIN bypasses)
    if (user.role === 'ADMIN') {
      const canDeleteUsers = await hasPermission(user.id, 'users', 'delete')
      if (!canDeleteUsers) {
        console.log('Admin users API - User does not have permission to delete users')
        return NextResponse.json({ error: 'Insufficient permissions to delete users' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { userIds, hardDelete = false } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'User IDs are required' }, { status: 400 })
    }

    console.log('Admin users batch delete API - Deleting users:', userIds, 'Hard delete:', hardDelete)

    let result = { count: 0 }

    if (hardDelete) {
      // Hard delete - completely remove users and all related data
      for (const userId of userIds) {
        // Delete in order to respect foreign key constraints
        await prisma.auditLog.deleteMany({ where: { actorId: userId } })
        await prisma.auditLog.deleteMany({ where: { entityId: userId } })
        await prisma.userProfile.deleteMany({ where: { userId } })
        await prisma.subscription.deleteMany({ where: { userId } })
        await prisma.brokerAccount.deleteMany({ where: { userId } })
        // Note: adminProfile deletion commented out due to Prisma client issue
        // await prisma.adminProfile.deleteMany({ where: { userId } })
        await prisma.user.delete({ where: { id: userId } })
        result.count++
      }

      // Log the action for each user
      for (const userId of userIds) {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: 'BATCH_DELETE_USER',
            entity: 'User',
            entityId: userId,
            diff: {
              action: 'batch hard deleted',
              batchSize: userIds.length
            }
          }
        })
      }
    } else {
      // Soft delete - deactivate users
      for (const userId of userIds) {
        await prisma.userProfile.upsert({
          where: { userId },
          update: { isActive: false },
          create: { 
            userId,
            isActive: false 
          }
        })
        result.count++
      }

      // Log the action for each user
      for (const userId of userIds) {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: 'BATCH_DEACTIVATE_USER',
            entity: 'User',
            entityId: userId,
            diff: {
              action: 'batch deactivated',
              batchSize: userIds.length
            }
          }
        })
      }
    }

    console.log('Admin users batch delete API - Processed users:', result.count)

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ${hardDelete ? 'deleted' : 'deactivated'} ${result.count} users`,
      count: result.count
    })
  } catch (error) {
    console.error('Error batch deleting users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    // Use simple authentication that works
    const authenticatedUser = await getAuthenticatedUserSimple(request)
    
    if (!authenticatedUser) {
      console.log('Admin users create API - No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN']
    
    if (!adminRoles.includes(authenticatedUser.role)) {
      console.log('Admin users create API - User role not authorized:', authenticatedUser.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check feature-specific permissions for ADMIN role (SUPERADMIN bypasses)
    if (authenticatedUser.role === 'ADMIN') {
      const canCreateUsers = await hasPermission(authenticatedUser.id, 'users', 'create')
      if (!canCreateUsers) {
        console.log('Admin users API - User does not have permission to create users')
        return NextResponse.json({ error: 'Insufficient permissions to create users' }, { status: 403 })
      }
    }

    const body = await request.json()
    
    const userSchema = z.object({
      email: z.string().email(),
      name: z.string().min(1),
      role: z.enum(['STUDENT', 'AFFILIATE', 'SUPPORT', 'EDITOR', 'ANALYST', 'ADMIN', 'SUPERADMIN']),
      password: z.string().min(6).optional(),
      profile: z.object({
        country: z.string().optional(),
        phone: z.string().optional(),
        telegram: z.string().optional()
      }).optional()
    })

    const validatedData = userSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        password: validatedData.password ? await hashPassword(validatedData.password) : null,
        profile: validatedData.profile ? {
          create: validatedData.profile
        } : undefined
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
        actorId: authenticatedUser.id,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user.id,
        diff: {
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to hash password
async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}
