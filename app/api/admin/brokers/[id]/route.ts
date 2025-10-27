import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, description, logoUrl, referralLink, benefits, newAccountSteps, existingAccountSteps, isActive, displayOrder, notes } = body

    const broker = await prisma.broker.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        logoUrl,
        referralLink,
        benefits: benefits || [],
        newAccountSteps: newAccountSteps !== undefined ? newAccountSteps : undefined,
        existingAccountSteps: existingAccountSteps !== undefined ? existingAccountSteps : undefined,
        isActive,
        displayOrder,
        notes
      }
    })

    return NextResponse.json({ broker })
  } catch (error) {
    console.error('Error updating broker:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.broker.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting broker:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
