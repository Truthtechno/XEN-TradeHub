import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/user/me - Get current user information
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    })
  } catch (error) {
    console.error('Error fetching user info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
