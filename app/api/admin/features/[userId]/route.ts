import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SUPERADMIN can access features management
    if (user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = params

    // Fetch user's permissions
    const permissions = await prisma.adminFeature.findMany({
      where: {
        userId
      },
      select: {
        feature: true,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canApprove: true
      }
    })

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Failed to fetch user permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user permissions' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SUPERADMIN can manage features
    if (user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = params
    const { permissions } = await request.json()

    // Verify target user exists and is an ADMIN
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Can only manage permissions for ADMIN users' },
        { status: 400 }
      )
    }

    // Delete all existing permissions for this user
    await prisma.adminFeature.deleteMany({
      where: { userId }
    })

    // Create new permissions
    if (permissions && permissions.length > 0) {
      await prisma.adminFeature.createMany({
        data: permissions.map((p: any) => ({
          userId,
          feature: p.feature,
          canView: p.canView || false,
          canCreate: p.canCreate || false,
          canEdit: p.canEdit || false,
          canDelete: p.canDelete || false,
          canExport: p.canExport || false,
          canApprove: p.canApprove || false
        }))
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update permissions:', error)
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    )
  }
}
