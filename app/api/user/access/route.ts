import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { accessControl } from '@/lib/access-control'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/user/access - Get user access permissions
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    // Get user access permissions
    const access = await accessControl.getUserAccess(user.id)

    return NextResponse.json({
      success: true,
      data: access
    })

  } catch (error) {
    console.error('Error getting user access:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
