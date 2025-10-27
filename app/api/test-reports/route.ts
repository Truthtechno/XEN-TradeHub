import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const copyTradingCount = await prisma.copyTradingSubscription.count()
    
    return NextResponse.json({
      success: true,
      message: 'Reports API is working!',
      data: {
        users: userCount,
        copyTrading: copyTradingCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
