import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/banners/dismiss - Dismiss a banner for a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // For development/testing, use a fallback user ID if no session
    const userId = (session?.user as any)?.id || 'cmghmk1tu00001d3t8ipi2pm6'

    const { bannerId } = await request.json()

    if (!bannerId) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    // Check if the banner exists
    const banner = await prisma.newNotification.findUnique({
      where: { id: bannerId }
    })

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    // Create or update the dismissed banner record
    await prisma.dismissedBanner.upsert({
      where: {
        userId_bannerId: {
          userId: userId,
          bannerId: bannerId
        }
      },
      update: {
        dismissedAt: new Date()
      },
      create: {
        userId: userId,
        bannerId: bannerId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Banner dismissed successfully'
    })
  } catch (error) {
    console.error('Failed to dismiss banner:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss banner' },
      { status: 500 }
    )
  }
}
