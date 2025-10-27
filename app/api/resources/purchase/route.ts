import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
// import { notifyStudentPurchase } from '@/lib/admin-notification-utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







// POST /api/resources/purchase - Purchase individual resource
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
    
    const purchaseSchema = z.object({
      resourceId: z.string().min(1),
      amountUSD: z.number().min(0),
      provider: z.string().default('stripe'),
      providerRef: z.string().optional()
    })

    const validatedData = purchaseSchema.parse(body)
    
    // Check if resource exists and is premium
    const resource = await prisma.resource.findUnique({
      where: { id: validatedData.resourceId },
      select: { 
        id: true, 
        title: true,
        isPremium: true,
        priceUSD: true
      }
    })

    if (!resource) {
      return NextResponse.json({ 
        success: false,
        message: 'Resource not found' 
      }, { status: 404 })
    }

    if (!resource.isPremium) {
      return NextResponse.json({ 
        success: false,
        message: 'Resource is not premium' 
      }, { status: 400 })
    }

    // Check if user already purchased this resource
    const existingPurchase = await prisma.resourcePurchase.findFirst({
      where: {
        userId: user.id,
        resourceId: validatedData.resourceId
      }
    })

    if (existingPurchase) {
      return NextResponse.json({ 
        success: false,
        message: 'Resource already purchased' 
      }, { status: 400 })
    }

    // Create mock payment intent using the existing mock payment system
    const mockPaymentResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mock-payment/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: validatedData.amountUSD,
        currency: 'USD',
        courseId: validatedData.resourceId,
        courseTitle: resource.title
      })
    })

    if (!mockPaymentResponse.ok) {
      throw new Error('Failed to create payment intent')
    }

    const mockPaymentData = await mockPaymentResponse.json()

    // Create pending purchase record
    const purchase = await prisma.resourcePurchase.create({
      data: {
        userId: user.id,
        resourceId: validatedData.resourceId,
        amountUSD: validatedData.amountUSD,
        status: 'PENDING',
        stripeId: mockPaymentData.paymentIntentId,
      }
    })

    console.log('Resource purchase intent created:', purchase.id, 'Mock Payment ID:', mockPaymentData.paymentIntentId)

    // Create admin notification for student purchase
    // await notifyStudentPurchase(
    //   user.name || user.email || 'Unknown User',
    //   user.email || 'unknown@example.com',
    //   'resource',
    //   resource.title,
    //   resource.priceUSD || 0,
    //   'USD',
    //   `/admin/resources/${resource.id}`
    // )

    return NextResponse.json({ 
      success: true,
      message: 'Payment intent created successfully',
      clientSecret: mockPaymentData.clientSecret,
      paymentIntentId: mockPaymentData.paymentIntentId,
      purchase: {
        id: purchase.id,
        resourceId: purchase.resourceId,
        amountUSD: purchase.amountUSD,
        status: purchase.status
      }
    })

  } catch (error) {
    console.error('Error processing resource purchase:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET /api/resources/purchase - Check if user has purchased a resource
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        hasPurchased: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')
    
    if (!resourceId) {
      return NextResponse.json({ 
        hasPurchased: false,
        message: 'Resource ID required' 
      }, { status: 400 })
    }

    // Check if user has purchased this resource
    const purchase = await prisma.resourcePurchase.findFirst({
      where: {
        userId: user.id,
        resourceId: resourceId
      },
      select: {
        id: true,
        amountUSD: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({ 
      hasPurchased: !!purchase,
      purchase: purchase
    })

  } catch (error) {
    console.error('Error checking resource purchase:', error)
    return NextResponse.json({ 
      hasPurchased: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
