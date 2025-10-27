import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        affiliateProgram: true
      }
    })

    if (!user?.affiliateProgram) {
      return NextResponse.json({ error: 'Not registered as affiliate' }, { status: 404 })
    }

    const payouts = await prisma.affiliatePayout.findMany({
      where: {
        affiliateProgramId: user.affiliateProgram.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
