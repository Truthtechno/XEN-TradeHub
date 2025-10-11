/**
 * Video utility functions for handling different video sources
 * and optimizing YouTube embeds for minimal branding
 */

export interface VideoSource {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown'
  id?: string
  url: string
  embedUrl?: string
  thumbnailUrl?: string
}

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

/**
 * Extract video ID from Vimeo URL
 */
export function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

/**
 * Parse video URL and return video source information
 */
export function parseVideoUrl(url: string): VideoSource {
  // YouTube URLs
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = extractYouTubeId(url)
    if (id) {
      return {
        type: 'youtube',
        id,
        url,
        embedUrl: buildYouTubeEmbedUrl(id),
        thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
      }
    }
  }
  
  // Vimeo URLs
  if (url.includes('vimeo.com')) {
    const id = extractVimeoId(url)
    if (id) {
      return {
        type: 'vimeo',
        id,
        url,
        embedUrl: `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`,
        thumbnailUrl: `https://vumbnail.com/${id}.jpg`
      }
    }
  }
  
  // Direct video files
  if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i)) {
    return {
      type: 'direct',
      url
    }
  }
  
  return {
    type: 'unknown',
    url
  }
}

/**
 * Build YouTube embed URL with minimal branding parameters
 */
export function buildYouTubeEmbedUrl(videoId: string, options: {
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  start?: number
  end?: number
} = {}): string {
  const params = new URLSearchParams({
    'rel': '0',                    // Don't show related videos from other channels
    'showinfo': '0',              // Hide video title and uploader info
    'controls': '1',              // Show player controls
    'modestbranding': '1',        // Minimize YouTube branding (limited effect after Aug 2023)
    'iv_load_policy': '3',        // Hide video annotations
    'fs': '1',                    // Allow fullscreen
    'cc_load_policy': '0',        // Don't show captions by default
    'disablekb': '0',             // Allow keyboard controls
    'enablejsapi': '1',           // Enable JavaScript API
    'origin': typeof window !== 'undefined' ? window.location.origin : '',
    'playsinline': '1',           // Allow inline playback on mobile
    'autohide': '1'               // Auto-hide controls
  })
  
  // Add optional parameters
  if (options.autoplay) params.set('autoplay', '1')
  if (options.muted) params.set('mute', '1')
  if (options.loop) params.set('loop', '1')
  if (options.start) params.set('start', options.start.toString())
  if (options.end) params.set('end', options.end.toString())
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

/**
 * Get video thumbnail URL for different video sources
 */
export function getVideoThumbnail(videoSource: VideoSource, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string | null {
  switch (videoSource.type) {
    case 'youtube':
      if (!videoSource.id) return null
      const qualityMap = {
        default: 'default',
        medium: 'mqdefault',
        high: 'hqdefault',
        maxres: 'maxresdefault'
      }
      return `https://img.youtube.com/vi/${videoSource.id}/${qualityMap[quality]}.jpg`
    
    case 'vimeo':
      if (!videoSource.id) return null
      return `https://vumbnail.com/${videoSource.id}.jpg`
    
    default:
      return null
  }
}

/**
 * Check if a video URL is a direct video file
 */
export function isDirectVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url)
}

/**
 * Check if a video URL is a supported streaming platform
 */
export function isStreamingVideo(url: string): boolean {
  return url.includes('youtube.com') || 
         url.includes('youtu.be') || 
         url.includes('vimeo.com') ||
         url.includes('dailymotion.com') ||
         url.includes('twitch.tv')
}

/**
 * Get video duration from URL (requires API call for YouTube/Vimeo)
 * This is a placeholder - you'd need to implement API calls to get actual duration
 */
export async function getVideoDuration(url: string): Promise<number | null> {
  // For direct video files, you can use the HTML5 video element
  if (isDirectVideoFile(url)) {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        resolve(Math.floor(video.duration))
        video.remove()
      }
      video.onerror = () => {
        resolve(null)
        video.remove()
      }
      video.src = url
    })
  }
  
  // For YouTube/Vimeo, you'd need to use their respective APIs
  // This would require API keys and server-side implementation
  return null
}
