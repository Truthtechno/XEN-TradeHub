import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { PrismaClient } from '@prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Simple Forecasts API - Starting request')
    
    const token = await getToken({ req: request })
    console.log('Simple Forecasts API - Token:', token ? 'Present' : 'Not present')
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'public'
    const limit = parseInt(searchParams.get('limit') || '1')
    
    console.log('Simple Forecasts API - Type:', type, 'Limit:', limit)
    
    // Simple query without complex includes
    const forecasts = await prisma.forecast.findMany({
      where: {
        isPublic: type === 'public'
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        pair: true,
        chartImage: true,
        isPublic: true,
        createdAt: true,
        likes: true,
      }
    })
    
    console.log('Simple Forecasts API - Found forecasts:', forecasts.length)
    
    return NextResponse.json({
      forecasts,
      message: 'Simple forecasts API working!'
    })
    
  } catch (error) {
    console.error('Simple Forecasts API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
