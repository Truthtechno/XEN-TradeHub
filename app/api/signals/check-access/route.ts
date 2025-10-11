import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { accessControl } from '@/lib/access-control'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/signals/check-access - Check if user has access to premium signals
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        hasAccess: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { signalId } = body

    if (!signalId) {
      return NextResponse.json({ 
        hasAccess: false,
        message: 'Signal ID required' 
      }, { status: 400 })
    }

    // Use the new access control service
    const access = await accessControl.checkSignalsAccess(user.id)

    return NextResponse.json({
      hasAccess: access.hasAccess,
      requiresPayment: access.requiresPayment,
      message: access.reason,
      expiresAt: access.expiresAt,
      signalTitle: 'Premium Signal'
    })

  } catch (error) {
    console.error('Error checking signal access:', error)
    return NextResponse.json({ 
      hasAccess: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}