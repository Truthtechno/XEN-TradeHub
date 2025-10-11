import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'





import { z } from 'zod'



// GET /api/admin/polls/[id] - Get poll by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const poll = await prisma.poll.findUnique({
      where: { id: params.id },
      include: {
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/polls/[id] - Update poll
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
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const pollSchema = z.object({
      question: z.string().min(1).optional(),
      options: z.array(z.string()).optional(),
      isActive: z.boolean().optional()
    })

    const validatedData = pollSchema.parse(body)

    // Get current poll data for audit log
    const currentPoll = await prisma.poll.findUnique({
      where: { id: params.id }
    })

    if (!currentPoll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Update poll
    const updatedPoll = await prisma.poll.update({
      where: { id: params.id },
      data: {
        question: validatedData.question,
        options: validatedData.options,
        isActive: validatedData.isActive
      },
      include: {
        _count: {
          select: {
            votes: true
          }
        }
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: 'UPDATE_POLL',
        entity: 'Poll',
        entityId: params.id,
        diff: {
          before: {
            question: currentPoll.question,
            options: currentPoll.options,
            isActive: currentPoll.isActive
          },
          after: {
            question: updatedPoll.question,
            options: updatedPoll.options,
            isActive: updatedPoll.isActive
          }
        }
      }
    })

    return NextResponse.json(updatedPoll)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error updating poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/polls/[id] - Delete poll
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if poll exists
    const poll = await prisma.poll.findUnique({
      where: { id: params.id }
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Delete poll (this will also delete related votes due to cascade)
    await prisma.poll.delete({
      where: { id: params.id }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: 'DELETE_POLL',
        entity: 'Poll',
        entityId: params.id,
        diff: {
          question: poll.question,
          options: poll.options,
          isActive: poll.isActive
        }
      }
    })

    return NextResponse.json({ message: 'Poll deleted successfully' })
  } catch (error) {
    console.error('Error deleting poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
