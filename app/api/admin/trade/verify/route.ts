import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'





import { z } from 'zod'



// POST /api/admin/trade/verify - Verify a broker registration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST']
    
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const verifySchema = z.object({
      registrationId: z.string().min(1),
      verified: z.boolean()
    })

    const validatedData = verifySchema.parse(body)

    // Check if registration exists
    const registration = await prisma.brokerRegistration.findUnique({
      where: { id: validatedData.registrationId },
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

    // Update registration
    const updatedRegistration = await prisma.brokerRegistration.update({
      where: { id: validatedData.registrationId },
      data: {
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
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: 'VERIFY_BROKER_REGISTRATION',
        entity: 'BrokerRegistration',
        entityId: validatedData.registrationId,
        diff: {
          before: {},
          after: {}
        }
      }
    })

    return NextResponse.json(updatedRegistration)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error verifying broker registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
