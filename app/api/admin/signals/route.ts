import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







// GET /api/admin/signals - Get all signals with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Use simple authentication that works
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      console.log('Admin signals GET - No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      console.log('Admin signals GET - User role not authorized:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Admin signals GET - User authorized:', user.name, user.role)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    console.log('Admin signals GET - Query params:', { page, limit, search })
    const status = searchParams.get('status') || 'all'
    const visibility = searchParams.get('visibility') || 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { symbol: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status !== 'all') {
      where.status = status
    }
    
    if (visibility !== 'all') {
      where.visibility = visibility
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    console.log('Admin signals GET - About to query database...')
    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      prisma.signal.count({ where })
    ])

    console.log('Admin signals GET - Query completed, signals found:', signals.length)
    console.log('Admin signals GET - Total count:', total)

    return NextResponse.json({
      signals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching signals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/signals - Create a new signal
export async function POST(request: NextRequest) {
  try {
    // Use simple authentication that works
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      console.log('Admin signals POST - No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      console.log('Admin signals POST - User role not authorized:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Admin signals POST - User authorized:', user.name, user.role)

    const body = await request.json()
    
    const signalSchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      symbol: z.string().min(1),
      action: z.enum(['BUY', 'SELL']),
      entryPrice: z.number().positive(),
      stopLoss: z.number().positive(),
      takeProfit: z.number().positive(),
      notes: z.string().optional(),
      imageUrl: z.string().optional(),
      visibility: z.enum(['DRAFT', 'EVERYONE', 'PREMIUM']).default('DRAFT'),
      publishedAt: z.string().datetime().optional()
    })

    const validatedData = signalSchema.parse(body)

    // Create signal
    const signal = await prisma.signal.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        symbol: validatedData.symbol,
        action: validatedData.action,
        direction: validatedData.action,
        entry: validatedData.entryPrice,
        entryPrice: validatedData.entryPrice,
        sl: validatedData.stopLoss,
        stopLoss: validatedData.stopLoss,
        tp: validatedData.takeProfit,
        takeProfit: validatedData.takeProfit,
        notes: validatedData.notes,
        imageUrl: validatedData.imageUrl,
        visibility: validatedData.visibility === 'EVERYONE' ? 'PUBLIC' : 
                   validatedData.visibility === 'PREMIUM' ? 'SUBSCRIBERS_ONLY' : 'PRIVATE',
        publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : 
                    validatedData.visibility !== 'DRAFT' ? new Date() : null,
        status: validatedData.visibility === 'DRAFT' ? 'DRAFT' : 'ACTIVE'
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_SIGNAL',
        entity: 'Signal',
        entityId: signal.id,
        diff: {
          symbol: signal.symbol,
          direction: signal.direction,
          entry: signal.entry,
          sl: signal.sl,
          tp: signal.tp,
          visibility: signal.visibility
        }
      }
    })

    return NextResponse.json(signal, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating signal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
