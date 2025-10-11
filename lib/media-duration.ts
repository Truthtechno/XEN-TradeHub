/**
 * Client-side media duration detection using HTML5 video/audio elements
 */

export interface MediaDurationResult {
  success: boolean
  duration: number
  error?: string
}

export async function getMediaDuration(url: string, type: 'VIDEO' | 'PODCAST'): Promise<MediaDurationResult> {
  return new Promise((resolve) => {
    try {
      console.log(`🎬 Attempting to detect duration for ${type}: ${url}`)
      
      // Create a temporary media element
      const mediaElement = type === 'VIDEO' 
        ? document.createElement('video') 
        : document.createElement('audio')
      
      // Configure the media element
      mediaElement.crossOrigin = 'anonymous'
      mediaElement.preload = 'metadata'
      mediaElement.muted = true // Mute to avoid audio issues
      
      let isResolved = false
      
      // Set up event listeners
      const handleLoadedMetadata = () => {
        if (isResolved) return
        isResolved = true
        
        const duration = Math.floor(mediaElement.duration)
        console.log(`✅ Media loaded successfully. Duration: ${duration}s`)
        
        // Clean up
        mediaElement.remove()
        clearTimeout(timeout)
        
        resolve({
          success: true,
          duration: duration
        })
      }
      
      const handleError = (event: Event) => {
        if (isResolved) return
        isResolved = true
        
        console.error(`❌ Media load error:`, event)
        
        // Clean up
        mediaElement.remove()
        clearTimeout(timeout)
        
        resolve({
          success: false,
          duration: 0,
          error: 'Failed to load media metadata'
        })
      }
      
      const handleTimeout = () => {
        if (isResolved) return
        isResolved = true
        
        console.error(`⏰ Media load timeout after 10 seconds`)
        
        // Clean up
        mediaElement.remove()
        
        resolve({
          success: false,
          duration: 0,
          error: 'Timeout loading media metadata'
        })
      }
      
      // Set up event listeners
      mediaElement.addEventListener('loadedmetadata', handleLoadedMetadata)
      mediaElement.addEventListener('error', handleError)
      mediaElement.addEventListener('canplay', handleLoadedMetadata) // Alternative event
      
      // Set timeout to prevent hanging
      const timeout = setTimeout(handleTimeout, 10000) // 10 second timeout
      
      // Start loading the media
      console.log(`🔄 Starting media load...`)
      mediaElement.src = url
      mediaElement.load()
      
    } catch (error) {
      console.error(`💥 Error in getMediaDuration:`, error)
      resolve({
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
}

/**
 * Fallback duration estimation based on file size and type
 */
export function estimateDurationFromFileSize(fileSize: number, type: 'VIDEO' | 'PODCAST'): number {
  const fileSizeInMB = fileSize / (1024 * 1024)
  
  if (type === 'VIDEO') {
    // Estimate based on typical video bitrates (1-2 Mbps)
    const estimatedBitrate = 1500000 // 1.5 Mbps
    const estimatedDuration = (fileSize * 8) / estimatedBitrate
    return Math.max(30, Math.min(14400, Math.floor(estimatedDuration))) // 30 seconds to 4 hours
  } else {
    // Estimate based on typical audio bitrates (128-256 kbps)
    const estimatedBitrate = 192000 // 192 kbps
    const estimatedDuration = (fileSize * 8) / estimatedBitrate
    return Math.max(10, Math.min(7200, Math.floor(estimatedDuration))) // 10 seconds to 2 hours
  }
}
