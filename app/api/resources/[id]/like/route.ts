import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/resources/[id]/like - Like/unlike a resource
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== RESOURCE LIKE API CALL ===')
    console.log('Request URL:', request.url)
    
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('No authenticated user found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    console.log('Authenticated user:', user)

    const userId = user.id
    const resourceId = params.id
    console.log('User ID:', userId, 'Resource ID:', resourceId)

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    })

    if (!resource) {
      console.log('Resource not found:', resourceId)
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    console.log('Resource found:', resource.title)

    // Check if user already liked this resource
    const existingLike = await prisma.userResourceLike.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId
        }
      }
    })

    console.log('Existing like:', existingLike)

    if (existingLike) {
      // Unlike the resource
      console.log('Removing like...')
      await prisma.userResourceLike.delete({
        where: {
          userId_resourceId: {
            userId,
            resourceId
          }
        }
      })

      // Decrement like count
      await prisma.resource.update({
        where: { id: resourceId },
        data: { likes: { decrement: 1 } }
      })

      console.log('Like removed successfully')
      return NextResponse.json({ 
        liked: false, 
        message: 'Resource unliked',
        likes: resource.likes - 1
      })
    } else {
      // Like the resource
      console.log('Adding like...')
      await prisma.userResourceLike.create({
        data: {
          userId,
          resourceId
        }
      })

      // Increment like count
      await prisma.resource.update({
        where: { id: resourceId },
        data: { likes: { increment: 1 } }
      })

      console.log('Like added successfully')
      return NextResponse.json({ 
        liked: true, 
        message: 'Resource liked',
        likes: resource.likes + 1
      })
    }
  } catch (error) {
    console.error('Resource like API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
