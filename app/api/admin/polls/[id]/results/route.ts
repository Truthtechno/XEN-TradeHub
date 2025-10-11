import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/admin/polls/[id]/results - Get poll results
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

    // Check if poll exists
    const poll = await prisma.poll.findUnique({
      where: { id: params.id }
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Get poll results
    const results = await prisma.pollVote.groupBy({
      by: ['option'],
      where: { pollId: params.id },
      _count: {
        option: true
      }
    })

    // Get all votes with user details
    const votes = await prisma.pollVote.findMany({
      where: { pollId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate totals
    const bullishVotes = results.find(r => r.option === 'BULLISH')?._count.option || 0
    const bearishVotes = results.find(r => r.option === 'BEARISH')?._count.option || 0
    const totalVotes = bullishVotes + bearishVotes

    // Calculate percentages
    const bullishPercentage = totalVotes > 0 ? (bullishVotes / totalVotes) * 100 : 0
    const bearishPercentage = totalVotes > 0 ? (bearishVotes / totalVotes) * 100 : 0

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        options: poll.options,
        isActive: poll.isActive,
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt
      },
      results: {
        totalVotes,
        bullishVotes,
        bearishVotes,
        bullishPercentage: Math.round(bullishPercentage * 100) / 100,
        bearishPercentage: Math.round(bearishPercentage * 100) / 100
      },
      votes
    })
  } catch (error) {
    console.error('Error fetching poll results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
