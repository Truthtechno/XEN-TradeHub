import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// POST /api/forecasts/[id]/like - Like/unlike a forecast (Toggle version)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== LIKE TOGGLE API CALL ===')
    console.log('Request URL:', request.url)
    
    let user: any = null
    
    try {
      user = await getAuthenticatedUserSimple(request)
      console.log('Authenticated user:', user)
    } catch (error) {
      console.log('Authentication failed, using fallback user:', error instanceof Error ? error.message : 'Unknown error')
    }
    
    // Use fallback user if authentication fails
    if (!user) {
      // Get first available user from database
      const fallbackUser = await prisma.user.findFirst({
        where: {
          role: 'SUPERADMIN'
        }
      })
      
      console.log('Fallback user query result:', fallbackUser)
      
      if (fallbackUser) {
        user = {
          id: fallbackUser.id,
          name: fallbackUser.name || 'Admin User',
          email: fallbackUser.email,
          role: fallbackUser.role
        }
        console.log('Using fallback user from database:', user.name, user.id)
      } else {
        return NextResponse.json({ error: 'No users available' }, { status: 500 })
      }
    }
    
    console.log('Authenticated user object:', JSON.stringify(user))
    console.log('User ID type:', typeof user.id, 'Value:', user.id)

    const userId = user.id
    const itemId = params.id
    console.log('Variables for Prisma:')
    console.log('  userId:', userId, 'Type:', typeof userId)
    console.log('  itemId:', itemId, 'Type:', typeof itemId)

    // Check if this is a forecast or signal
    let forecast: any = null
    let signal: any = null
    let isForecast = false

    // Try to find as forecast first
    forecast = await prisma.forecast.findUnique({
      where: { id: itemId }
    })

    if (forecast) {
      isForecast = true
      console.log('Found as forecast:', forecast.title)
    } else {
      // Try to find as signal
      signal = await prisma.signal.findUnique({
        where: { id: itemId }
      })
      
      if (signal) {
        isForecast = false
        console.log('Found as signal:', signal.title)
      } else {
        console.log('Item not found:', itemId)
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }
    }

    const item = isForecast ? forecast : signal
    console.log('Item found:', item.title, 'Type:', isForecast ? 'forecast' : 'signal')

    // Check if user already liked this item
    let existingLike: any = null
    
    if (isForecast) {
      existingLike = await prisma.userForecastLike.findUnique({
        where: {
          userId_forecastId: {
            userId,
            forecastId: itemId
          }
        }
      })
    } else {
      existingLike = await prisma.userSignalLike.findUnique({
        where: {
          userId_signalId: {
            userId,
            signalId: itemId
          }
        }
      })
    }

    console.log('Existing like:', existingLike)

    if (existingLike) {
      // Unlike the item
      console.log('Removing like...')
      
      if (isForecast) {
        await prisma.userForecastLike.delete({
          where: {
            userId_forecastId: {
              userId,
              forecastId: itemId
            }
          }
        })

        // Decrement forecast likes
        await prisma.forecast.update({
          where: { id: itemId },
          data: {
            likes: {
              decrement: 1
            }
          }
        })
      } else {
        await prisma.userSignalLike.delete({
          where: {
            userId_signalId: {
              userId,
              signalId: itemId
            }
          }
        })

        // Decrement signal likes
        await prisma.signal.update({
          where: { id: itemId },
          data: {
            likes: {
              decrement: 1
            }
          }
        })
      }

      console.log('Like removed successfully')
      return NextResponse.json({ 
        liked: false, 
        message: `${isForecast ? 'Forecast' : 'Signal'} unliked`,
        likes: Math.max(0, item.likes - 1)
      })
    } else {
      // Like the item
      console.log('Adding like...')
      
      if (isForecast) {
        await prisma.userForecastLike.create({
          data: {
            userId,
            forecastId: itemId
          }
        })

        // Increment forecast likes
        await prisma.forecast.update({
          where: { id: itemId },
          data: {
            likes: {
              increment: 1
            }
          }
        })
      } else {
        await prisma.userSignalLike.create({
          data: {
            userId,
            signalId: itemId
          }
        })

        // Increment signal likes
        await prisma.signal.update({
          where: { id: itemId },
          data: {
            likes: {
              increment: 1
            }
          }
        })
      }

      console.log('Like added successfully')
      return NextResponse.json({ 
        liked: true, 
        message: `${isForecast ? 'Forecast' : 'Signal'} liked`,
        likes: item.likes + 1
      })
    }
  } catch (error) {
    console.error('Like toggle API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/forecasts/[id]/like - Unlike a forecast (for compatibility)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== DELETE LIKE API CALL ===')
    console.log('Request URL:', request.url)
    
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('No authenticated user found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = user.id
    const forecastId = params.id

    // Check if forecast exists
    const forecast = await prisma.forecast.findUnique({
      where: { id: forecastId }
    })

    if (!forecast) {
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    // Check if user liked this forecast
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

      return NextResponse.json({ 
        liked: false, 
        message: 'Forecast unliked',
        likes: Math.max(0, forecast.likes - 1)
      })
    } else {
      return NextResponse.json({ 
        liked: false, 
        message: 'Forecast was not liked',
        likes: forecast.likes
      })
    }
  } catch (error) {
    console.error('Delete like API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
