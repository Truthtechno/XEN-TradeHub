import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const platforms = await prisma.copyTradingPlatform.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    })

    return NextResponse.json({ platforms })
  } catch (error) {
    console.error('Error fetching traders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
