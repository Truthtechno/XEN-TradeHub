import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/banners - Get active banners for a specific page (excluding dismissed ones)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '/'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get the current user session
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    
    // For testing purposes, if no session, use a test user ID
    // In production, this should be removed and only authenticated users should see banners
    const testUserId = userId || 'cmghmk1tu00001d3t8ipi2pm6'

    // First get all active banners for the page
    const allBanners = await prisma.newNotification.findMany({
      where: {
        pagePath: page,
        type: 'banner',
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        message: true,
        description: true,
        color: true,
        createdAt: true,
        expiresAt: true
      }
    })

    // If no user ID, return all banners
    if (!testUserId) {
      return NextResponse.json({
        banners: allBanners,
        page,
        count: allBanners.length
      })
    }

    // Get dismissed banner IDs for this user
    const dismissedBannerIds = await prisma.dismissedBanner.findMany({
      where: {
        userId: testUserId
      },
      select: {
        bannerId: true
      }
    })

    const dismissedIds = new Set(dismissedBannerIds.map(d => d.bannerId))

    // Filter out dismissed banners
    const banners = allBanners.filter(banner => !dismissedIds.has(banner.id))

    return NextResponse.json({
      banners,
      page,
      count: banners.length
    })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
