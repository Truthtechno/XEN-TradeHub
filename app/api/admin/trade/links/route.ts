import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const links = await prisma.brokerLink.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Get registration counts for each link
    const linksWithStats = await Promise.all(
      links.map(async (link) => {
        const registrations = await prisma.brokerRegistration.count({
          where: { linkId: link.id }
        })

        return {
          id: link.id,
          label: link.name,
          broker: 'EXNESS', // Default broker
          url: link.url,
          isDefault: link.id === links[0]?.id, // First link is default
          isActive: link.isActive,
          clicks: 0, // We don't track clicks yet
          registrations,
          createdAt: link.createdAt
        }
      })
    )

    return NextResponse.json({
      links: linksWithStats,
      totalClicks: linksWithStats.reduce((sum, link) => sum + link.clicks, 0),
      totalRegistrations: linksWithStats.reduce((sum, link) => sum + link.registrations, 0)
    })
  } catch (error) {
    console.error('Error fetching broker links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
