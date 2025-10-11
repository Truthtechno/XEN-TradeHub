import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/signals/[id]/comments - Get comments for a signal
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== GET SIGNAL COMMENTS ===')
    console.log('Signal ID:', params.id)

    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if signal exists
    const signal = await prisma.signal.findUnique({
      where: { id: params.id }
    })

    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    // Get comments with user information
    const comments = await prisma.userSignalComment.findMany({
      where: { signalId: params.id },
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
      orderBy: { createdAt: 'desc' }
    })

    console.log('Found comments:', comments.length)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching signal comments:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/signals/[id]/comments - Add a comment to a signal
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== POST SIGNAL COMMENT ===')
    console.log('Signal ID:', params.id)

    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    
    const commentSchema = z.object({
      content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long')
    })

    const validatedData = commentSchema.parse(body)

    // Check if signal exists
    const signal = await prisma.signal.findUnique({
      where: { id: params.id }
    })

    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    // Determine if user is admin
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    const isAdmin = adminRoles.includes(user.role)

    // Create comment
    const comment = await prisma.userSignalComment.create({
      data: {
        userId: user.id,
        signalId: params.id,
        content: validatedData.content,
        isAdmin
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

    // Increment comment count
    await prisma.signal.update({
      where: { id: params.id },
      data: { comments: { increment: 1 } }
    })

    console.log('Comment created successfully')
    return NextResponse.json({ 
      comment,
      message: 'Comment added successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Error creating signal comment:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
