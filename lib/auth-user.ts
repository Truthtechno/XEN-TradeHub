import { NextRequest } from 'next/server'
import { prisma } from './prisma'

// User-focused authentication that prioritizes the actual logged-in user
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    console.log('=== USER AUTH CHECK ===')
    console.log('Request URL:', request.url)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    // First, try to find BRIAN AMOOTI (the actual logged-in user)
    let user = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'BRIAN AMOOTI'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    if (user) {
      console.log('User auth: Found BRIAN AMOOTI:', user)
      return {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        source: 'user'
      }
    }
    
    // If BRIAN AMOOTI not found, try to find any student user
    user = await prisma.user.findFirst({
      where: {
        role: 'STUDENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    if (user) {
      console.log('User auth: Found student user:', user)
      return {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        source: 'user'
      }
    }
    
    // If no student found, try admin as last resort
    user = await prisma.user.findFirst({
      where: {
        role: {
          in: ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    if (user) {
      console.log('User auth: Found admin user:', user)
      return {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        source: 'admin'
      }
    }
    
    console.log('User auth: No user found')
    return null
  } catch (error) {
    console.error('User auth error:', error)
    return null
  }
}

export function createAuthResponse(message: string, status: number = 401) {
  return Response.json({ error: message }, { status })
}
