import { NextRequest, NextResponse } from 'next/server'
import { workingFinalBilling } from '@/lib/working-final-billing'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




// POST /api/cron/billing - Process due subscriptions and retry failed payments


export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (in production, add proper authentication)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-cron-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized' 
      }, { status: 401 })
    }

    console.log('Starting billing cron job...')

    // Process due subscriptions
    const dueResults = await workingFinalBilling.processDueSubscriptions()
    
    // For now, we'll skip grace period and retry logic in the simplified version
    const graceResults = { expired: 0 }
    const retryResults = { retried: 0, successful: 0, failed: 0 }

    const summary = {
      dueSubscriptions: dueResults,
      gracePeriodExpirations: graceResults,
      retryResults: retryResults,
      timestamp: new Date().toISOString()
    }

    console.log('Billing cron job completed:', summary)

    return NextResponse.json({ 
      success: true,
      message: 'Billing cron job completed successfully',
      results: summary
    })

  } catch (error) {
    console.error('Billing cron job error:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Billing cron job failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/cron/billing - Health check for cron job
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true,
    message: 'Billing cron job endpoint is healthy',
    timestamp: new Date().toISOString()
  })
}
