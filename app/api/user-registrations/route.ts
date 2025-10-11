import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Get all registrations for this user
    const registrations = await prisma.academyClassRegistration.findMany({
      where: {
        email: email
      },
      select: {
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

    // Filter out registrations for cancelled or unpublished classes
    const activeRegistrations = registrations.filter(reg => 
      reg.academyClass.status !== 'CANCELLED' && 
      reg.academyClass.isPublished === true
    )

    // Get unique class IDs
    const uniqueClassIds = Array.from(new Set(activeRegistrations.map(reg => reg.classId)))

    return NextResponse.json({
      registrations: activeRegistrations,
      registeredClassIds: uniqueClassIds
    })
  } catch (error: any) {
    console.error('Failed to fetch user registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user registrations', details: error.message },
      { status: 500 }
    )
  }
}
