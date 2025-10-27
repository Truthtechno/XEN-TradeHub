import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { approved, rejectionReason } = body

    const commission = await prisma.affiliateCommission.findUnique({
      where: { id: params.id },
      include: {
        affiliateProgram: true
      }
    })

    if (!commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    if (commission.status !== 'PENDING') {
      return NextResponse.json({ error: 'Commission already processed' }, { status: 400 })
    }

    // Update commission status
    const updatedCommission = await prisma.affiliateCommission.update({
      where: { id: params.id },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        verifiedAt: new Date(),
        verifiedBy: user.id,
        rejectionReason: approved ? null : rejectionReason
      }
    })

    // If approved, update affiliate earnings
    if (approved) {
      await prisma.affiliateProgram.update({
        where: { id: commission.affiliateProgramId },
        data: {
          totalEarnings: {
            increment: commission.amount
          },
          pendingEarnings: {
            increment: commission.amount
          }
        }
      })

      // Update referral status to CONVERTED if applicable
      if (commission.referredUserId) {
        await prisma.affiliateReferral.updateMany({
          where: {
            affiliateProgramId: commission.affiliateProgramId,
            referredUserId: commission.referredUserId,
            status: 'PENDING'
          },
          data: {
            status: 'CONVERTED',
            conversionDate: new Date()
          }
        })
      }
    }

    return NextResponse.json({ success: true, commission: updatedCommission })
  } catch (error) {
    console.error('Error verifying commission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
