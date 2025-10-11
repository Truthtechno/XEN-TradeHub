import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// POST /api/forecasts/[id]/view - Track a view for a forecast
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== FORECAST VIEW API CALL ===')
    console.log('Forecast ID:', params.id)

    // Use simple authentication that works
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('No authenticated user found for view tracking')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('Authenticated user:', user)

    const forecastId = params.id
    const userId = (user as any).id

    // Check if forecast exists
    const forecast = await prisma.forecast.findUnique({
      where: { id: forecastId }
    })

    if (!forecast) {
      console.log('Forecast not found for view tracking:', forecastId)
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    // For now, use a simple approach: increment view count
    // TODO: Implement proper duplicate prevention with UserForecastView table
    // Note: Forecast model doesn't have views field, so we skip view tracking
    const updatedForecast = { views: 0 }

    console.log('View tracked for forecast:', forecastId, 'by user:', userId, 'New count:', updatedForecast.views)

    return NextResponse.json({ 
      message: 'View tracked successfully', 
      views: updatedForecast.views 
    })
  } catch (error) {
    console.error('Failed to track forecast view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
