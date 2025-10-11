import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/courses/enrolled - Get user's enrolled courses
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        enrolledCourses: [],
        message: 'Authentication required' 
      }, { status: 401 })
    }

    // Get user's enrolled courses from database
    const enrolledCourses = await prisma.courseEnrollment.findMany({
      where: {
        userId: user.id
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            },
            _count: {
              select: {
                lessons: true,
                enrollments: true
              }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const courses = enrolledCourses.map(enrollment => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      slug: enrollment.course.slug,
      description: enrollment.course.description,
      shortDescription: enrollment.course.shortDescription,
      priceUSD: enrollment.course.priceUSD,
      level: enrollment.course.level,
      status: enrollment.course.status,
      coverUrl: enrollment.course.coverUrl,
      instructor: enrollment.course.instructor,
      isFree: enrollment.course.isFree,
      duration: enrollment.course.duration,
      totalLessons: enrollment.course.totalLessons,
      views: enrollment.course.views,
      rating: enrollment.course.rating,
      tags: enrollment.course.tags,
      lessons: enrollment.course.lessons,
      enrollments: enrollment.course._count.enrollments,
      // Add enrollment-specific data
      enrolledAt: enrollment.enrolledAt
    }))

    console.log(`Found ${courses.length} enrolled courses for user ${user.id}`)

    return NextResponse.json({ 
      enrolledCourses: courses,
      count: courses.length
    })
  } catch (error) {
    console.error('Error fetching enrolled courses:', error)
    return NextResponse.json({ 
      enrolledCourses: [],
      error: 'Failed to fetch enrolled courses' 
    }, { status: 500 })
  }
}

// POST /api/courses/enrolled - Check if user is enrolled in specific course
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        isEnrolled: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ 
        isEnrolled: false,
        message: 'Course ID required' 
      }, { status: 400 })
    }

    // Check if user is enrolled in this specific course
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (enrollment) {
      return NextResponse.json({ 
        isEnrolled: true,
        enrollment: {
          id: enrollment.id,
          enrolledAt: enrollment.enrolledAt,
          course: enrollment.course
        }
      })
    } else {
      return NextResponse.json({ 
        isEnrolled: false,
        message: 'User not enrolled in this course' 
      })
    }
  } catch (error) {
    console.error('Error checking course enrollment:', error)
    return NextResponse.json({ 
      isEnrolled: false,
      error: 'Failed to check enrollment' 
    }, { status: 500 })
  }
}
