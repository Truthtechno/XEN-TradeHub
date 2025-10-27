import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyAcademyRegistration } from '@/lib/admin-notification-utils'
import { createAcademyCommission } from '@/lib/affiliate-commission-utils'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')

    const where: any = { classId: params.id }
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus
    }

    const registrations = await prisma.academyClassRegistration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                country: true
              }
            }
          }
        },
        academyClass: {
          select: {
            title: true,
            price: true,
            currency: true,
            nextSession: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Error fetching academy class registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get logged-in user from auth token (if available)
    const authUser = await getAuthenticatedUserSimple(request)
    const loggedInUserId = authUser?.id || null

    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      experience,
      goals,
      amountUSD,
      currency = 'USD',
      status = 'PENDING',
      paymentStatus = 'PENDING'
    } = body

    // Use logged-in user ID (for commission tracking), not the userId from body
    const userId = loggedInUserId

    // Validate required fields
    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
        { status: 400 }
      )
    }

    // Check if class exists
    const academyClass = await prisma.academyClass.findUnique({
      where: { id: params.id }
    })

    if (!academyClass) {
      return NextResponse.json(
        { error: 'Academy class not found' },
        { status: 404 }
      )
    }

    // Check if class is full
    const existingRegistrations = await prisma.academyClassRegistration.count({
      where: { 
        classId: params.id,
        status: 'CONFIRMED'
      }
    })

    if (existingRegistrations >= academyClass.maxStudents) {
      return NextResponse.json(
        { error: 'Class is full' },
        { status: 400 }
      )
    }

    const registration = await prisma.academyClassRegistration.create({
      data: {
        classId: params.id,
        userId: userId || null,
        fullName,
        email,
        phone,
        experience,
        goals,
        amountUSD: amountUSD || academyClass.price,
        currency,
        status,
        paymentStatus
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                country: true
              }
            }
          }
        },
        academyClass: {
          select: {
            title: true,
            price: true,
            currency: true,
            nextSession: true
          }
        }
      }
    })

    // Notify admins about new academy registration
    await notifyAcademyRegistration(
      fullName,
      email,
      academyClass.title,
      `/admin/academy`
    )

    // Create affiliate commission if user was referred
    console.log(`[Academy Registration] userId: ${userId}, price: ${academyClass.price}`)
    if (userId && academyClass.price > 0) {
      console.log(`[Academy Registration] Creating commission for user ${userId}`)
      await createAcademyCommission(
        userId,
        academyClass.price,
        params.id
      )
      console.log(`[Academy Registration] Commission created successfully`)
    } else {
      console.log(`[Academy Registration] Skipping commission - userId: ${userId}, price: ${academyClass.price}`)
    }

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error('Error creating academy class registration:', error)
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}
