import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// POST /api/admin/signals/[id]/publish - Publish a signal
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== PUBLISH SIGNAL API CALL ===')
    console.log('Signal ID:', params.id)
    
    // Use simple authentication that works
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      console.log('Publish signal - No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      console.log('Publish signal - User role not authorized:', user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Publish signal - User authorized:', user.name, user.role)

    const signalId = params.id

    // Check if signal exists
    const existingSignal = await prisma.signal.findUnique({
      where: { id: signalId }
    })

    if (!existingSignal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    // Update the signal to set publishedAt to current time
    const updatedSignal = await prisma.signal.update({
      where: { id: signalId },
      data: { 
        publishedAt: new Date()
      },
      include: {
      }
    })

    // Create a corresponding forecast for all published signals
    const forecastTitle = `${updatedSignal.symbol} ${updatedSignal.direction} Signal`
    const forecastDescription = `Trading signal for ${updatedSignal.symbol}. Direction: ${updatedSignal.direction}, Entry: ${updatedSignal.entry}, SL: ${updatedSignal.sl}, TP: ${updatedSignal.tp}. ${updatedSignal.notes || ''}`
    
    await prisma.forecast.create({
      data: {
        title: forecastTitle,
        description: forecastDescription,
        pair: updatedSignal.symbol,
        isPublic: updatedSignal.visibility === 'PUBLIC', // true for PUBLIC, false for SUBSCRIBERS_ONLY
        imageUrl: updatedSignal.imageUrl
      }
    })
    
    console.log(`Created corresponding forecast for ${updatedSignal.visibility} signal:`, updatedSignal.symbol)

    // Create a NEW notification for the forecast
    const newNotification = await prisma.newNotification.create({
      data: {
        userId: 'system', // System notification
        title: 'New Forecast Available',
        message: `${updatedSignal.symbol} ${updatedSignal.direction} signal has been published`,
        type: 'forecast',
        isRead: false
      }
    })

    console.log('Created NEW notification for forecast:', newNotification.id)

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'PUBLISH_SIGNAL',
        entity: 'Signal',
        entityId: updatedSignal.id,
        diff: {
          symbol: updatedSignal.symbol,
          publishedAt: updatedSignal.publishedAt
        }
      }
    })

    console.log('Signal published successfully:', updatedSignal.symbol)
    return NextResponse.json({ 
      signal: updatedSignal,
      notification: newNotification
    })
  } catch (error) {
    console.error('Error publishing signal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
