import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/test-auth - Test authentication status
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'Not authenticated',
        authStatus: 'NOT_AUTHENTICATED'
      })
    }

    const isAdmin = ['SUPERADMIN', 'ADMIN', 'SUPPORT', 'ANALYST', 'EDITOR'].includes(user.role)
    const isSuperAdmin = user.role === 'SUPERADMIN'

    return NextResponse.json({ 
      success: true,
      message: 'Authentication successful',
      authStatus: 'AUTHENTICATED',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      permissions: {
        isAdmin,
        isSuperAdmin,
        canAccessAdminPanel: isAdmin,
        canManageUsers: isSuperAdmin || user.role === 'ADMIN',
        canManageContent: isAdmin
      }
    })

  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Authentication test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      authStatus: 'ERROR'
    }, { status: 500 })
  }
}
