import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { paymentProcessor } from '@/lib/payment-processor'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/admin/sync-subscriptions - Sync all users' subscription statuses
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    // Only allow admin users
    const adminRoles = ['SUPERADMIN', 'ADMIN']
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    console.log('Starting subscription sync for all users...')
    const result = await paymentProcessor.syncAllUsersSubscriptionStatus()

    return NextResponse.json({ 
      success: true,
      message: 'Subscription sync completed',
      result
    })

  } catch (error) {
    console.error('Error syncing subscriptions:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/admin/sync-subscriptions - Get sync status
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    // Only allow admin users
    const adminRoles = ['SUPERADMIN', 'ADMIN']
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Sync endpoint is available',
      endpoints: {
        sync: 'POST /api/admin/sync-subscriptions',
        status: 'GET /api/admin/sync-subscriptions'
      }
    })

  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
