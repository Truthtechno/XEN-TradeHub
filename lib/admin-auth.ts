import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  profile: any
  subscription: any
  brokerAccount: any
}

export async function getAdminUser(request: NextRequest): Promise<AdminUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        profile: true,
        subscription: true,
        brokerAccount: true
      }
    })

    if (!user) {
      return null
    }

    // Check if user has admin role
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR', 'SUPPORT']
    if (!adminRoles.includes(user.role)) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.profile,
      subscription: user.subscription,
      brokerAccount: user.brokerAccount
    }
  } catch (error) {
    console.error('Admin auth error:', error)
    return null
  }
}

export function requireAdmin(handler: (request: NextRequest, user: AdminUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await getAdminUser(request)
    
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return handler(request, user)
  }
}

export function hasPermission(user: AdminUser, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    SUPERADMIN: ['*'], // All permissions
    ADMIN: ['users.read', 'users.write', 'signals.read', 'signals.write', 'courses.read', 'courses.write', 'reports.read'],
    ANALYST: ['signals.read', 'signals.write', 'reports.read', 'users.read'],
    EDITOR: ['courses.read', 'courses.write', 'resources.read', 'resources.write', 'notifications.read', 'notifications.write'],
    SUPPORT: ['users.read', 'tickets.read', 'tickets.write']
  }

  const userPermissions = rolePermissions[user.role] || []
  
  return userPermissions.includes('*') || userPermissions.includes(permission)
}
