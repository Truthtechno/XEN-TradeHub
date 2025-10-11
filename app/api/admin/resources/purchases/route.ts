import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







// GET /api/admin/resources/purchases - Get all resource purchases
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin access required' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch purchases with user and resource details
    const purchases = await prisma.resourcePurchase.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        resource: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.resourcePurchase.count()

    // Calculate total revenue
    const totalRevenue = await prisma.resourcePurchase.aggregate({
      _sum: {
        amountUSD: true
      },
      where: {
        status: 'COMPLETED'
      }
    })

    console.log('Fetched purchases:', purchases.length)

    return NextResponse.json({ 
      success: true,
      purchases: purchases,
      totalCount: totalCount,
      totalRevenue: totalRevenue._sum.amountUSD || 0
    })

  } catch (error) {
    console.error('Error fetching resource purchases:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
