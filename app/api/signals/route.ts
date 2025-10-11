import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







export async function GET(request: NextRequest) {
  try {
    console.log('=== SIGNALS API GET ===')
    const user = await getAuthenticatedUserSimple(request)
    console.log('User authenticated:', !!user)
    
    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') || 'all'

    // Build where clause based on user role and status
    let whereClause: any = {}
    console.log('Building where clause...')
    
    if (status !== 'all') {
      whereClause.status = status
    }

    // If user is not admin, only show public signals
    if (!['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR'].includes(user.role)) {
      whereClause.visibility = 'PUBLIC'
    }
    
    console.log('Where clause:', whereClause)

    console.log('Querying signals...')
    const signals = await prisma.signal.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })
    console.log('Signals found:', signals.length)

    const total = await prisma.signal.count({ where: whereClause })
    console.log('Total signals:', total)

    return NextResponse.json({
      success: true,
      signals: signals.map(signal => ({
        id: signal.id,
        title: signal.title,
        symbol: signal.symbol,
        action: signal.action,
        direction: signal.direction,
        entry: signal.entry || signal.entryPrice,
        stopLoss: signal.sl || signal.stopLoss,
        takeProfit: signal.tp || signal.takeProfit,
        notes: signal.notes,
        visibility: signal.visibility,
        status: signal.publishedAt ? 'ACTIVE' : 'DRAFT',
        likes: 0,
        comments: 0,
        createdAt: signal.createdAt,
        updatedAt: signal.updatedAt
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching signals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { symbol, direction, entry, stopLoss, takeProfit, notes, visibility } = body

    // Validate required fields
    if (!symbol || !direction || !entry) {
      return NextResponse.json(
        { error: 'Symbol, direction, and entry are required' },
        { status: 400 }
      )
    }

    const signal = await prisma.signal.create({
      data: {
        title: `${symbol} ${direction} Signal`,
        symbol,
        action: direction,
        direction,
        entry: parseFloat(entry),
        entryPrice: parseFloat(entry),
        sl: stopLoss ? parseFloat(stopLoss) : null,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        tp: takeProfit ? parseFloat(takeProfit) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        notes,
        visibility: visibility || 'PUBLIC',
        publishedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      signal: {
        id: signal.id,
        title: signal.title,
        symbol: signal.symbol,
        action: signal.action,
        direction: signal.direction,
        entry: signal.entry,
        stopLoss: signal.sl,
        takeProfit: signal.tp,
        notes: signal.notes,
        visibility: signal.visibility,
        status: signal.publishedAt ? 'ACTIVE' : 'DRAFT',
        createdAt: signal.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating signal:', error)
    return NextResponse.json(
      { error: 'Failed to create signal' },
      { status: 500 }
    )
  }
}
