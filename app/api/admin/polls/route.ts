import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







// GET /api/admin/polls - Get all polls with pagination and filtering
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const pair = searchParams.get('pair') || 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { pair: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status !== 'all') {
      where.status = status
    }
    
    if (pair !== 'all') {
      where.pair = pair
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [polls, total] = await Promise.all([
      prisma.poll.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          votes: {
            select: {
              id: true,
              option: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              createdAt: true
            }
          },
          _count: {
            select: {
              votes: true
            }
          }
        }
      }),
      prisma.poll.count({ where })
    ])

    return NextResponse.json({
      polls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/polls - Create a new poll
export async function POST(request: NextRequest) {
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
      question: z.string().min(1),
      options: z.array(z.string()),
      isActive: z.boolean().default(true)
    })

    const validatedData = pollSchema.parse(body)

    // Create poll
    const poll = await prisma.poll.create({
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
        action: 'CREATE_POLL',
        entity: 'Poll',
        entityId: poll.id,
        diff: {
          question: poll.question,
          options: poll.options,
          isActive: poll.isActive
        }
      }
    })

    return NextResponse.json(poll, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
