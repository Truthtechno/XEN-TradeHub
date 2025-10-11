import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, accountType, timestamp, userAgent, referrer } = body

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Save the analytics data to your database
    // 2. Track conversion funnels
    // 3. Monitor user behavior
    // 4. Generate reports

    // For now, we'll simulate logging the analytics data
    console.log('Analytics event:', {
      action,
      accountType,
      timestamp: timestamp || new Date().toISOString(),
      userAgent,
      referrer,
      ip: request.ip || request.headers.get('x-forwarded-for')
    })

    return NextResponse.json({
      success: true,
      message: 'Analytics data recorded successfully'
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    const metric = searchParams.get('metric') || 'all'

    // Here you would typically:
    // 1. Query your analytics database
    // 2. Calculate metrics based on the period and metric type
    // 3. Return aggregated data

    // For now, we'll return mock analytics data
    const mockData = {
      period,
      metric,
      data: {
        totalVisits: 1250,
        popupOpens: 340,
        newAccountRegistrations: 89,
        existingAccountVerifications: 45,
        conversionRate: 0.39,
        topReferrers: [
          { source: 'Direct', count: 450 },
          { source: 'Google', count: 320 },
          { source: 'Telegram', count: 280 },
          { source: 'Facebook', count: 200 }
        ],
        dailyBreakdown: [
          { date: '2024-01-01', visits: 45, conversions: 18 },
          { date: '2024-01-02', visits: 52, conversions: 21 },
          { date: '2024-01-03', visits: 38, conversions: 15 },
          { date: '2024-01-04', visits: 61, conversions: 24 },
          { date: '2024-01-05', visits: 48, conversions: 19 }
        ]
      }
    }

    return NextResponse.json(mockData)

  } catch (error) {
    console.error('Analytics GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
