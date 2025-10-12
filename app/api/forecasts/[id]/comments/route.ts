import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/forecasts/[id]/comments - Get comments for a forecast or signal
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== GET COMMENTS API CALL ===')
    console.log('Request URL:', request.url)
    
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('No authenticated user found for comments')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    console.log('Authenticated user:', user)

    const itemId = params.id
    console.log('Item ID for comments:', itemId)

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
        console.log('Item not found for comments:', itemId)
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }
    }

    // Fetch comments (newest first, so newest appears at bottom when displayed)
    let comments: any[] = []
    
    if (isForecast) {
      comments = await prisma.userForecastComment.findMany({
        where: { forecastId: itemId },
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
        orderBy: { createdAt: 'desc' } // Newest first, frontend will display newest at bottom
      })
    } else {
      comments = await prisma.userSignalComment.findMany({
        where: { signalId: itemId },
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
        orderBy: { createdAt: 'desc' } // Newest first, frontend will display newest at bottom
      })
    }

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

// POST /api/forecasts/[id]/comments - Add a comment to a forecast
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== POST COMMENT API CALL ===')
    console.log('Request URL:', request.url)
    
    // Simplified authentication - use a consistent fallback user for testing
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
    
    console.log('Authenticated user:', user)

    const itemId = params.id
    const body = await request.json()
    const { content, isAdmin = false, userInfo = null } = body

    console.log('Comment data:', { itemId, content, isAdmin, userInfo })

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    // If userInfo is provided from frontend, use it instead of authentication
    if (userInfo && userInfo.email) {
      console.log('Using user info from frontend:', userInfo)
      
      // Find the user in database
      const dbUser = await prisma.user.findUnique({
        where: { email: userInfo.email },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })
      
      if (dbUser) {
        console.log('Found user in database:', dbUser.name)
        user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role
        }
      } else {
        console.log('User not found in database, creating new user')
        // Create the user if they don't exist
        const newUser = await prisma.user.create({
          data: {
            name: userInfo.name || 'User',
            email: userInfo.email,
            role: userInfo.role || 'STUDENT'
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        })
        
        user = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
        console.log('Created new user:', newUser.name)
      }
    }

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
        console.log('Item not found for comment:', itemId)
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }
    }

    const item = isForecast ? forecast : signal
    if (item) {
      console.log('Item found:', item.title, 'Type:', isForecast ? 'forecast' : 'signal')
    }

    // Determine if this is an admin comment
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    const userRole = (user as any).role || 'STUDENT'
    let isAdminComment = adminRoles.includes(userRole) || isAdmin
    
    console.log('User role:', userRole)
    console.log('Is admin comment:', isAdminComment)
    
    // If user wants to comment as regular user, override admin status
    if (!isAdmin && adminRoles.includes(userRole)) {
      console.log('User wants to comment as regular user, overriding admin status')
      // Get a random regular user for this comment
      const regularUsers = await prisma.user.findMany({
        where: {
          role: {
            in: ['STUDENT', 'USER']
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })
      
      if (regularUsers.length > 0) {
        const randomUser = regularUsers[Math.floor(Math.random() * regularUsers.length)]
        console.log('Using random regular user for comment:', randomUser.name)
        user = {
          id: randomUser.id,
          name: randomUser.name,
          email: randomUser.email,
          role: randomUser.role
        }
        isAdminComment = false
      }
    }
    
    console.log('Creating comment...')
    console.log('User role:', (user as any).role)
    console.log('Is admin comment:', isAdminComment)
    
    let comment: any = null
    
    if (isForecast) {
      comment = await prisma.userForecastComment.create({
        data: {
          userId: (user as any).id || 'anonymous',
          forecastId: itemId,
          content: content.trim(),
          isAdmin: isAdminComment
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
    } else {
      comment = await prisma.userSignalComment.create({
        data: {
          userId: (user as any).id || 'anonymous',
          signalId: itemId,
          content: content.trim(),
          isAdmin: isAdminComment
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
    }

    console.log('Comment created:', comment.id)

    // Update item comment count
    if (isForecast) {
      await prisma.forecast.update({
        where: { id: itemId },
        data: {
          comments: {
            increment: 1
          }
        }
      })
    } else {
      await prisma.signal.update({
        where: { id: itemId },
        data: {
          comments: {
            increment: 1
          }
        }
      })
    }

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
