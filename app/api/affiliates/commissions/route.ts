import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        affiliateProgram: true
      }
    })

    if (!user?.affiliateProgram) {
      return NextResponse.json({ error: 'Not registered as affiliate' }, { status: 404 })
    }

    const commissions = await prisma.affiliateCommission.findMany({
      where: {
        affiliateProgramId: user.affiliateProgram.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ commissions })
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      affiliateCode,
      referredUserId,
      amount,
      type,
      description,
      requiresVerification,
      verificationData,
      relatedEntityType,
      relatedEntityId
    } = body

    // Find affiliate program
    const affiliateProgram = await prisma.affiliateProgram.findUnique({
      where: { affiliateCode }
    })

    if (!affiliateProgram) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
    }

    // Create commission
    const commission = await prisma.affiliateCommission.create({
      data: {
        affiliateProgramId: affiliateProgram.id,
        referredUserId,
        amount,
        type,
        description,
        status: requiresVerification ? 'PENDING' : 'APPROVED',
        requiresVerification: requiresVerification || false,
        verificationData: verificationData || {},
        relatedEntityType,
        relatedEntityId
      }
    })

    // Update affiliate earnings if auto-approved
    if (!requiresVerification) {
      await prisma.affiliateProgram.update({
        where: { id: affiliateProgram.id },
        data: {
          totalEarnings: {
            increment: amount
          },
          pendingEarnings: {
            increment: amount
          }
        }
      })
    }

    return NextResponse.json({ success: true, commission })
  } catch (error) {
    console.error('Error creating commission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
