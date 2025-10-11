import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const academyClass = await prisma.academyClass.findUnique({
      where: { id: params.id },
      include: {
        registrations: {
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
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!academyClass) {
      return NextResponse.json(
        { error: 'Academy class not found' },
        { status: 404 }
      )
    }

    // Transform the data to include enrollment count
    const academyClassWithEnrollment = {
      ...academyClass,
      enrolledStudents: academyClass.registrations.filter(reg => reg.status !== 'CANCELLED').length
    }

    return NextResponse.json(academyClassWithEnrollment)
  } catch (error) {
    console.error('Error fetching academy class:', error)
    return NextResponse.json(
      { error: 'Failed to fetch academy class' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      price,
      currency,
      duration,
      level,
      maxStudents,
      instructor,
      location,
      nextSession,
      status,
      isPublished
    } = body

    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (currency !== undefined) updateData.currency = currency
    if (duration !== undefined) updateData.duration = duration
    if (level !== undefined) updateData.level = level.toUpperCase()
    if (maxStudents !== undefined) updateData.maxStudents = parseInt(maxStudents)
    if (instructor !== undefined) updateData.instructor = instructor
    if (location !== undefined) updateData.location = location
    if (nextSession !== undefined) updateData.nextSession = new Date(nextSession)
    if (status !== undefined) updateData.status = status.toUpperCase()
    if (isPublished !== undefined) updateData.isPublished = isPublished

    const academyClass = await prisma.academyClass.update({
      where: { id: params.id },
      data: updateData,
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
      enrolledStudents: academyClass.registrations.filter(reg => reg.status !== 'CANCELLED').length
    })
  } catch (error) {
    console.error('Error updating academy class:', error)
    return NextResponse.json(
      { error: 'Failed to update academy class' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    // Check if there are any registrations
    const registrations = await prisma.academyClassRegistration.findMany({
      where: { classId: params.id }
    })

    if (registrations.length > 0 && !force) {
      return NextResponse.json(
        { 
          error: 'Cannot delete academy class with existing registrations',
          registrationsCount: registrations.length,
          message: `This class has ${registrations.length} registered students. Use force=true to delete anyway.`
        },
        { status: 400 }
      )
    }

    // If force is true, delete registrations first, then the class
    if (force && registrations.length > 0) {
      console.log(`Force deleting class with ${registrations.length} registrations`)
      
      // Delete all registrations first
      await prisma.academyClassRegistration.deleteMany({
        where: { classId: params.id }
      })
      
      console.log('Deleted all registrations for class')
    }

    // Delete the class
    await prisma.academyClass.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'Academy class deleted successfully',
      deletedRegistrations: force ? registrations.length : 0
    })
  } catch (error) {
    console.error('Error deleting academy class:', error)
    return NextResponse.json(
      { error: 'Failed to delete academy class', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
