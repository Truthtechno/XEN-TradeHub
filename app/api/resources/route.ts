import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { accessControl } from '@/lib/access-control'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''

    // Get authenticated user
    const user = await getAuthenticatedUserSimple(request)
    
    // Check if user has premium access
    let hasPremiumAccess = false
    if (user) {
      const access = await accessControl.getUserAccess(user.id)
      hasPremiumAccess = access.premiumResources
    }

    // Build where clause
    const where: any = {
      publishedAt: { not: null } // Only published resources
    }

    // Show all resources to all users - access control is handled per-resource

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    if (type) {
      where.type = type
    }

    if (category) {
      where.category = category
    }

    // Build orderBy clause
    const orderBy = { publishedAt: 'desc' as const }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          type: true,
          category: true,
          url: true,
          thumbnail: true,
          duration: true,
          isPremium: true,
          priceUSD: true,
          tags: true,
          likes: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.resource.count({ where })
    ])

    // Add access information for each resource
    const resourcesWithAccess = await Promise.all(
      resources.map(async (resource) => {
        let hasAccess = false
        let requiresPayment = false
        let reason = ''

        if (!resource.isPremium) {
          // Free resources - everyone has access
          hasAccess = true
          reason = 'Free resource'
        } else if (hasPremiumAccess) {
          // Premium user - has access to all resources
          hasAccess = true
          reason = 'Premium user - full access'
        } else if (user) {
          // Check if user has purchased this specific resource
          const purchase = await prisma.resourcePurchase.findFirst({
            where: {
              userId: user.id,
              resourceId: resource.id,
              status: 'COMPLETED'
            }
          })
          
          if (purchase) {
            hasAccess = true
            reason = 'Resource purchased individually'
          } else {
            requiresPayment = true
            reason = 'Premium subscription required or individual purchase'
          }
        } else {
          // Not authenticated - requires payment
          requiresPayment = true
          reason = 'Authentication required'
        }

        return {
          ...resource,
          access: {
            hasAccess,
            requiresPayment,
            reason,
            priceUSD: resource.priceUSD
          }
        }
      })
    )

    return NextResponse.json({
      resources: resourcesWithAccess,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      userAccess: {
        hasPremiumAccess,
        isAuthenticated: !!user
      }
    })

  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
