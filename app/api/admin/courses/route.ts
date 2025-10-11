import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







// GET /api/admin/courses - Get all courses with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const level = searchParams.get('level') || 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status !== 'all') {
      where.status = status
    }
    
    if (level !== 'all') {
      where.level = level
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          },
          enrollments: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              progress: true,
              completed: true
            }
          },
          _count: {
            select: {
              lessons: true,
              enrollments: true
            }
          }
        }
      }),
      prisma.course.count({ where })
    ])

    // Format courses to match expected structure
    const formattedCourses = courses.map(course => {
      // Calculate actual revenue from enrollments
      const totalRevenue = course.enrollments.reduce((sum: number, enrollment: any) => {
        // Only count revenue for paid courses
        if (!course.isFree) {
          return sum + course.priceUSD
        }
        return sum
      }, 0)

      return {
        ...course,
        enrollments: course._count.enrollments,
        revenue: totalRevenue,
        // Use actual course views from the database
        views: course.views,
        lessons: course.lessons.map(lesson => ({
          ...lesson,
          isPreview: lesson.isPreview || false,
          isPublished: lesson.isPublished || false
        }))
      }
    })

    return NextResponse.json({
      courses: formattedCourses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const courseSchema = z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().min(1),
      priceUSD: z.number().min(0),
      level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
      status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
      instructor: z.string().min(1).default('XEN Forex')
    })

    const validatedData = courseSchema.parse(body)

    // Check if course with same slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingCourse) {
      return NextResponse.json({ error: 'Course with this slug already exists' }, { status: 400 })
    }

    // Calculate total duration from lessons
    const lessons = body.lessons || []
    const totalDuration = lessons.reduce((acc: number, lesson: any) => acc + (lesson.durationSec || 0), 0)
    const totalLessons = lessons.length

    // Create course
    const course = await prisma.course.create({
      data: {
        ...validatedData,
        shortDescription: body.shortDescription || null,
        coverUrl: body.coverUrl || null,
        isFree: body.isFree || false,
        duration: totalDuration, // Use calculated duration
        totalLessons: totalLessons, // Use actual lesson count
        views: body.views || 0,
        rating: body.rating || null,
        tags: body.tags || []
      },
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
    })

    // Create lessons if provided
    if (lessons.length > 0) {
      await prisma.lesson.createMany({
        data: lessons.map((lesson: any, index: number) => ({
          title: lesson.title,
          description: lesson.description || '',
          videoUrl: lesson.videoUrl || '',
          durationSec: lesson.durationSec || 0,
          order: lesson.order || index + 1,
          isPreview: lesson.isPreview || false,
          isPublished: lesson.isPublished !== false, // Default to true
          thumbnailUrl: lesson.thumbnailUrl || null,
          courseId: course.id
        }))
      })
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_COURSE',
        entity: 'Course',
        entityId: course.id,
        diff: {
          title: course.title,
          slug: course.slug,
          priceUSD: course.priceUSD,
          level: course.level,
          status: course.status
        }
      }
    })

    // Create NEW notification for the courses page
    await prisma.newNotification.create({
      data: {
        userId: user.id, // Use the admin user who created the course
        title: 'New Course Available!',
        message: `Check out the new course: "${course.title}" - ${course.level} level`,
        type: 'course',
        isRead: false
      }
    })

    // Create user notifications for all students about the new course
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true }
    })

    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map(student => ({
          userId: student.id,
          title: 'New Course Available!',
          message: `A new ${course.level.toLowerCase()} level course "${course.title}" has been added to the academy. ${course.isFree ? 'It\'s free to enroll!' : `Enroll now for $${course.priceUSD}`}`,
          type: 'COURSE',
          actionUrl: `/courses/${course.slug}`,
          isRead: false
        }))
      })
    }

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating course:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
