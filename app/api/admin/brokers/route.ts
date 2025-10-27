import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { notifyNewBroker } from '@/lib/user-notification-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('[Brokers GET] Fetching brokers...')
    const user = await getAuthenticatedUserSimple(request)
    
    console.log('[Brokers GET] User:', user ? `${user.email} (${user.role})` : 'null')
    
    if (!user) {
      console.log('[Brokers GET] Unauthorized - no user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      console.log('[Brokers GET] Forbidden - user role:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('[Brokers GET] Fetching from database...')
    const brokers = await prisma.broker.findMany({
      include: {
        _count: {
          select: { accountOpenings: true }
        }
      },
      orderBy: { displayOrder: 'asc' }
    })

    console.log('[Brokers GET] Found', brokers.length, 'brokers')
    console.log('[Brokers GET] Brokers:', brokers.map(b => b.name).join(', '))

    return NextResponse.json({ brokers })
  } catch (error) {
    console.error('[Brokers GET] Error fetching brokers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Broker API] POST request received')
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('[Broker API] Unauthorized - no user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Broker API] Authenticated user:', user.email, 'Role:', user.role)

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      console.log('[Broker API] Forbidden - user role:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    console.log('[Broker API] Request body:', body)
    const { name, slug, description, logoUrl, referralLink, benefits, newAccountSteps, existingAccountSteps, isActive, displayOrder, notes } = body

    if (!name || !slug || !referralLink) {
      console.log('[Broker API] Missing required fields:', { name, slug, referralLink })
      return NextResponse.json({ error: 'Missing required fields: name, slug, and referralLink are required' }, { status: 400 })
    }

    console.log('[Broker API] Creating broker with data:', {
      name, slug, description, logoUrl, referralLink, benefits, newAccountSteps, existingAccountSteps, isActive, displayOrder, notes
    })

    const broker = await prisma.broker.create({
      data: {
        name,
        slug,
        description,
        logoUrl,
        referralLink,
        benefits: benefits || [],
        newAccountSteps: newAccountSteps || null,
        existingAccountSteps: existingAccountSteps || null,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder || 0,
        notes
      }
    })

    console.log('[Broker API] Broker created successfully:', broker.id)

    // Notify all users about new broker
    if (broker.isActive) {
      await notifyNewBroker(
        broker.name,
        description || 'Start trading with our new partner broker',
        `/brokers`
      )
    }

    return NextResponse.json({ broker })
  } catch (error) {
    console.error('[Broker API] Error creating broker:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
