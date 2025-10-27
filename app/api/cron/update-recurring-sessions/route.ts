import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// This endpoint should be called by a cron job daily
// You can use services like Vercel Cron, or set up a cron job to hit this endpoint

export async function GET(request: NextRequest) {
  try {
    // Verify this is being called by authorized source (optional but recommended)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0) // Start of today

    // Find all recurring classes where the next session has passed
    const recurringClasses = await prisma.academyClass.findMany({
      where: {
        scheduleType: 'RECURRING',
        nextSession: {
          lt: now // Next session is in the past
        }
      }
    })

    const updates: Array<{
      id: string
      title: string
      oldSession: Date
      newSession: Date
    }> = []

    for (const academyClass of recurringClasses) {
      try {
        const newNextSession = calculateNextSession(
          academyClass.nextSession,
          academyClass.recurrencePattern || ''
        )

        if (newNextSession) {
          await prisma.academyClass.update({
            where: { id: academyClass.id },
            data: { nextSession: newNextSession }
          })

          updates.push({
            id: academyClass.id,
            title: academyClass.title,
            oldSession: academyClass.nextSession,
            newSession: newNextSession
          })
        }
      } catch (error) {
        console.error(`Error updating class ${academyClass.id}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Recurring sessions updated successfully',
      updatedCount: updates.length,
      updates
    })
  } catch (error: any) {
    console.error('Error updating recurring sessions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update recurring sessions',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Helper function to calculate the next session date based on recurrence pattern
function calculateNextSession(currentSession: Date, pattern: string): Date | null {
  const current = new Date(currentSession)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Keep incrementing until we find a future date
  let nextDate = new Date(current)
  
  // Parse common patterns
  const lowerPattern = pattern.toLowerCase()
  
  // Daily patterns
  if (lowerPattern.includes('daily') || lowerPattern.includes('every day')) {
    while (nextDate <= today) {
      nextDate.setDate(nextDate.getDate() + 1)
    }
    return nextDate
  }
  
  // Weekly patterns - specific day
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (lowerPattern.includes(daysOfWeek[i])) {
      // Find next occurrence of this day
      while (nextDate <= today || nextDate.getDay() !== i) {
        nextDate.setDate(nextDate.getDate() + 1)
      }
      return nextDate
    }
  }
  
  // Weekly pattern (generic)
  if (lowerPattern.includes('weekly') || lowerPattern.includes('every week')) {
    while (nextDate <= today) {
      nextDate.setDate(nextDate.getDate() + 7)
    }
    return nextDate
  }
  
  // Bi-weekly pattern
  if (lowerPattern.includes('bi-weekly') || lowerPattern.includes('biweekly') || lowerPattern.includes('every 2 weeks')) {
    while (nextDate <= today) {
      nextDate.setDate(nextDate.getDate() + 14)
    }
    return nextDate
  }
  
  // Monthly pattern
  if (lowerPattern.includes('monthly') || lowerPattern.includes('every month')) {
    while (nextDate <= today) {
      nextDate.setMonth(nextDate.getMonth() + 1)
    }
    return nextDate
  }
  
  // First [day] of month pattern
  if (lowerPattern.includes('first')) {
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (lowerPattern.includes(daysOfWeek[i])) {
        // Find first occurrence of this day in next month
        nextDate = new Date(today)
        nextDate.setMonth(nextDate.getMonth() + 1)
        nextDate.setDate(1)
        
        while (nextDate.getDay() !== i) {
          nextDate.setDate(nextDate.getDate() + 1)
        }
        return nextDate
      }
    }
  }
  
  // Last [day] of month pattern
  if (lowerPattern.includes('last')) {
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (lowerPattern.includes(daysOfWeek[i])) {
        // Find last occurrence of this day in next month
        nextDate = new Date(today)
        nextDate.setMonth(nextDate.getMonth() + 2)
        nextDate.setDate(0) // Last day of previous month
        
        while (nextDate.getDay() !== i) {
          nextDate.setDate(nextDate.getDate() - 1)
        }
        return nextDate
      }
    }
  }
  
  // Default: add 7 days if pattern is not recognized
  while (nextDate <= today) {
    nextDate.setDate(nextDate.getDate() + 7)
  }
  return nextDate
}

// POST endpoint for manual trigger (for testing)
export async function POST(request: NextRequest) {
  return GET(request)
}
