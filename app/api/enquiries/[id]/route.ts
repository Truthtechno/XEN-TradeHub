import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema for enquiry updates
const updateEnquirySchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  responseAt: z.string().optional()
})

// PATCH /api/enquiries/[id] - Update enquiry status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Validate the request body
    const validatedData = updateEnquirySchema.parse(body)
    
    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.status) {
      updateData.status = validatedData.status
    }
    
    if (validatedData.responseAt) {
      updateData.responseAt = new Date(validatedData.responseAt)
    }

    // Update the enquiry
    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      enquiry: {
        id: enquiry.id,
        name: enquiry.name,
        email: enquiry.email,
        subject: enquiry.subject,
        message: enquiry.message,
        enquiryType: enquiry.enquiryType,
        status: enquiry.status,
        responseAt: enquiry.responseAt,
        createdAt: enquiry.createdAt,
        updatedAt: enquiry.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating enquiry:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update enquiry' },
      { status: 500 }
    )
  }
}

// DELETE /api/enquiries/[id] - Delete enquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Delete the enquiry
    await prisma.enquiry.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Enquiry deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting enquiry:', error)
    return NextResponse.json(
      { error: 'Failed to delete enquiry' },
      { status: 500 }
    )
  }
}
