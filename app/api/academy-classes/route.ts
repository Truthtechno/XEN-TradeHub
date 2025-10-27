import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyNewAcademyClass } from '@/lib/user-notification-utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const level = searchParams.get('level')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (level && level !== 'all') {
      where.level = level
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { instructor: { contains: search, mode: 'insensitive' } }
      ]
    }

    const classes = await prisma.academyClass.findMany({
      where,
      include: {
        registrations: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        nextSession: 'asc'
    }})

    // Transform the data to include enrollment count
    const classesWithEnrollment = classes.map(academyClass => ({
      ...academyClass,
      enrolledStudents: academyClass.registrations.filter(reg => reg.status !== 'CANCELLED').length
    }))

    return NextResponse.json(classesWithEnrollment)
  } catch (error) {
    console.error('Error fetching academy classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch academy classes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      price,
      currency = 'USD',
      duration,
      level,
      maxStudents,
      instructor,
      location,
      deliveryMode = 'PHYSICAL',
      scheduleType = 'ONE_TIME',
      recurrencePattern,
      nextSession,
      status = 'UPCOMING',
      isPublished = true
    } = body

    // Validate required fields
    if (!title || !description || !duration || !level || !maxStudents || !instructor || !location || !nextSession) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const academyClass = await prisma.academyClass.create({
      data: {
        title,
        description,
        price: price ? parseFloat(price) : 0,
        currency,
        duration,
        level: level.toUpperCase(),
        maxStudents: parseInt(maxStudents),
        instructor,
        location,
        deliveryMode: deliveryMode.toUpperCase(),
        scheduleType: scheduleType.toUpperCase(),
        recurrencePattern: recurrencePattern || null,
        nextSession: new Date(nextSession),
        status: status.toUpperCase(),
        isPublished
      },
      include: {
        registrations: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            createdAt: true
          }
        }
      }
    })

    // Notify all users about new academy class
    if (isPublished && status.toUpperCase() === 'UPCOMING') {
      const sessionDate = new Date(nextSession).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      await notifyNewAcademyClass(
        title,
        sessionDate,
        `/academy`
      )
    }

    return NextResponse.json({
      message: 'Academy class created successfully',
      class: academyClass
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating academy class:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create academy class',
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
