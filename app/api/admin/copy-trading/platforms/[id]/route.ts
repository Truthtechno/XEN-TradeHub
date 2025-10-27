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
    const { 
      name, 
      slug, 
      description, 
      logoUrl, 
      copyTradingLink,
      profitPercentage, 
      profitShareRate,
      riskLevel, 
      minInvestment, 
      strategy, 
      roi,
      winRate,
      maxDrawdown,
      isActive, 
      displayOrder,
      notes
    } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (copyTradingLink !== undefined) updateData.copyTradingLink = copyTradingLink
    if (profitPercentage !== undefined) updateData.profitPercentage = profitPercentage
    if (profitShareRate !== undefined) updateData.profitShareRate = profitShareRate
    if (riskLevel !== undefined) updateData.riskLevel = riskLevel
    if (minInvestment !== undefined) updateData.minInvestment = minInvestment
    if (strategy !== undefined) updateData.strategy = strategy
    if (roi !== undefined) updateData.roi = roi
    if (winRate !== undefined) updateData.winRate = winRate
    if (maxDrawdown !== undefined) updateData.maxDrawdown = maxDrawdown
    if (isActive !== undefined) updateData.isActive = isActive
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder
    if (notes !== undefined) updateData.notes = notes

    const platform = await prisma.copyTradingPlatform.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ platform })
  } catch (error) {
    console.error('Error updating trader:', error)
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

    await prisma.copyTradingPlatform.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trader:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
