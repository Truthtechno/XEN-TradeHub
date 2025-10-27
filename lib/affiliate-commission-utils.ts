import { prisma } from '@/lib/prisma'

interface CreateCommissionParams {
  userId: string
  amount: number
  type: 'ACADEMY' | 'COPY_TRADING' | 'BROKER_ACCOUNT' | 'SUBSCRIPTION' | 'OTHER'
  description: string
  requiresVerification?: boolean
  verificationData?: any
  relatedEntityType?: string
  relatedEntityId?: string
}

export async function createAffiliateCommission(params: CreateCommissionParams) {
  try {
    // Find user and their referral info
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        referredByCode: true
      }
    })

    if (!user || !user.referredByCode) {
      // User was not referred by anyone
      return null
    }

    // Find the affiliate program
    const affiliateProgram = await prisma.affiliateProgram.findUnique({
      where: { affiliateCode: user.referredByCode }
    })

    if (!affiliateProgram || !affiliateProgram.isActive) {
      return null
    }

    // Calculate commission amount
    const commissionAmount = params.amount * (affiliateProgram.commissionRate / 100)

    // Create commission
    const commission = await prisma.affiliateCommission.create({
      data: {
        affiliateProgramId: affiliateProgram.id,
        referredUserId: user.id,
        amount: commissionAmount,
        type: params.type,
        description: params.description,
        status: params.requiresVerification ? 'PENDING' : 'APPROVED',
        requiresVerification: params.requiresVerification || false,
        verificationData: params.verificationData || {},
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId
      }
    })

    // If auto-approved, update affiliate earnings immediately
    if (!params.requiresVerification) {
      await prisma.affiliateProgram.update({
        where: { id: affiliateProgram.id },
        data: {
          totalEarnings: {
            increment: commissionAmount
          },
          pendingEarnings: {
            increment: commissionAmount
          }
        }
      })

      // Mark referral as converted
      await prisma.affiliateReferral.updateMany({
        where: {
          affiliateProgramId: affiliateProgram.id,
          referredUserId: user.id,
          status: 'PENDING'
        },
        data: {
          status: 'CONVERTED',
          conversionDate: new Date()
        }
      })
    }

    return commission
  } catch (error) {
    console.error('Error creating affiliate commission:', error)
    return null
  }
}

export async function createAcademyCommission(userId: string, amount: number, classId: string) {
  return createAffiliateCommission({
    userId,
    amount,
    type: 'ACADEMY',
    description: `Academy class enrollment commission`,
    requiresVerification: false,
    relatedEntityType: 'ACADEMY_CLASS',
    relatedEntityId: classId
  })
}

export async function createCopyTradingCommission(
  userId: string,
  investmentAmount: number,
  subscriptionId: string
) {
  return createAffiliateCommission({
    userId,
    amount: investmentAmount,
    type: 'COPY_TRADING',
    description: `Copy trading subscription commission - $${investmentAmount.toFixed(2)} investment`,
    requiresVerification: true,
    verificationData: {
      investmentAmount,
      subscriptionId,
      requiresDepositVerification: true
    },
    relatedEntityType: 'COPY_TRADING_SUBSCRIPTION',
    relatedEntityId: subscriptionId
  })
}

export async function createBrokerAccountCommission(
  userId: string,
  depositAmount: number,
  accountOpeningId: string
) {
  return createAffiliateCommission({
    userId,
    amount: depositAmount,
    type: 'BROKER_ACCOUNT',
    description: `Broker account opening commission - $${depositAmount.toFixed(2)} deposit`,
    requiresVerification: true,
    verificationData: {
      depositAmount,
      accountOpeningId,
      requiresDepositVerification: true
    },
    relatedEntityType: 'BROKER_ACCOUNT_OPENING',
    relatedEntityId: accountOpeningId
  })
}

export async function createSubscriptionCommission(
  userId: string,
  amount: number,
  subscriptionId: string
) {
  return createAffiliateCommission({
    userId,
    amount,
    type: 'SUBSCRIPTION',
    description: `Premium subscription commission`,
    requiresVerification: false,
    relatedEntityType: 'SUBSCRIPTION',
    relatedEntityId: subscriptionId
  })
}
