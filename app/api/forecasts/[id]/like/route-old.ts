import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

// POST /api/forecasts/[id]/like - Like/unlike a forecast
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request })
    console.log('Like API - Token:', token)
    
    if (!token) {
      console.log('Like API - No token, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = token.id as string
    const forecastId = params.id

    // Check if forecast exists
    const forecast = await prisma.forecast.findUnique({
      where: { id: forecastId }
    })

    if (!forecast) {
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    // Check if user already liked this forecast
    const existingLike = await prisma.userForecastLike.findUnique({
      where: {
        userId_forecastId: {
          userId,
          forecastId
        }
      }
    })

    if (existingLike) {
      // Unlike the forecast
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

      return NextResponse.json({ liked: false, message: 'Forecast unliked' })
    } else {
      // Like the forecast
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

      return NextResponse.json({ liked: true, message: 'Forecast liked' })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
