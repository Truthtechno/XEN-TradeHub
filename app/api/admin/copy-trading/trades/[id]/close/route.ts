import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { exitPrice } = body

    if (!exitPrice) {
      return NextResponse.json({ error: 'Exit price required' }, { status: 400 })
    }

    // Get the trade
    const trade = await prisma.copyTrade.findUnique({
      where: { id: params.id },
      include: {
        platform: true,
        subscription: true
      }
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.status !== 'OPEN') {
      return NextResponse.json({ error: 'Trade is not open' }, { status: 400 })
    }

    // Calculate profit/loss
    const priceDiff = trade.action === 'BUY' 
      ? exitPrice - trade.entryPrice 
      : trade.entryPrice - exitPrice
    const profitLoss = priceDiff * trade.lotSize * 100000 // Standard lot calculation

    // Close the trade
    const closedTrade = await prisma.copyTrade.update({
      where: { id: params.id },
      data: {
        exitPrice,
        profitLoss,
        status: 'CLOSED',
        closedAt: new Date()
      }
    })

    // Update subscription stats if this is a mirrored trade
    if (trade.subscriptionId) {
      const subscription = await prisma.copyTradingSubscription.findUnique({
        where: { id: trade.subscriptionId }
      })

      if (subscription) {
        await prisma.copyTradingSubscription.update({
          where: { id: trade.subscriptionId },
          data: {
            currentProfit: subscription.currentProfit + profitLoss,
            totalProfit: profitLoss > 0 ? subscription.totalProfit + profitLoss : subscription.totalProfit,
            totalLoss: profitLoss < 0 ? subscription.totalLoss + Math.abs(profitLoss) : subscription.totalLoss,
            tradesCount: { increment: 1 },
            winningTrades: profitLoss > 0 ? { increment: 1 } : subscription.winningTrades,
            losingTrades: profitLoss < 0 ? { increment: 1 } : subscription.losingTrades
          }
        })

        // Create profit share if trade was profitable
        if (profitLoss > 0) {
          const profitShareAmount = profitLoss * (trade.platform.profitShareRate / 100)
          
          await prisma.profitShare.create({
            data: {
              platformId: trade.platformId,
              subscriptionId: trade.subscriptionId!,
              amount: profitShareAmount,
              percentage: trade.platform.profitShareRate,
              tradeProfit: profitLoss,
              status: 'PENDING'
            }
          })
        }
      }
    }

    // Platform stats are tracked via subscriptions and trades
    // No need to update platform directly

    return NextResponse.json({ success: true, trade: closedTrade })
  } catch (error) {
    console.error('Error closing trade:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
