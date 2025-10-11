import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple, createAuthResponse } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

// GET /api/forecasts/[id]/comments - Get comments for a forecast (Simple version)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== SIMPLE GET COMMENTS API CALL ===')
    console.log('Request URL:', request.url)
    
    // Get authenticated user (simple version)
    const user = await getAuthenticatedUserSimple(request)
    console.log('Simple authenticated user for comments:', user)
    
    if (!user) {
      console.log('No authenticated user found for comments')
      return createAuthResponse('Authentication required')
    }

    const forecastId = params.id
    console.log('Forecast ID for comments:', forecastId)

    // Verify forecast exists
    const forecast = await prisma.forecast.findUnique({
      where: { id: forecastId }
    })

    if (!forecast) {
      console.log('Forecast not found for comments:', forecastId)
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    // Fetch comments
    const comments = await prisma.userForecastComment.findMany({
      where: { forecastId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log('Comments fetched:', comments.length)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/forecasts/[id]/comments - Add a comment to a forecast (Simple version)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== SIMPLE POST COMMENT API CALL ===')
    console.log('Request URL:', request.url)
    
    // Get authenticated user (simple version)
    const user = await getAuthenticatedUserSimple(request)
    console.log('Simple authenticated user for comment:', user)
    
    if (!user) {
      console.log('No authenticated user found for comment')
      return createAuthResponse('Authentication required')
    }

    const forecastId = params.id
    const body = await request.json()
    const { content, isAdmin = false } = body

    console.log('Comment data:', { forecastId, content, isAdmin })

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    // Verify forecast exists
    const forecast = await prisma.forecast.findUnique({
      where: { id: forecastId }
    })

    if (!forecast) {
      console.log('Forecast not found for comment:', forecastId)
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    // Create comment
    console.log('Creating comment...')
    const comment = await prisma.userForecastComment.create({
      data: {
        userId: user.id,
        forecastId,
        content: content.trim(),
        isAdmin: isAdmin || user.role === 'SUPERADMIN' || user.role === 'ADMIN'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    console.log('Comment created:', comment.id)

    // Update forecast comment count
    await prisma.forecast.update({
      where: { id: forecastId },
      data: {}
    })

    console.log('Comment count updated')
    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
