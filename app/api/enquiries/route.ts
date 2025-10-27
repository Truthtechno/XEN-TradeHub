import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { notifyUserEnquiry } from '@/lib/admin-notification-utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema for enquiry submission
const enquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  enquiryType: z.string().min(1, 'Enquiry type is required')
})

// POST /api/enquiries - Create a new enquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = enquirySchema.parse(body)
    
    // Create the enquiry in the database
    const enquiry = await prisma.enquiry.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        subject: validatedData.subject,
        message: validatedData.message,
        enquiryType: validatedData.enquiryType,
        status: 'NEW'
      }
    })

    // Notify admins about new enquiry
    await notifyUserEnquiry(
      validatedData.name,
      validatedData.email,
      validatedData.enquiryType,
      validatedData.subject,
      `/admin/enquiry`
    )

    return NextResponse.json({
      success: true,
      enquiry: {
        id: enquiry.id,
        name: enquiry.name,
        email: enquiry.email,
        subject: enquiry.subject,
        enquiryType: enquiry.enquiryType,
        status: enquiry.status,
        createdAt: enquiry.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating enquiry:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create enquiry' },
      { status: 500 }
    )
  }
}

// GET /api/enquiries - Get enquiries (for admin panel)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const enquiryType = searchParams.get('enquiryType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (enquiryType && enquiryType !== 'all') {
      where.enquiryType = enquiryType
    }

    // Get enquiries with pagination
    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.enquiry.count({ where })
    ])

    return NextResponse.json({
      success: true,
      enquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching enquiries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enquiries' },
      { status: 500 }
    )
  }
}
