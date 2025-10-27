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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status } = body

    // Verify subscription belongs to user
    const subscription = await prisma.copyTradingSubscription.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Update subscription status
    const updateData: any = { status }

    if (status === 'PAUSED') {
      updateData.pausedAt = new Date()
    } else if (status === 'ACTIVE') {
      updateData.pausedAt = null
    } else if (status === 'CANCELLED') {
      updateData.endDate = new Date()
    }

    const updated = await prisma.copyTradingSubscription.update({
      where: { id: params.id },
      data: updateData,
      include: {
        platform: true
      }
    })

    // Platform stats are tracked via subscriptions
    // No need to update platform directly

    return NextResponse.json({ success: true, subscription: updated })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify subscription belongs to user
    const subscription = await prisma.copyTradingSubscription.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Delete subscription
    await prisma.copyTradingSubscription.delete({
      where: { id: params.id }
    })

    // Platform stats are tracked via subscriptions
    // No need to update platform directly

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
