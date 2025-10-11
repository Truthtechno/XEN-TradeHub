import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use same authentication method as /api/auth/me
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, 'your-secret-key') as any

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const registrationId = params.id

    // Find the registration
    const registration = await prisma.brokerRegistration.findUnique({
      where: { id: registrationId },
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
            name: true
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (registration.verified) {
      return NextResponse.json({ error: 'Registration is already verified' }, { status: 400 })
    }

    // Update the registration to verified
    const updatedRegistration = await prisma.brokerRegistration.update({
      where: { id: registrationId },
      data: {
        verified: true,
        verifiedAt: new Date()
      },
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
            name: true
          }
        }
      }
    })

    // Log the action
    console.log(`Admin ${user.email} marked registration ${registrationId} as verified`)

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: 'Registration marked as verified successfully'
    })

  } catch (error) {
    console.error('Error marking registration as verified:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
