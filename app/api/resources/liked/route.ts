import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/resources/liked - Get user's liked resources
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        likedResourceIds: [],
        message: 'Authentication required' 
      }, { status: 401 })
    }

    // Get all liked resources for this user
    const likedResources = await prisma.userResourceLike.findMany({
      where: {
        userId: user.id
      },
      select: {
        resourceId: true
      }
    })

    const likedResourceIds = likedResources.map(like => like.resourceId)

    return NextResponse.json({ 
      likedResourceIds,
      count: likedResourceIds.length
    })

  } catch (error) {
    console.error('Error fetching liked resources:', error)
    return NextResponse.json({ 
      likedResourceIds: [],
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
