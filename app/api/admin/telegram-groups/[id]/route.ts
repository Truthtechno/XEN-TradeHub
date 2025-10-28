import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// PUT /api/admin/telegram-groups/[id] - Update a telegram group
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const groupSchema = z.object({
      name: z.string().min(1).optional(),
      link: z.string().url().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      displayOrder: z.number().int().optional(),
      isActive: z.boolean().optional()
    })

    const validatedData = groupSchema.parse(body)

    const group = await prisma.telegramGroup.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Error updating telegram group:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/telegram-groups/[id] - Delete a telegram group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.telegramGroup.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting telegram group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

