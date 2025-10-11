import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'





import { z } from 'zod'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'



// GET /api/forecasts/[id] - Get forecast by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const forecast = await prisma.forecast.findUnique({
      where: { id: params.id },
      include: {
        userLikes: session?.user ? {
          where: { userId: (session.user as any).id },
          select: { id: true }
        } : false,
        userComments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            userLikes: true,
            userComments: true
          }
        }
      }
    })

    if (!forecast) {
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    // Check if user has access to premium forecast
    if (!forecast.isPublic) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: (session.user as any).id,
          status: 'ACTIVE'
        }
      })

      if (!subscription) {
        return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
      }
    }

    // Increment view count
    // Note: Forecast model doesn't have views field, so we skip view tracking

    // Transform the data
    const transformedForecast = {
      ...forecast,
      isLiked: forecast.userLikes && forecast.userLikes.length > 0,
      likes: forecast._count.userLikes,
      comments: forecast._count.userComments,
      userLikes: undefined,
      _count: undefined
    }

    return NextResponse.json(transformedForecast)
  } catch (error) {
    console.error('Error fetching forecast:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/forecasts/[id] - Update forecast visibility (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use simple authentication that works
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('PATCH forecast - No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      console.log('PATCH forecast - User role not authorized:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('PATCH forecast - User authorized:', user.name, user.role)

    const body = await request.json()
    const { isPublic } = body

    // Check if forecast exists
    const existingForecast = await prisma.forecast.findUnique({
      where: { id: params.id }
    })

    if (!existingForecast) {
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    // Update the forecast visibility
    const updatedForecast = await prisma.forecast.update({
      where: { id: params.id },
      data: { isPublic },
      include: {
        _count: {
          select: {
            userLikes: true,
            userComments: true
          }
        }
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'UPDATE_FORECAST',
        entity: 'Forecast',
        entityId: updatedForecast.id,
        diff: {
          title: updatedForecast.title,
          isPublic: updatedForecast.isPublic
        }
      }
    })

    return NextResponse.json(updatedForecast)
  } catch (error) {
    console.error('Error updating forecast visibility:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/forecasts/[id] - Update forecast (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const forecastSchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      pair: z.string().optional(),
      chartImage: z.string().url().optional(),
      isPublic: z.boolean().optional()
    })

    const validatedData = forecastSchema.parse(body)

    // Get current forecast for audit log
    const currentForecast = await prisma.forecast.findUnique({
      where: { id: params.id }
    })

    if (!currentForecast) {
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    const updatedForecast = await prisma.forecast.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            userLikes: true,
            userComments: true
          }
        }
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: 'UPDATE_FORECAST',
        entity: 'Forecast',
        entityId: updatedForecast.id,
        diff: {
          title: updatedForecast.title,
          isPublic: updatedForecast.isPublic
        }
      }
    })

    return NextResponse.json(updatedForecast)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error updating forecast:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/forecasts/[id] - Delete forecast (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use simple authentication that works
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('DELETE forecast - No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      console.log('DELETE forecast - User role not authorized:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('DELETE forecast - User authorized:', user.name, user.role)

    const forecast = await prisma.forecast.findUnique({
      where: { id: params.id }
    })

    if (!forecast) {
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    await prisma.forecast.delete({
      where: { id: params.id }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'DELETE_FORECAST',
        entity: 'Forecast',
        entityId: params.id,
        diff: {
          title: forecast.title
        }
      }
    })

    return NextResponse.json({ message: 'Forecast deleted successfully' })
  } catch (error) {
    console.error('Error deleting forecast:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
