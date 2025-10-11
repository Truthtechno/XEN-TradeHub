import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthResponse } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

// POST /api/forecasts/[id]/like - Like/unlike a forecast
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== LIKE API CALL ===')
    console.log('Request URL:', request.url)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    // Get authenticated user
    const user = await getAuthenticatedUser(request)
    console.log('Authenticated user:', user)
    
    if (!user) {
      console.log('No authenticated user found')
      return createAuthResponse('Authentication required')
    }

    const userId = user.id
    const forecastId = params.id
    console.log('User ID:', userId, 'Forecast ID:', forecastId)

    // Check if forecast exists
    const forecast = await prisma.forecast.findUnique({
      where: { id: forecastId }
    })

    if (!forecast) {
      console.log('Forecast not found:', forecastId)
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    console.log('Forecast found:', forecast.title)

    // Check if user already liked this forecast
    const existingLike = await prisma.userForecastLike.findUnique({
      where: {
        userId_forecastId: {
          userId,
          forecastId
        }
      }
    })

    console.log('Existing like:', existingLike)

    if (existingLike) {
      // Unlike the forecast
      console.log('Removing like...')
      await prisma.userForecastLike.delete({
        where: {
          userId_forecastId: {
            userId,
            forecastId
          }
        }
      })

      // Decrement like count
      await prisma.forecast.update({
        where: { id: forecastId },
        data: { likes: { decrement: 1 } }
      })

      console.log('Like removed successfully')
      return NextResponse.json({ 
        liked: false, 
        message: 'Forecast unliked',
        likes: forecast.likes - 1
      })
    } else {
      // Like the forecast
      console.log('Adding like...')
      await prisma.userForecastLike.create({
        data: {
          userId,
          forecastId
        }
      })

      // Increment like count
      await prisma.forecast.update({
        where: { id: forecastId },
        data: { likes: { increment: 1 } }
      })

      console.log('Like added successfully')
      return NextResponse.json({ 
        liked: true, 
        message: 'Forecast liked',
        likes: forecast.likes + 1
      })
    }
  } catch (error) {
    console.error('Like API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
