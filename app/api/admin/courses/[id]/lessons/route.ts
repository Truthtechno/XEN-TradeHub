import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'





import { z } from 'zod'



// GET /api/admin/courses/[id]/lessons - Get all lessons for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: params.id }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId: params.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/courses/[id]/lessons - Create a new lesson
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: params.id }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const body = await request.json()
    
    const lessonSchema = z.object({
      title: z.string().min(1),
      videoUrl: z.string().url().optional(),
      durationSec: z.number().min(0).optional(),
      order: z.number().min(0),
      isPreview: z.boolean().default(false)
    })

    const validatedData = lessonSchema.parse(body)

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        ...validatedData,
        courseId: params.id
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: 'CREATE_LESSON',
        entity: 'Lesson',
        entityId: lesson.id,
        diff: {
          title: lesson.title,
          courseId: params.id,
          order: lesson.order,
          isPreview: lesson.isPreview
        }
      }
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
