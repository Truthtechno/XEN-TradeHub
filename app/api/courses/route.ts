import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




// GET /api/courses - Get published courses for users


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') || 'all'
    const isFree = searchParams.get('isFree') || 'all'

    const skip = (page - 1) * limit

    // Build where clause - only show published courses
    const where: any = {
      status: 'PUBLISHED' // Only show published courses to users
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (level !== 'all') {
      where.level = level
    }

    if (isFree !== 'all') {
      where.isFree = isFree === 'true'
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              videoUrl: true,
              durationSec: true,
              order: true,
              isPreview: true,
              thumbnailUrl: true
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

    // Transform the data to match the expected format
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      priceUSD: course.priceUSD,
      level: course.level,
      status: course.status,
      coverUrl: course.coverUrl,
      instructor: course.instructor,
      isFree: course.isFree,
      duration: course.duration || 0,
      totalLessons: course._count.lessons,
      views: course.views,
      rating: course.rating,
      tags: course.tags,
      lessons: course.lessons,
      enrollments: course._count.enrollments,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }))

    return NextResponse.json({
      courses: transformedCourses,
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
