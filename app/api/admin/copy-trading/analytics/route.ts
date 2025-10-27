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

    // Get overall stats
    const totalTraders = await prisma.copyTradingPlatform.count()
    const activeTraders = await prisma.copyTradingPlatform.count({ where: { isActive: true } })
    const totalSubscriptions = await prisma.copyTradingSubscription.count()
    const activeSubscriptions = await prisma.copyTradingSubscription.count({ 
      where: { status: 'ACTIVE' } 
    })

    // Get subscription stats
    const subscriptions = await prisma.copyTradingSubscription.findMany({
      where: { status: 'ACTIVE' },
      select: {
        investmentUSD: true,
        currentProfit: true,
        totalProfit: true,
        totalLoss: true
      }
    })

    const totalInvestment = subscriptions.reduce((sum, sub) => sum + sub.investmentUSD, 0)
    const totalProfit = subscriptions.reduce((sum, sub) => sum + sub.currentProfit, 0)
    const totalProfitEarned = subscriptions.reduce((sum, sub) => sum + sub.totalProfit, 0)
    const totalLoss = subscriptions.reduce((sum, sub) => sum + sub.totalLoss, 0)

    // Get trade stats
    const totalTrades = await prisma.copyTrade.count()
    const openTrades = await prisma.copyTrade.count({ where: { status: 'OPEN' } })
    const closedTrades = await prisma.copyTrade.count({ where: { status: 'CLOSED' } })

    const trades = await prisma.copyTrade.findMany({
      where: { status: 'CLOSED' },
      select: { profitLoss: true }
    })

    const winningTrades = trades.filter(t => t.profitLoss > 0).length
    const losingTrades = trades.filter(t => t.profitLoss < 0).length
    const totalTradeProfit = trades.reduce((sum, t) => sum + t.profitLoss, 0)

    // Get profit share stats
    const profitShares = await prisma.profitShare.findMany({
      select: {
        amount: true,
        status: true
      }
    })

    const totalProfitShares = profitShares.reduce((sum, ps) => sum + ps.amount, 0)
    const pendingProfitShares = profitShares
      .filter(ps => ps.status === 'PENDING')
      .reduce((sum, ps) => sum + ps.amount, 0)
    const paidProfitShares = profitShares
      .filter(ps => ps.status === 'PAID')
      .reduce((sum, ps) => sum + ps.amount, 0)

    // Get top platforms
    const topTraders = await prisma.copyTradingPlatform.findMany({
      where: { isActive: true },
      orderBy: { roi: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        profitPercentage: true,
        roi: true,
        winRate: true
      }
    })

    // Get recent subscriptions
    const recentSubscriptions = await prisma.copyTradingSubscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        platform: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      overview: {
        totalTraders,
        activeTraders,
        totalSubscriptions,
        activeSubscriptions,
        totalInvestment,
        totalProfit,
        totalProfitEarned,
        totalLoss,
        profitPercentage: totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0
      },
      trades: {
        totalTrades,
        openTrades,
        closedTrades,
        winningTrades,
        losingTrades,
        totalTradeProfit,
        winRate: closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0
      },
      profitShares: {
        total: totalProfitShares,
        pending: pendingProfitShares,
        paid: paidProfitShares
      },
      topTraders,
      recentSubscriptions
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
