import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







// GET /api/admin/resources - Get all resources with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category') || 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }
    
    if (type !== 'all') {
      where.type = type
    }
    
    if (category !== 'all') {
      where.category = category
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          type: true,
          category: true,
          url: true,
          thumbnail: true,
          duration: true,
          isPremium: true,
          priceUSD: true,
          tags: true,
          likes: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.resource.count({ where })
    ])

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/resources - Create a new resource
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR']
    
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    const resourceSchema = z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(['VIDEO', 'PODCAST', 'EBOOK', 'ARTICLE']),
      category: z.string().min(1),
      url: z.string().optional(), // Allow both URLs and relative paths for uploaded files
      thumbnail: z.string().optional(), // Allow relative paths for uploaded files
      duration: z.number().min(0).nullable().optional(), // Allow null values
      isPremium: z.boolean().default(false),
      priceUSD: z.number().min(0).nullable().optional(), // Price in USD for premium resources
      tags: z.array(z.string()).default([]),
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

    let validatedData;
    try {
      validatedData = resourceSchema.parse(body)
    } catch (error) {
      console.error('Validation error:', error)
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error instanceof Error ? error.message : 'Unknown validation error' 
      }, { status: 400 })
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

    // Generate unique slug if it already exists
    let finalSlug = validatedData.slug
    let counter = 1
    
    while (true) {
      const existingResource = await prisma.resource.findUnique({
        where: { slug: finalSlug }
      })
      
      if (!existingResource) {
        break
      }
      
      finalSlug = `${validatedData.slug}-${counter}`
      counter++
    }

    // Create resource with publishedAt set to current time
    const resource = await prisma.resource.create({
      data: {
        ...validatedData,
        slug: finalSlug,
        publishedAt: new Date() // Set as published when created
      },
    })

    // Log the action
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'CREATE_RESOURCE',
          entity: 'Resource',
          entityId: resource.id,
          diff: {
            title: resource.title,
            type: resource.type,
            category: resource.category,
            isPremium: resource.isPremium
          }
        }
      })
    } catch (error) {
      console.log('Skipping audit log creation:', error instanceof Error ? error.message : 'Unknown error')
    }

    // Create NEW notification for the resources page (skip if no system user exists)
    try {
      const systemUser = await prisma.user.findFirst({
        where: { role: 'SUPERADMIN' }
      })
      
      if (systemUser) {
        await prisma.newNotification.create({
          data: {
            userId: systemUser.id,
            title: 'New Resource Available!',
            message: `Check out the new ${resource.type.toLowerCase()}: "${resource.title}"`,
            type: 'resource',
            isRead: false
          }
        })
      }
    } catch (error) {
      console.log('Skipping system notification creation:', error instanceof Error ? error.message : 'Unknown error')
    }

    // Create user notifications for all students about the new resource
    try {
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true }
      })

      if (students.length > 0) {
        await prisma.notification.createMany({
          data: students.map(student => ({
            userId: student.id,
            title: 'New Resource Available!',
            message: `A new ${resource.type.toLowerCase()} "${resource.title}" has been added to the resource library. ${resource.isPremium ? `Premium content - $${resource.priceUSD}` : 'Free to access!'}`,
            type: 'UPDATE',
            actionUrl: '/resources',
            isRead: false
          }))
        })
      }
    } catch (error) {
      console.log('Skipping student notifications creation:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating resource:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
