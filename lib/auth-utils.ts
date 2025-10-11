import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Try JWT token first
    const token = await getToken({ req: request })
    if (token) {
      console.log('Auth: JWT token found:', { id: token.id, role: token.role })
      return {
        id: token.id as string,
        role: token.role as string,
        email: token.email as string,
        name: token.name as string,
        source: 'jwt'
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
        id: 'cmghmk1tu00001d3t8ipi2pm6',
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
