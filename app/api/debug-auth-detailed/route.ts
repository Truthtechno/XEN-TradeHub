import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import jwt from 'jsonwebtoken'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/debug-auth-detailed - Detailed authentication debug
export async function GET(request: NextRequest) {
  try {
    console.log('=== DETAILED AUTH DEBUG ===')
    console.log('Request URL:', request.url)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    const token = request.cookies.get('auth-token')?.value
    console.log('Cookie token found:', !!token)
    console.log('Cookie token value:', token?.substring(0, 50) + '...')
    
    // Test JWT verification directly
    let jwtDecoded = null
    if (token) {
      try {
        jwtDecoded = jwt.verify(token, 'your-secret-key') as any
        console.log('Direct JWT verification successful:', jwtDecoded)
      } catch (jwtError) {
        console.log('Direct JWT verification failed:', jwtError)
      }
    }
    
    // Test the authentication function
    console.log('Calling getAuthenticatedUserSimple...')
    const authResult = await getAuthenticatedUserSimple(request)
    console.log('getAuthenticatedUserSimple result:', authResult)
    
    return NextResponse.json({ 
      success: true,
      message: 'Debug completed',
      debug: {
        hasToken: !!token,
        tokenPreview: token?.substring(0, 50) + '...',
        jwtDecoded,
        authResult,
        headers: Object.fromEntries(request.headers.entries())
      }
    })

  } catch (error) {
    console.error('Debug auth detailed error:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Debug auth detailed failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
