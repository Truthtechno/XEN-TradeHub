import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUserSimple(request)
    
    if (!authUser || authUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    const affiliate = await prisma.affiliateProgram.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json({ success: true, affiliate })
  } catch (error) {
    console.error('Error toggling affiliate status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
