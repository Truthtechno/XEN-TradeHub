import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUserSimple(request)
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const subscriptions = await prisma.copyTradingSubscription.findMany({
      where: { userId: user.id },
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            description: true,
            profitPercentage: true,
            profitShareRate: true,
            riskLevel: true,
            roi: true,
            winRate: true,
            maxDrawdown: true
          }
        },
        trades: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        profitShares: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate overall stats
    const totalInvestment = subscriptions.reduce((sum, sub) => sum + sub.investmentUSD, 0)
    const totalProfit = subscriptions.reduce((sum, sub) => sum + sub.currentProfit, 0)
    const totalTrades = subscriptions.reduce((sum, sub) => sum + sub.tradesCount, 0)
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'ACTIVE').length

    return NextResponse.json({ 
      subscriptions,
      stats: {
        totalInvestment,
        totalProfit,
        totalTrades,
        activeSubscriptions,
        profitPercentage: totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0
      }
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
