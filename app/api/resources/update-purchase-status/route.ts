import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { resourceId, paymentIntentId, status } = body
    
    if (!resourceId || !status) {
      return NextResponse.json({ 
        success: false,
        message: 'Resource ID and status required' 
      }, { status: 400 })
    }

    // Find the purchase record
    const purchase = await prisma.resourcePurchase.findFirst({
      where: {
        userId: user.id,
        resourceId: resourceId,
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!purchase) {
      return NextResponse.json({ 
        success: false,
        message: 'No pending purchase found' 
      }, { status: 404 })
    }

    // Update the purchase status
    const updatedPurchase = await prisma.resourcePurchase.update({
      where: { id: purchase.id },
      data: { 
        status: status as any,
        ...(paymentIntentId && { stripeId: paymentIntentId })
      }
    })

    console.log('Purchase status updated:', {
      purchaseId: updatedPurchase.id,
      resourceId: updatedPurchase.resourceId,
      status: updatedPurchase.status,
      userId: updatedPurchase.userId
    })

    return NextResponse.json({ 
      success: true,
      purchase: {
        id: updatedPurchase.id,
        resourceId: updatedPurchase.resourceId,
        status: updatedPurchase.status,
        amountUSD: updatedPurchase.amountUSD
      }
    })

  } catch (error) {
    console.error('Error updating purchase status:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
