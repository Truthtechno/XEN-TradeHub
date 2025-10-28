import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all registrations for this user (by userId or email as fallback)
    const registrations = await prisma.academyClassRegistration.findMany({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      },
      select: {
        id: true,
        classId: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        academyClass: {
          select: {
            title: true,
            status: true,
            isPublished: true
          }
        }
      }
    })

    console.log(`Found ${registrations.length} registrations for user ${user.id} (${user.email})`)

    // Filter out registrations for cancelled or unpublished classes
    const activeRegistrations = registrations.filter(reg => 
      reg.academyClass.status !== 'CANCELLED' && 
      reg.academyClass.isPublished === true &&
      reg.status !== 'CANCELLED'
    )

    console.log(`${activeRegistrations.length} active registrations after filtering`)

    // Get unique class IDs
    const uniqueClassIds = Array.from(new Set(activeRegistrations.map(reg => reg.classId)))

    return NextResponse.json({
      registrations: activeRegistrations,
      registeredClassIds: uniqueClassIds,
      count: activeRegistrations.length
    })
  } catch (error: any) {
    console.error('Failed to fetch user registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user registrations', details: error.message },
      { status: 500 }
    )
  }
}

