import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN', 'ANALYST'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const traderId = searchParams.get('traderId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (traderId) where.platformId = traderId
    if (status) where.status = status

    const trades = await prisma.copyTrade.findMany({
      where,
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true
          }
        },
        subscription: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Calculate stats
    const totalTrades = trades.length
    const openTrades = trades.filter(t => t.status === 'OPEN').length
    const closedTrades = trades.filter(t => t.status === 'CLOSED').length
    const totalProfit = trades
      .filter(t => t.status === 'CLOSED')
      .reduce((sum, t) => sum + t.profitLoss, 0)
    const winningTrades = trades.filter(t => t.status === 'CLOSED' && t.profitLoss > 0).length
    const losingTrades = trades.filter(t => t.status === 'CLOSED' && t.profitLoss < 0).length

    return NextResponse.json({ 
      trades,
      stats: {
        totalTrades,
        openTrades,
        closedTrades,
        totalProfit,
        winningTrades,
        losingTrades,
        winRate: closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0
      }
    })
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { platformId, symbol, action, entryPrice, lotSize, notes } = body

    if (!platformId || !symbol || !action || !entryPrice || !lotSize) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create trade for platform
    const trade = await prisma.copyTrade.create({
      data: {
        platformId,
        symbol,
        action,
        entryPrice,
        lotSize,
        notes,
        status: 'OPEN'
      }
    })

    // Mirror trade to all active subscriptions
    const subscriptions = await prisma.copyTradingSubscription.findMany({
      where: {
        platformId,
        status: 'ACTIVE'
      }
    })

    for (const sub of subscriptions) {
      await prisma.copyTrade.create({
        data: {
          platformId,
          subscriptionId: sub.id,
          symbol,
          action,
          entryPrice,
          lotSize: lotSize * sub.copyRatio,
          notes: `Mirrored from ${trade.id}`,
          status: 'OPEN'
        }
      })
    }

    return NextResponse.json({ success: true, trade })
  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
