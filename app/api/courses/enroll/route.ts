import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { notifyStudentEnrollment } from '@/lib/admin-notification-utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// POST /api/courses/enroll - Enroll user in a course
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
    const { courseId, transactionId, paymentStatus } = body

    if (!courseId) {
      return NextResponse.json({ 
        success: false,
        message: 'Course ID required' 
      }, { status: 400 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json({ 
        success: false,
        message: 'Course not found' 
      }, { status: 404 })
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ 
        success: true,
        message: 'User already enrolled in this course',
        enrollment: existingEnrollment
      })
    }

    // Create enrollment using CourseEnrollment model
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: user.id,
        courseId: courseId,
        progress: 0,
        completed: false
      }
    })

    // Create course purchase record for tracking
    // Note: coursePurchase table doesn't exist in current schema
    if (transactionId && paymentStatus === 'completed') {
      try {
        // TODO: Implement course purchase tracking when table is available
        console.log('Course purchase completed:', {
          userId: user.id,
          courseId: courseId,
          amount: course.priceUSD,
          transactionId: transactionId
        })
      } catch (error) {
        console.error('Error creating course purchase record:', error)
        // Don't fail the enrollment if purchase record creation fails
      }
    }

    console.log('Course enrollment created:', {
      userId: user.id,
      courseId: courseId,
      enrollmentId: enrollment.id,
      transactionId
    })

    // Create admin notification for student enrollment
    await notifyStudentEnrollment(
      user.name || user.email || 'Unknown User',
      user.email || 'unknown@example.com',
      course.title,
      `/admin/courses/${course.id}`
    )

    return NextResponse.json({ 
      success: true,
      message: 'Successfully enrolled in course',
      enrollment: {
        id: enrollment.id,
        courseId: enrollment.courseId,
        enrolledAt: enrollment.enrolledAt
      }
    })
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to enroll in course' 
    }, { status: 500 })
  }
}
