import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// POST /api/courses/[id]/view - Track a view for a course
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== COURSE VIEW API CALL ===')
    console.log('Course ID:', params.id)

    // Use simple authentication that works
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('No authenticated user found for view tracking')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('Authenticated user:', user)

    const courseId = params.id
    const userId = (user as any).id

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      console.log('Course not found for view tracking:', courseId)
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if user has already viewed this course today to prevent spam
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // For now, use a simple approach: increment view count
    // In the future, we could add a UserCourseView table to track individual user views
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { views: { increment: 1 } },
      select: { views: true }
    })

    console.log('View tracked for course:', courseId, 'by user:', userId, 'New count:', updatedCourse.views)

    return NextResponse.json({ 
      message: 'View tracked successfully', 
      views: updatedCourse.views 
    })
  } catch (error) {
    console.error('Failed to track course view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
