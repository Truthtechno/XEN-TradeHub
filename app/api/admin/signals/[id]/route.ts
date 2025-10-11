import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/admin/signals/[id] - Get signal by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const signal = await prisma.signal.findUnique({
      where: { id: params.id },
      include: {
      }
    })

    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    return NextResponse.json(signal)
  } catch (error) {
    console.error('Error fetching signal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/signals/[id] - Update signal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const signalSchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      symbol: z.string().min(1).optional(),
      action: z.enum(['BUY', 'SELL']).optional(),
      entryPrice: z.number().positive().optional(),
      stopLoss: z.number().positive().optional(),
      takeProfit: z.number().positive().optional(),
      notes: z.string().optional(),
      imageUrl: z.string().optional(),
      visibility: z.enum(['DRAFT', 'EVERYONE', 'PREMIUM']).optional(),
      publishedAt: z.string().datetime().optional()
    })

    const validatedData = signalSchema.parse(body)

    // Get current signal data for audit log
    const currentSignal = await prisma.signal.findUnique({
      where: { id: params.id }
    })

    if (!currentSignal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    // Update signal
    const updatedSignal = await prisma.signal.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        symbol: validatedData.symbol,
        action: validatedData.action,
        direction: validatedData.action,
        entry: validatedData.entryPrice,
        entryPrice: validatedData.entryPrice,
        sl: validatedData.stopLoss,
        stopLoss: validatedData.stopLoss,
        tp: validatedData.takeProfit,
        takeProfit: validatedData.takeProfit,
        notes: validatedData.notes,
        imageUrl: validatedData.imageUrl,
        visibility: validatedData.visibility === 'EVERYONE' ? 'PUBLIC' : 
                   validatedData.visibility === 'PREMIUM' ? 'SUBSCRIBERS_ONLY' : 
                   validatedData.visibility === 'DRAFT' ? 'PRIVATE' : undefined,
        publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : 
                    validatedData.visibility && validatedData.visibility !== 'DRAFT' ? new Date() : undefined,
        status: validatedData.visibility === 'DRAFT' ? 'DRAFT' : 'ACTIVE'
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'UPDATE_SIGNAL',
        entity: 'Signal',
        entityId: params.id,
        diff: {
          before: {
            title: currentSignal.title,
            symbol: currentSignal.symbol,
            action: currentSignal.action,
            entryPrice: currentSignal.entryPrice,
            stopLoss: currentSignal.stopLoss,
            takeProfit: currentSignal.takeProfit,
            visibility: currentSignal.visibility
          },
          after: {
            title: updatedSignal.title,
            symbol: updatedSignal.symbol,
            action: updatedSignal.action,
            entryPrice: updatedSignal.entryPrice,
            stopLoss: updatedSignal.stopLoss,
            takeProfit: updatedSignal.takeProfit,
            visibility: updatedSignal.visibility
          }
        }
      }
    })

    return NextResponse.json(updatedSignal)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error updating signal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/signals/[id] - Delete signal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if signal exists
    const signal = await prisma.signal.findUnique({
      where: { id: params.id }
    })

    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    // Delete signal
    await prisma.signal.delete({
      where: { id: params.id }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'DELETE_SIGNAL',
        entity: 'Signal',
        entityId: params.id,
        diff: {
          symbol: signal.symbol,
          direction: signal.direction,
          entry: signal.entry,
          sl: signal.sl,
          tp: signal.tp
        }
      }
    })

    return NextResponse.json({ message: 'Signal deleted successfully' })
  } catch (error) {
    console.error('Error deleting signal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
