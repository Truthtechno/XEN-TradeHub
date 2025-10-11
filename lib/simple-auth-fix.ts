import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import jwt from 'jsonwebtoken'

// Simplified authentication that just works
export async function getAuthenticatedUserSimpleFix(request: NextRequest) {
  try {
    console.log('=== SIMPLE AUTH FIX ===')
    
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value
    console.log('Token found:', !!token)
    
    if (!token) {
      console.log('No token found')
      return null
    }
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(token, 'your-secret-key') as any
      console.log('JWT decoded:', { id: decoded.id, email: decoded.email, role: decoded.role })
      
      // Find user in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })
      
      if (user) {
        console.log('User found:', user)
        return {
          id: user.id,
          role: user.role,
          email: user.email,
          name: user.name,
          source: 'jwt'
        }
      } else {
        console.log('User not found in database')
        return null
      }
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError)
      return null
    }
  } catch (error) {
    console.error('Simple auth fix error:', error)
    return null
  }
}
