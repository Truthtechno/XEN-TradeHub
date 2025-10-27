import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

export async function GET(request: NextRequest) {
  try {
    // Use the same auth pattern as other working endpoints
    const authUser = await getAuthenticatedUserSimple(request)
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        affiliateProgram: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ affiliate: user.affiliateProgram })
  } catch (error) {
    console.error('Error fetching affiliate program:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
