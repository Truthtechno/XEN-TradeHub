import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        affiliateProgram: true
      }
    })

    if (!user?.affiliateProgram) {
      return NextResponse.json({ error: 'Not registered as affiliate' }, { status: 404 })
    }

    // Validate amount
    if (amount < 50) {
      return NextResponse.json({ error: 'Minimum payout amount is $50' }, { status: 400 })
    }

    if (amount > user.affiliateProgram.pendingEarnings) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Create payout request
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateProgramId: user.affiliateProgram.id,
        amount,
        method: user.affiliateProgram.paymentMethod || 'BANK_TRANSFER',
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, payout })
  } catch (error) {
    console.error('Error requesting payout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
