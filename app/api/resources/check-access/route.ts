import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { accessControl } from '@/lib/access-control'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/resources/check-access - Check if user has access to premium resources
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
    const { resourceId } = body

    if (!resourceId) {
      return NextResponse.json({ 
        hasAccess: false,
        message: 'Resource ID required' 
      }, { status: 400 })
    }

    // Use the new access control service
    const access = await accessControl.checkResourceAccess(user.id, resourceId)

    return NextResponse.json({
      hasAccess: access.hasAccess,
      requiresPayment: access.requiresPayment,
      message: access.reason,
      priceUSD: access.priceUSD,
      isIndividualPricing: access.isIndividualPricing,
      resourceTitle: access.priceUSD ? 'Premium Resource' : undefined
    })

  } catch (error) {
    console.error('Error checking resource access:', error)
    return NextResponse.json({ 
      hasAccess: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}