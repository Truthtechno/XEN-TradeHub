import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { accessControl } from '@/lib/access-control'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/courses/check-access - Check if user has access to premium courses
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ 
        hasAccess: false,
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ 
        hasAccess: false,
        message: 'Course ID required' 
      }, { status: 400 })
    }

    // Use the new access control service
    const access = await accessControl.checkCoursesAccess(user.id, courseId)

    return NextResponse.json({
      hasAccess: access.hasAccess,
      requiresPayment: access.requiresPayment,
      message: access.reason,
      courseTitle: 'Premium Course'
    })

  } catch (error) {
    console.error('Error checking course access:', error)
    return NextResponse.json({ 
      hasAccess: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}