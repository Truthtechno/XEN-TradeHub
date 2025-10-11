import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { DocumentParser } from '@/lib/document-parser'
import { readFile } from 'fs/promises'

// Force dynamic rendering
export const dynamic = 'force-dynamic'





import { join } from 'path'



export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // Validate that the URL is from our uploads directory
    if (!url.startsWith('/uploads/') && !url.startsWith(process.env.NEXT_PUBLIC_BASE_URL + '/uploads/')) {
      return NextResponse.json({ error: 'Invalid document URL' }, { status: 400 })
    }

    // Get the file path and read the document
    const filePath = url.startsWith('/') ? url.substring(1) : url
    const fullPath = join(process.cwd(), 'public', filePath)
    
    try {
      const buffer = await readFile(fullPath)
      const filename = filePath.split('/').pop() || 'document'
      
      // Parse the document based on its type
      const parsedDoc = await DocumentParser.parseDocument(buffer, filename)
      
      // Ensure we always return valid JSON
      return NextResponse.json({
        success: true,
        content: parsedDoc.content || 'No content available',
        type: parsedDoc.type || 'text',
        metadata: parsedDoc.metadata || {},
        filename: filename
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        }
      })
      
    } catch (fileError) {
      console.error('Error reading file:', fileError)
      return NextResponse.json({ 
        success: false,
        error: 'Document not found or could not be read',
        content: 'The requested document could not be found or accessed.',
        type: 'error'
      }, { status: 404 })
    }

  } catch (error) {
    console.error('Error proxying document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
