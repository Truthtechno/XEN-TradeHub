import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    // Get all commissions for this affiliate program
    console.log(`[Affiliate Commissions] Fetching for affiliate ID: ${params.id}`)
    
    const commissions = await prisma.affiliateCommission.findMany({
      where: {
        affiliateProgramId: params.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        status: true,
        createdAt: true,
        verifiedAt: true
      }
    })

    console.log(`[Affiliate Commissions] Found ${commissions.length} commissions`)

    return NextResponse.json({ commissions })
  } catch (error) {
    console.error('Error fetching affiliate commissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
