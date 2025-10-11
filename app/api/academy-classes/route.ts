import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      nextSession,
      status = 'UPCOMING',
      isPublished = true
    } = body

    // Validate required fields
    if (!title || !description || !price || !duration || !level || !maxStudents || !instructor || !location || !nextSession) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const academyClass = await prisma.academyClass.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        currency,
        duration,
        level: level.toUpperCase(),
        maxStudents: parseInt(maxStudents),
        instructor,
        location,
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

    return NextResponse.json({
      ...academyClass,
      enrolledStudents: 0
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating academy class:', error)
    return NextResponse.json(
      { error: 'Failed to create academy class' },
      { status: 500 }
    )
  }
}
