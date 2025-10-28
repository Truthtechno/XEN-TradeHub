import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/telegram-groups - Get all telegram groups
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can view telegram groups
    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const groups = await prisma.telegramGroup.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Error fetching telegram groups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/telegram-groups - Create a new telegram group
export async function POST(request: NextRequest) {
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
      name: z.string().min(1, 'Name is required'),
      link: z.string().url('Must be a valid URL'),
      description: z.string().optional(),
      category: z.string().optional(),
      displayOrder: z.number().int().default(0),
      isActive: z.boolean().default(true)
    })

    const validatedData = groupSchema.parse(body)

    const group = await prisma.telegramGroup.create({
      data: validatedData
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('Error creating telegram group:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

