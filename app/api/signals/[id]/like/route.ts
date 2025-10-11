import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/signals/[id]/like - Like/unlike a signal
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== SIGNAL LIKE API CALL ===')
    console.log('Request URL:', request.url)
    
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('No authenticated user found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    console.log('Authenticated user:', user)

    const userId = user.id
    const signalId = params.id
    console.log('User ID:', userId, 'Signal ID:', signalId)

    // Check if signal exists
    const signal = await prisma.signal.findUnique({
      where: { id: signalId }
    })

    if (!signal) {
      console.log('Signal not found:', signalId)
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    console.log('Signal found:', signal.title)

    // Check if user already liked this signal
    const existingLike = await prisma.userSignalLike.findUnique({
      where: {
        userId_signalId: {
          userId,
          signalId
        }
      }
    })

    console.log('Existing like:', existingLike)

    if (existingLike) {
      // Unlike the signal
      console.log('Removing like...')
      await prisma.userSignalLike.delete({
        where: {
          userId_signalId: {
            userId,
            signalId
          }
        }
      })

      // Decrement like count
      await prisma.signal.update({
        where: { id: signalId },
        data: { likes: { decrement: 1 } }
      })

      console.log('Like removed successfully')
      return NextResponse.json({ 
        liked: false, 
        message: 'Signal unliked',
        likes: signal.likes - 1
      })
    } else {
      // Like the signal
      console.log('Adding like...')
      await prisma.userSignalLike.create({
        data: {
          userId,
          signalId
        }
      })

      // Increment like count
      await prisma.signal.update({
        where: { id: signalId },
        data: { likes: { increment: 1 } }
      })

      console.log('Like added successfully')
      return NextResponse.json({ 
        liked: true, 
        message: 'Signal liked',
        likes: signal.likes + 1
      })
    }
  } catch (error) {
    console.error('Signal like API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
