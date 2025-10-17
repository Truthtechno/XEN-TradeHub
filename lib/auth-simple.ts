import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Simple authentication that works with the current setup
export async function getAuthenticatedUserSimple(request: NextRequest, preferRegularUser = false) {
  try {
    console.log('=== SIMPLE AUTH CHECK ===')
    console.log('Request URL:', request.url)
    console.log('Prefer regular user:', preferRegularUser)
    
    // First and foremost: prefer custom JWT cookie to avoid mixing with any NextAuth session
    try {
      let token = request.cookies.get('auth-token')?.value
      if (!token) {
        const authHeader = request.headers.get('authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7)
        }
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
          const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, role: true }
          })
          if (user) {
            return { id: user.id, role: user.role, email: user.email, name: user.name, source: 'jwt' }
          }
        } catch (e) {
          console.log('JWT verify failed (prefer custom JWT):', e instanceof Error ? e.message : e)
        }
      }
    } catch (e) {
      console.log('JWT pre-check block error:', e)
    }
    
    // If no valid custom JWT, try to get user from NextAuth session
    try {
      const session = await getServerSession(authOptions)
      if (session?.user) {
        console.log('NextAuth session found:', session.user)
        
        // Find the user in database to get full details
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        })
        
        if (dbUser) {
          console.log('NextAuth: Found user in database:', dbUser.name)
          return {
            id: dbUser.id,
            role: dbUser.role,
            email: dbUser.email,
            name: dbUser.name,
            source: 'nextauth'
          }
        } else {
          console.log('NextAuth: User not found in database')
        }
      } else {
        console.log('No NextAuth session found')
      }
    } catch (nextAuthError) {
      console.log('NextAuth session check failed:', nextAuthError instanceof Error ? nextAuthError.message : 'Unknown error')
    }
    
    // No development fallbacks to avoid cross-role leakage.
    
    // For API calls, don't fall back to other users - return null if JWT fails
    console.log('No valid authentication found, returning null')
    return null
  } catch (error) {
    console.error('Simple auth error:', error)
    return null
  }
}

export function createAuthResponse(message: string, status: number = 401) {
  return Response.json({ error: message }, { status })
}
