import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Force dynamic rendering
export const dynamic = 'force-dynamic'





import { existsSync } from 'fs'



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

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file size (100MB max for videos, 10MB for other files)
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB for videos, 10MB for others
    if (file.size > maxSize) {
      const maxSizeMB = isVideo ? 100 : 10
      return NextResponse.json({ error: `File too large. Maximum size is ${maxSizeMB}MB` }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/epub+zip',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Write file to disk
    await writeFile(filePath, buffer)

    // Return the public URL
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
