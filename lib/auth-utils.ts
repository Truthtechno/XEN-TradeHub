import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Prefer custom JWT cookie first
    const cookieToken = request.cookies.get('auth-token')?.value
    if (cookieToken) {
      try {
        const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET as string) as any
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, email: true, role: true }
        })
        if (user) {
          return { id: user.id, role: user.role, email: user.email, name: user.name, source: 'jwt-cookie' }
        }
      } catch (e) {
        console.log('Auth: custom JWT verify failed')
      }
    }

    // Then try NextAuth JWT (if used)
    const token = await getToken({ req: request })
    if (token) {
      console.log('Auth: NextAuth JWT token found:', { id: token.id, role: token.role })
      return {
        id: token.id as string,
        role: token.role as string,
        email: token.email as string,
        name: token.name as string,
        source: 'nextauth-jwt'
      }
    }

    // Fallback to session
    const session = await getServerSession(authOptions)
    if (session?.user) {
      console.log('Auth: Session found:', { id: (session.user as any).id, role: (session.user as any).role })
      return {
        id: (session.user as any).id,
        role: (session.user as any).role,
        email: session.user.email,
        name: session.user.name,
        source: 'session'
      }
    }

    console.log('Auth: No authentication found')
    return null
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export function createAuthResponse(message: string, status: number = 401) {
  return Response.json({ error: message }, { status })
}

export async function getAuthenticatedUserSimple(request: NextRequest) {
  try {
    // For development/testing, return a mock admin user
    if (process.env.NODE_ENV === 'development') {
      return {
        id: 'cmgz9k42t00008wbbr17oa6aq', // Actual admin user ID from xen_tradehub database
        role: 'SUPERADMIN',
        email: 'admin@corefx.com',
        name: 'Admin User'
      }
    }
    
    // Try JWT token first
    const token = await getToken({ req: request })
    if (token) {
      return {
        id: token.id as string,
        role: token.role as string,
        email: token.email as string,
        name: token.name as string
      }
    }

    // Fallback to session
    const session = await getServerSession(authOptions)
    if (session?.user) {
      return {
        id: (session.user as any).id,
        role: (session.user as any).role,
        email: session.user.email,
        name: session.user.name
      }
    }

    return null
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}
