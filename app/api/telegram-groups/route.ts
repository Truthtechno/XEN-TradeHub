import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/telegram-groups - Get all active telegram groups (for users)
export async function GET(request: NextRequest) {
  try {
    const groups = await prisma.telegramGroup.findMany({
      where: {
        isActive: true
      },
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

