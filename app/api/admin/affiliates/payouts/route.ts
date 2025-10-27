import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payouts = await prisma.affiliatePayout.findMany({
      include: {
        affiliateProgram: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    console.error('Error fetching payouts:', error)
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
    const { affiliateId, amount, method, notes } = body

    if (!affiliateId || !amount || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create payout (don't decrement pendingEarnings yet - that happens when status becomes COMPLETED)
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateProgramId: affiliateId,
        amount,
        method,
        notes,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ payout })
  } catch (error) {
    console.error('Error creating payout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
