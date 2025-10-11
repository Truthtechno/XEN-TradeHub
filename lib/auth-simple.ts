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
    
    // First try to get user from NextAuth session
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
    
    // First try to get user from JWT token (proper authentication)
    let token = request.cookies.get('auth-token')?.value
    
    // Also check Authorization header for API testing
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.substring(7)
        console.log('Found Bearer token in Authorization header:', bearerToken)
        
        // In development mode, if the bearer token looks like an email, use it directly
        if (process.env.NODE_ENV === 'development' && bearerToken.includes('@')) {
          console.log('Development mode: Using email as authentication token')
          const user = await prisma.user.findUnique({
            where: { email: bearerToken },
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          })
          
          if (user) {
            console.log('Found user by email:', user.name, user.role)
            return {
              id: user.id,
              role: user.role,
              email: user.email,
              name: user.name,
              source: 'email-auth'
            }
          }
        } else {
          token = bearerToken
        }
      }
    }
    
    console.log('Auth token found:', !!token)
    
    // Development mode bypass for testing (only if no JWT token)
    if (process.env.NODE_ENV === 'development' && !token) {
      console.log('Development mode: Querying for user (no JWT token)')
      
      if (preferRegularUser) {
        // Get a random regular user
        const regularUsers = await prisma.user.findMany({
          where: {
            role: {
              in: ['STUDENT', 'USER']
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        })
        
        if (regularUsers.length > 0) {
          const randomUser = regularUsers[Math.floor(Math.random() * regularUsers.length)]
          console.log('Development mode: Using random regular user from database:', randomUser.name, randomUser.role)
          return {
            id: randomUser.id,
            role: randomUser.role,
            email: randomUser.email,
            name: randomUser.name,
            source: 'development-regular'
          }
        }
      }
      
      // Default to admin user
      const adminUser = await prisma.user.findFirst({
        where: {
          role: 'SUPERADMIN'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })
      
      if (adminUser) {
        console.log('Development mode: Using admin user from database:', adminUser.name, adminUser.role)
        return {
          id: adminUser.id,
          role: adminUser.role,
          email: adminUser.email,
          name: adminUser.name,
          source: 'development-admin'
        }
      }
      
      console.log('Development mode: No users found, returning null')
    }
    
    // Additional development mode bypass - if no token at all, use admin
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: No authentication found, using default admin')
      const adminUser = await prisma.user.findFirst({
        where: {
          role: 'SUPERADMIN'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })
      
      if (adminUser) {
        console.log('Development mode: Using default admin user:', adminUser.name, adminUser.role)
        return {
          id: adminUser.id,
          role: adminUser.role,
          email: adminUser.email,
          name: adminUser.name,
          source: 'development-default'
        }
      }
    }
    
    if (token) {
      try {
        console.log('Attempting JWT verification...')
        const decoded = jwt.verify(token, 'your-secret-key') as any
        console.log('JWT decoded successfully:', { id: decoded.id, email: decoded.email, role: decoded.role })
        
        console.log('Looking up user in database with ID:', decoded.id)
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        })
        
        console.log('Database lookup result:', user)
        
        if (user) {
          console.log('JWT auth: Found user:', user)
          return {
            id: user.id,
            role: user.role,
            email: user.email,
            name: user.name,
            source: 'jwt'
          }
        } else {
          console.log('JWT auth: User not found in database for ID:', decoded.id)
        }
      } catch (jwtError) {
        console.log('JWT verification failed:', jwtError instanceof Error ? jwtError.message : 'Unknown error')
        console.log('JWT error details:', jwtError)
      }
    } else {
      console.log('No auth token found in cookies')
    }
    
    // For API calls, don't fall back to other users - return null if JWT fails
    console.log('JWT verification failed, returning null for API call')
    return null
  } catch (error) {
    console.error('Simple auth error:', error)
    return null
  }
}

export function createAuthResponse(message: string, status: number = 401) {
  return Response.json({ error: message }, { status })
}
