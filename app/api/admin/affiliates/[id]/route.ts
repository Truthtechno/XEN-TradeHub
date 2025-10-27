import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
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

    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { tier, commissionRate, isActive } = body

    const updateData: any = {}
    if (tier !== undefined) updateData.tier = tier
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate
    if (isActive !== undefined) updateData.isActive = isActive

    const affiliate = await prisma.affiliateProgram.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ affiliate })
  } catch (error) {
    console.error('Error updating affiliate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
