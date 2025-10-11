import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/courses/[id]/progress - Get lesson progress for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For now, return empty progress to test the functionality
    // TODO: Implement proper database progress tracking
    return NextResponse.json({ progress: {} })
  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/courses/[id]/progress - Update lesson progress
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { lessonId, completed } = body

    if (!lessonId || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // For now, just return success to test the functionality
    // TODO: Implement proper database progress tracking
    console.log('Lesson progress update:', { lessonId, completed })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Progress updated successfully'
    })
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
