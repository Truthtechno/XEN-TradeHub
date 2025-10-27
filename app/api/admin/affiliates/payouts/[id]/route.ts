import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function PATCH(
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
    const { status, transactionId, paidAt } = body

    console.log('📝 Updating payout:', { id: params.id, status, transactionId, paidAt })

    // Get the payout to check current status
    const currentPayout = await prisma.affiliatePayout.findUnique({
      where: { id: params.id }
    })

    if (!currentPayout) {
      console.error('❌ Payout not found:', params.id)
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    console.log('✅ Current payout:', { id: currentPayout.id, status: currentPayout.status, amount: currentPayout.amount })

    // Use transaction to ensure all updates happen together
    const result = await prisma.$transaction(async (tx) => {
      // Update payout
      const payout = await tx.affiliatePayout.update({
        where: { id: params.id },
        data: {
          status,
          transactionId,
          paidAt: paidAt ? new Date(paidAt) : undefined
        }
      })

      // If status changed to COMPLETED, update affiliate's paid earnings and decrease pending
      if (status === 'COMPLETED' && currentPayout.status !== 'COMPLETED') {
        console.log('💰 Marking payout as completed, updating affiliate earnings...')
        
        // Get current affiliate data to ensure pendingEarnings doesn't go negative
        const affiliate = await tx.affiliateProgram.findUnique({
          where: { id: currentPayout.affiliateProgramId },
          select: { pendingEarnings: true }
        })

        // Calculate new pending earnings (ensure it doesn't go below 0)
        const newPendingEarnings = Math.max(0, (affiliate?.pendingEarnings || 0) - currentPayout.amount)
        
        await tx.affiliateProgram.update({
          where: { id: currentPayout.affiliateProgramId },
          data: {
            paidEarnings: {
              increment: currentPayout.amount
            },
            pendingEarnings: newPendingEarnings
          }
        })
      }

      // If status changed to FAILED, return amount to pending
      if (status === 'FAILED' && currentPayout.status === 'PENDING') {
        console.log('❌ Marking payout as failed, returning to pending...')
        await tx.affiliateProgram.update({
          where: { id: currentPayout.affiliateProgramId },
          data: {
            pendingEarnings: {
              increment: currentPayout.amount
            }
          }
        })
      }

      return payout
    })

    console.log('✅ Payout updated successfully:', result.id)
    return NextResponse.json({ payout: result })
  } catch (error) {
    console.error('❌ Error updating payout:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
