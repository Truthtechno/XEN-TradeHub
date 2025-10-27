import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUserSimple(request)
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id }
    })

    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get account opening details
    const accountOpening = await prisma.brokerAccountOpening.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            referredByCode: true
          }
        }
      }
    })

    if (!accountOpening) {
      return NextResponse.json({ error: 'Account opening not found' }, { status: 404 })
    }

    const oldStatus = accountOpening.status

    // Update account opening status
    const updatedAccountOpening = await prisma.brokerAccountOpening.update({
      where: { id: params.id },
      data: { status }
    })

    // If status changed from PENDING to APPROVED, create commission (pending deposit verification)
    // Note: For broker accounts, commission is created with $0 amount initially
    // Admin must later update the commission with actual deposit amount
    if (oldStatus === 'PENDING' && status === 'APPROVED') {
      console.log(`✅ Broker account approved - Commission will be created when deposit is verified`)
      
      // Check if user was referred
      if (accountOpening.user.referredByCode) {
        // Find affiliate program
        const affiliateProgram = await prisma.affiliateProgram.findUnique({
          where: { affiliateCode: accountOpening.user.referredByCode }
        })

        if (affiliateProgram && affiliateProgram.isActive) {
          // Check if commission already exists
          const existingCommission = await prisma.affiliateCommission.findFirst({
            where: {
              affiliateProgramId: affiliateProgram.id,
              referredUserId: accountOpening.user.id,
              relatedEntityId: accountOpening.id,
              type: 'BROKER_ACCOUNT'
            }
          })

          if (!existingCommission) {
            // Create commission with $0 amount (to be updated after deposit verification)
            await prisma.affiliateCommission.create({
              data: {
                affiliateProgramId: affiliateProgram.id,
                referredUserId: accountOpening.user.id,
                amount: 0, // Will be updated by admin after deposit verification
                type: 'BROKER_ACCOUNT',
                description: `Broker account opening commission - Pending deposit verification`,
                status: 'PENDING',
                requiresVerification: true,
                verificationData: {
                  accountOpeningId: accountOpening.id,
                  requiresDepositVerification: true,
                  note: 'Admin must verify deposit and update commission amount'
                },
                relatedEntityType: 'BROKER_ACCOUNT_OPENING',
                relatedEntityId: accountOpening.id
              }
            })

            console.log(`✅ Broker commission created (pending deposit verification)`)
          }
        }
      }
    }

    return NextResponse.json({ success: true, accountOpening: updatedAccountOpening })
  } catch (error) {
    console.error('Error updating account opening status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
