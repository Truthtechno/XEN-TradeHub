import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUserSimple(request)
    
    if (!authUser || authUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { affiliateProgramId, amount, method, transactionId, notes } = body

    // Validate input
    if (!affiliateProgramId || !amount || !method || !transactionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get affiliate program
    const affiliateProgram = await prisma.affiliateProgram.findUnique({
      where: { id: affiliateProgramId }
    })

    if (!affiliateProgram) {
      return NextResponse.json({ error: 'Affiliate program not found' }, { status: 404 })
    }

    // Check if affiliate has enough pending earnings
    if (affiliateProgram.pendingEarnings < amount) {
      return NextResponse.json({ error: 'Insufficient pending earnings' }, { status: 400 })
    }

    // Create payout record
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateProgramId,
        amount,
        method,
        status: 'PAID',
        transactionId,
        notes,
        paidAt: new Date()
      }
    })

    // Update affiliate program earnings
    await prisma.affiliateProgram.update({
      where: { id: affiliateProgramId },
      data: {
        pendingEarnings: {
          decrement: amount
        },
        paidEarnings: {
          increment: amount
        }
      }
    })

    return NextResponse.json({ success: true, payout })
  } catch (error) {
    console.error('Error processing payout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
