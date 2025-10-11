import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







// PUT /api/admin/users/role - Update user role
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAuthenticatedUserSimple(request)
    
    if (!admin || !['ADMIN', 'SUPERADMIN'].includes(admin.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    const roleUpdateSchema = z.object({
      userId: z.string().min(1),
      role: z.enum(['STUDENT', 'SIGNALS', 'PREMIUM', 'AFFILIATE']),
      reason: z.string().optional(),
      hasMentorship: z.boolean().optional()
    })

    const validatedData = roleUpdateSchema.parse(body)
    
    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    if (!currentUser) {
      return NextResponse.json({ 
        success: false,
        message: 'User not found' 
      }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      role: validatedData.role
    }

    // Set mentorship status based on role
    if (validatedData.role === 'PREMIUM') {
      updateData.hasMentorship = true
    } else if (validatedData.hasMentorship !== undefined) {
      updateData.hasMentorship = validatedData.hasMentorship
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    console.log('User role updated by admin:', {
      adminId: admin.id,
      adminEmail: admin.email,
      userId: updatedUser.id,
      userEmail: updatedUser.email,
      oldRole: currentUser.role,
      newRole: updatedUser.role,
      reason: validatedData.reason
    })

    return NextResponse.json({ 
      success: true,
      message: `User role updated to ${validatedData.role}`,
      user: updatedUser,
      changes: {
        role: {
          from: currentUser.role,
          to: updatedUser.role
        },
      }
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET /api/admin/users/role - Get user role information
export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedUserSimple(request)
    
    if (!admin || !['ADMIN', 'SUPERADMIN'].includes(admin.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        message: 'User ID required' 
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'User not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      user: user
    })

  } catch (error) {
    console.error('Error getting user role:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
