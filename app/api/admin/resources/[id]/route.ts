import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






// GET /api/admin/resources/[id] - Get resource by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resource = await prisma.resource.findUnique({
      where: { id: params.id }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/resources/[id] - Update resource
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const resourceSchema = z.object({
      title: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      type: z.enum(['VIDEO', 'PODCAST', 'EBOOK', 'ARTICLE']).optional(),
      category: z.string().min(1).optional(),
      url: z.string().optional(), // Allow both URLs and relative paths for uploaded files
      thumbnail: z.string().optional(), // Allow relative paths for uploaded files
      duration: z.number().min(0).nullable().optional(), // Allow null values
      isPremium: z.boolean().optional(),
      priceUSD: z.number().min(0).nullable().optional(), // Price in USD for premium resources
      tags: z.array(z.string()).optional(),
      courseId: z.string().optional()
    }).refine((data) => {
      // If isPremium is true, priceUSD should be provided
      if (data.isPremium && (!data.priceUSD || data.priceUSD <= 0)) {
        return false;
      }
      return true;
    }, {
      message: "Price is required for premium resources",
      path: ["priceUSD"]
    })

    const validatedData = resourceSchema.parse(body)

    // Get current resource data for audit log
    const currentResource = await prisma.resource.findUnique({
      where: { id: params.id }
    })

    if (!currentResource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Check if course exists (if courseId is provided)
    if (validatedData.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: validatedData.courseId }
      })

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }
    }

    // Update resource
    const updatedResource = await prisma.resource.update({
      where: { id: params.id },
      data: validatedData
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'UPDATE_RESOURCE',
        entity: 'Resource',
        entityId: params.id,
        diff: {
          before: {
            title: currentResource.title,
            type: currentResource.type,
            category: currentResource.category,
            isPremium: currentResource.isPremium
          },
          after: {
            title: updatedResource.title,
            type: updatedResource.type,
            category: updatedResource.category,
            isPremium: updatedResource.isPremium
          }
        }
      }
    })

    return NextResponse.json(updatedResource)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error updating resource:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/resources/[id] - Delete resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: params.id }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Delete resource
    await prisma.resource.delete({
      where: { id: params.id }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'DELETE_RESOURCE',
        entity: 'Resource',
        entityId: params.id,
        diff: {
          title: resource.title,
          type: resource.type,
          category: resource.category
        }
      }
    })

    return NextResponse.json({ message: 'Resource deleted successfully' })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
