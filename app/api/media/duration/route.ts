import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'Media URL is required' }, { status: 400 })
    }

    // Validate that the URL is from our uploads directory
    if (!url.startsWith('/uploads/') && !url.startsWith(process.env.NEXT_PUBLIC_BASE_URL + '/uploads/')) {
      return NextResponse.json({ error: 'Invalid media URL' }, { status: 400 })
    }

    // Get the file path
    const filePath = url.startsWith('/') ? url.substring(1) : url
    const fullPath = join(process.cwd(), 'public', filePath)
    
    try {
      // Check if file exists
      await fs.access(fullPath)
      
      // Get file stats to check if it's a valid media file
      const stats = await fs.stat(fullPath)
      
      if (!stats.isFile()) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }

      // Get more accurate duration estimation
      const duration = await getMediaDuration(fullPath, stats.size)
      
      return NextResponse.json({
        success: true,
        duration: duration,
        durationInSeconds: duration
      })

    } catch (fileError) {
      console.error('Error reading file:', fileError)
      return NextResponse.json({ 
        success: false,
        error: 'Media file not found or could not be read',
        duration: 0
      }, { status: 404 })
    }

  } catch (error) {
    console.error('Error getting media duration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getMediaDuration(filePath: string, fileSize: number): Promise<number> {
  try {
    const fileSizeInMB = fileSize / (1024 * 1024)
    const extension = filePath.toLowerCase().split('.').pop()
    
    // More sophisticated estimation based on file type and size
    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension || '')) {
      // Video files - estimate based on bitrate assumptions
      // Assume average bitrate of 1-2 Mbps for typical video content
      const estimatedBitrate = 1500000 // 1.5 Mbps in bits per second
      const estimatedDuration = (fileSize * 8) / estimatedBitrate // Convert bytes to bits, then divide by bitrate
      
      // Clamp between 30 seconds and 4 hours
      return Math.max(30, Math.min(14400, Math.floor(estimatedDuration)))
      
    } else if (['mp3', 'wav', 'aac', 'ogg', 'm4a'].includes(extension || '')) {
      // Audio files - estimate based on typical bitrates
      let estimatedBitrate = 128000 // 128 kbps default
      
      if (extension === 'wav') {
        estimatedBitrate = 1411000 // 1411 kbps for CD quality
      } else if (extension === 'aac' || extension === 'm4a') {
        estimatedBitrate = 256000 // 256 kbps for high quality AAC
      } else if (extension === 'ogg') {
        estimatedBitrate = 192000 // 192 kbps for OGG
      }
      
      const estimatedDuration = (fileSize * 8) / estimatedBitrate
      
      // Clamp between 10 seconds and 2 hours
      return Math.max(10, Math.min(7200, Math.floor(estimatedDuration)))
    }
    
    // Default fallback for unknown types
    return 60
    
  } catch (error) {
    console.error('Error calculating duration:', error)
    return 60 // Default 1 minute
  }
}
