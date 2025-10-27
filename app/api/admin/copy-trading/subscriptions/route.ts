import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN', 'ANALYST', 'SUPPORT'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const subscriptions = await prisma.copyTradingSubscription.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        platform: {
          select: { name: true }
        }
      },
      orderBy: { startDate: 'desc' }
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
