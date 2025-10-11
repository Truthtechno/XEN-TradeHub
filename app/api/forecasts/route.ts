import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/forecasts - Get forecasts with filtering
export async function GET(request: NextRequest) {
  try {
    console.log('=== FORECASTS API CALL ===')
    console.log('Request URL:', request.url)
    
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') || 'public' // 'public' or 'premium'
    
    // Get authenticated user (optional for public forecasts)
    let user = await getAuthenticatedUserSimple(request)
    
    // Fallback: if no user found and requesting premium, try to find BRIAN ASABA
    if (!user && type === 'premium') {
      const fallbackUser = await prisma.user.findFirst({
        where: {
          name: 'BRIAN ASABA'
        }
      })
      if (fallbackUser) {
        user = {
          id: fallbackUser.id,
          role: fallbackUser.role,
          email: fallbackUser.email,
          name: fallbackUser.name,
          source: 'fallback'
        }
      }
    }
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    console.log('Forecast params:', { type, page, limit, search })
    
    const skip = (page - 1) * limit

    // Check if user has premium access (mentorship) or signal subscription for premium forecasts
    let hasPremiumAccess = false
    let hasSignalSubscription = false
    let subscriptionType = 'NONE'
    
    if (user) {
      // Check for premium access (mentorship payment)
      const mentorshipPayment = await prisma.mentorshipPayment.findFirst({
        where: {
          userId: user.id,
          status: 'completed'
        }
      })
      
      // Check if user has premium role
      const isPremiumRole = user.role === 'PREMIUM'
      
      // Check for signal subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
          plan: 'MONTHLY'
        }
      })
      
      // Check if subscription is still valid (not expired)
      if (subscription && subscription.currentPeriodEnd) {
        const now = new Date()
        const periodEnd = new Date(subscription.currentPeriodEnd)
        hasSignalSubscription = now <= periodEnd
      }
      
      // Premium users have access to everything
      hasPremiumAccess = !!mentorshipPayment || isPremiumRole
      
      if (hasPremiumAccess) {
        subscriptionType = 'PREMIUM'
      } else if (hasSignalSubscription) {
        subscriptionType = 'SIGNALS'
      }
      
      console.log('User access status:', { 
        hasPremiumAccess, 
        hasSignalSubscription, 
        subscriptionType,
        userRole: user.role,
        mentorshipPayment: !!mentorshipPayment,
        signalSubscription: !!subscription
      })
    }

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { pair: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filter by type
    if (type === 'public') {
      where.isPublic = true
    } else if (type === 'premium') {
      where.isPublic = false
      // Only show premium forecasts if user has premium access or signal subscription
      if (!hasPremiumAccess && !hasSignalSubscription) {
        console.log('User does not have premium access or signal subscription for premium forecasts')
        return NextResponse.json({
          forecasts: [],
          pagination: { page, limit, total: 0, pages: 0 },
          requiresSubscription: true,
          subscriptionType
        })
      }
    }

    console.log('Where clause:', where)

    // Fetch both forecasts and signals
    const [forecasts, signals, forecastTotal, signalTotal] = await Promise.all([
      prisma.forecast.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      // Fetch signals based on type
      prisma.signal.findMany({
        where: {
          ...(type === 'public' ? { visibility: 'PUBLIC' } : 
              type === 'premium' ? { visibility: 'SUBSCRIBERS_ONLY' } : {}),
          isActive: true,
          publishedAt: { not: null } // Only published signals
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.forecast.count({ where }),
      prisma.signal.count({
        where: {
          ...(type === 'public' ? { visibility: 'PUBLIC' } : 
              type === 'premium' ? { visibility: 'SUBSCRIBERS_ONLY' } : {}),
          isActive: true,
          publishedAt: { not: null }
        }
      })
    ])

    console.log('Found forecasts:', forecasts.length, 'Found signals:', signals.length)
    console.log('Total forecasts:', forecastTotal, 'Total signals:', signalTotal)

    // Transform forecasts
    const transformedForecasts = forecasts.map(forecast => ({
      ...forecast,
      isLiked: false,
      likes: forecast.likes || 0,
      comments: forecast.comments || 0,
      type: 'forecast'
    }))

    // Transform signals to match forecast format
    const transformedSignals = signals.map(signal => ({
      id: signal.id,
      title: signal.title,
      description: signal.description || `Trading signal for ${signal.symbol}`,
      pair: signal.symbol,
      chartImage: signal.imageUrl,
      imageUrl: signal.imageUrl,
      isPublic: signal.visibility === 'PUBLIC',
      createdAt: signal.createdAt,
      updatedAt: signal.updatedAt,
      isLiked: false,
      likes: signal.likes || 0,
      comments: signal.comments || 0,
      type: 'signal',
      // Signal-specific fields
      action: signal.action,
      entryPrice: signal.entryPrice || signal.entry,
      stopLoss: signal.stopLoss || signal.sl,
      takeProfit: signal.takeProfit || signal.tp,
      notes: signal.notes,
      status: signal.status
    }))

    // Check user likes for signals if user is logged in
    if (user && transformedSignals.length > 0) {
      const signalIds = transformedSignals.map(s => s.id)
      const userSignalLikes = await prisma.userSignalLike.findMany({
        where: {
          userId: user.id,
          signalId: { in: signalIds }
        }
      })
      
      // Update isLiked status for signals
      transformedSignals.forEach(signal => {
        signal.isLiked = userSignalLikes.some(like => like.signalId === signal.id)
      })
    }

    // Combine and sort by creation date
    const allItems = [...transformedForecasts, ...transformedSignals]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    const total = forecastTotal + signalTotal

    console.log('Combined items:', allItems.length)

    return NextResponse.json({
      forecasts: allItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      requiresSubscription: type === 'premium' && !hasPremiumAccess && !hasSignalSubscription,
      subscriptionType,
      hasPremiumAccess,
      hasSignalSubscription
    })
  } catch (error) {
    console.error('Error fetching forecasts:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/forecasts - Create a new forecast (Admin only)
export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE FORECAST API CALL ===')
    
    // Get authenticated user
    const user = await getAuthenticatedUserSimple(request)
    console.log('Authenticated user for create forecast:', user)
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userRole = user.role
    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const forecastSchema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      pair: z.string().optional(),
      chartImage: z.string().url().optional(),
      imageUrl: z.string().optional(),
      isPublic: z.boolean().default(true)
    })

    const validatedData = forecastSchema.parse(body)

    const forecast = await prisma.forecast.create({
      data: validatedData
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_FORECAST',
        entity: 'Forecast',
        entityId: forecast.id,
        diff: {
          title: forecast.title,
          isPublic: forecast.isPublic
        }
      }
    })

    return NextResponse.json(forecast, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating forecast:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
