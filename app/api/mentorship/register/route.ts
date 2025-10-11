import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'countryCode', 'schedulingPreferences']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    const fullPhone = `${body.countryCode}${body.phone}`
    if (!phoneRegex.test(fullPhone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Check if user already has a mentorship registration
    const existingRegistration = await prisma.mentorshipRegistration.findFirst({
      where: { userId: user.id }
    })

    if (existingRegistration) {
      return NextResponse.json({
        success: false,
        message: 'You already have a mentorship registration'
      }, { status: 400 })
    }

    // Create registration data
    const registration = await prisma.mentorshipRegistration.create({
      data: {
        userId: user.id,
        name: `${body.firstName} ${body.lastName}`,
        email: body.email,
        phone: fullPhone,
        country: body.country || 'Unknown',
        experience: body.experience || '',
        goals: body.schedulingPreferences || '',
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })
    
    // In a real application, you would also:
    // 1. Send confirmation email
    // 2. Notify the mentorship team
    // 3. Create calendar booking request
    
    console.log('Mentorship Registration saved:', registration.id)

    return NextResponse.json({
      success: true,
      message: 'Mentorship registration successful',
      data: registration
    }, { status: 201 })

  } catch (error) {
    console.error('Mentorship registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Mentorship registration endpoint',
    methods: ['POST'],
    requiredFields: ['firstName', 'lastName', 'email', 'phone', 'countryCode', 'schedulingPreferences']
  })
}
