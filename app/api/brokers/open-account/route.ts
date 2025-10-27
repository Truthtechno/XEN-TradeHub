import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { notifyBrokerAccountOpening } from '@/lib/admin-notification-utils'
import { createBrokerAccountCommission } from '@/lib/affiliate-commission-utils'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { brokerId, fullName, email, phone, accountId } = body

    if (!brokerId || !fullName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify broker exists
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId }
    })

    if (!broker) {
      return NextResponse.json({ error: 'Broker not found' }, { status: 404 })
    }

    // Create account opening request
    const accountOpening = await prisma.brokerAccountOpening.create({
      data: {
        brokerId,
        userId: user.id,
        fullName,
        email,
        phone,
        accountId,
        status: 'PENDING'
      }
    })

    // Notify admins about new broker account opening
    await notifyBrokerAccountOpening(
      fullName,
      email,
      broker.name,
      `/admin/brokers`
    )

    // Create affiliate commission if user was referred
    // Note: Broker commissions require deposit verification by admin
    // Default deposit amount is 0, admin will update after verification
    await createBrokerAccountCommission(
      user.id,
      0, // Will be updated by admin after deposit verification
      accountOpening.id
    )

    return NextResponse.json({ success: true, accountOpening })
  } catch (error) {
    console.error('Error creating account opening:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
