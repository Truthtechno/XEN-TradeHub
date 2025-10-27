import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { notifyNewMasterTrader } from '@/lib/user-notification-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN', 'ANALYST'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const platforms = await prisma.copyTradingPlatform.findMany({
      include: {
        _count: {
          select: { subscriptions: true }
        }
      },
      orderBy: { displayOrder: 'asc' }
    })

    return NextResponse.json({ platforms })
  } catch (error) {
    console.error('Error fetching traders:', error)
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
    const { 
      name, 
      slug, 
      description, 
      logoUrl, 
      copyTradingLink,
      profitPercentage, 
      profitShareRate,
      riskLevel, 
      minInvestment, 
      strategy, 
      roi,
      winRate,
      maxDrawdown,
      isActive, 
      displayOrder,
      notes
    } = body

    if (!name || !slug || !copyTradingLink || !minInvestment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const platform = await prisma.copyTradingPlatform.create({
      data: {
        name,
        slug,
        description,
        logoUrl,
        copyTradingLink,
        profitPercentage: profitPercentage || 0,
        profitShareRate: profitShareRate || 20,
        riskLevel: riskLevel || 'MEDIUM',
        minInvestment,
        strategy,
        roi: roi || 0,
        winRate: winRate || 0,
        maxDrawdown: maxDrawdown || 0,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder || 0,
        notes
      }
    })

    // Notify all users about new copy trading platform
    if (platform.isActive) {
      await notifyNewMasterTrader(
        platform.name,
        `${platform.profitPercentage}% profit | ${platform.riskLevel} risk`,
        `/copy-trading`
      )
    }

    return NextResponse.json({ platform })
  } catch (error) {
    console.error('Error creating trader:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
