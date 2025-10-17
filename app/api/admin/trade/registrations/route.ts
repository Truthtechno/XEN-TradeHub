import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







export async function GET(request: NextRequest) {
  try {
    // Use same authentication method as /api/auth/me
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify JWT token (lightweight check)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Quick role check from JWT token (avoid database lookup for frequent requests)
    if (!['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50') // Increased from 10 to 50
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const [registrations, total] = await Promise.all([
      prisma.brokerRegistration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          link: {
            select: {
              id: true,
              name: true,
              url: true
            }
          }
        }
      }),
      prisma.brokerRegistration.count({ where })
    ])

    // Format registrations to match expected structure
    const formattedRegistrations = registrations.map(reg => {
      // Safely extract verification data
      const verificationData = reg.verificationData as any || {}
      
      return {
        id: reg.id,
        user: {
          name: reg.user?.name || 'Unknown User',
          email: reg.user?.email || 'no-email@example.com'
        },
        broker: 'EXNESS', // Default broker
        link: {
          label: reg.link?.name || 'EXNESS'
        },
        verified: reg.verified || false,
        verifiedAt: reg.verifiedAt,
        registered: reg.createdAt,
        createdAt: reg.createdAt,
        verificationData: {
          email: verificationData.email || reg.user?.email || '',
          fullName: verificationData.fullName || reg.user?.name || '',
          phoneNumber: verificationData.phoneNumber || '',
          exnessAccountId: verificationData.exnessAccountId || ''
        }
      }
    })

    return NextResponse.json({
      registrations: formattedRegistrations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching broker registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
