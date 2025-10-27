import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('=== FEATURES API CALLED ===')
  console.log('Request URL:', request.url)
  
  try {
    // Get authenticated user using the simple auth method
    const user = await getAuthenticatedUserSimple(request)
    
    console.log('Authenticated user:', user)
    
    if (!user) {
      console.log('No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User role:', user.role)

    // Only SUPERADMIN can access features management
    if (user.role !== 'SUPERADMIN') {
      console.log('User is not SUPERADMIN, role:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all ADMIN users (not SUPERADMIN or STUDENT)
    const users = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('Found admin users:', users)
    console.log('Total admin users:', users.length)

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    )
  }
}
