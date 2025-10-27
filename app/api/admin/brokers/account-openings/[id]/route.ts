import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN', 'SUPPORT'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    const accountOpening = await prisma.brokerAccountOpening.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json({ accountOpening })
  } catch (error) {
    console.error('Error updating account opening:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
