import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: classId } = params

    // Find all registrations for this class that are PAID but not CONFIRMED
    const paidPendingRegistrations = await prisma.academyClassRegistration.findMany({
      where: {
        classId: classId,
        paymentStatus: 'PAID',
        status: 'PENDING'
      }
    })

    if (paidPendingRegistrations.length === 0) {
      return NextResponse.json({
        message: 'No paid pending registrations found',
        updatedCount: 0
      })
    }

    // Update all paid pending registrations to CONFIRMED
    const updateResult = await prisma.academyClassRegistration.updateMany({
      where: {
        classId: classId,
        paymentStatus: 'PAID',
        status: 'PENDING'
      },
      data: {
        status: 'CONFIRMED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: `Successfully confirmed ${updateResult.count} paid registrations`,
      updatedCount: updateResult.count,
      registrations: paidPendingRegistrations.map(reg => ({
        id: reg.id,
        fullName: reg.fullName,
        email: reg.email,
        paymentStatus: reg.paymentStatus,
        previousStatus: 'PENDING',
        newStatus: 'CONFIRMED'
      }))
    })
  } catch (error: any) {
    console.error('Failed to auto-confirm paid registrations:', error)
    return NextResponse.json(
      {
        error: 'Failed to auto-confirm paid registrations',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
