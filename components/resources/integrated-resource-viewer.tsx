'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Clock, Download, ExternalLink, FileText, Headphones, Heart, Maximize, Minimize, Pause, Play, Share2, Video, Volume2, VolumeX, X, Lock } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { DocumentViewer } from './document-viewer'

interface Resource {
  id: string
  title: string
  description: string
  type: 'VIDEO' | 'PODCAST' | 'EBOOK' | 'ARTICLE'
  category: string
  url: string | null
  thumbnail: string | null
  duration: number | null
  isPremium: boolean
  priceUSD: number | null
  tags: string[]
  likes: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

interface IntegratedResourceViewerProps {
  resource: Resource
  isOpen: boolean
  onClose: () => void
  onLike?: (resourceId: string) => void
  onShare?: (resourceId: string) => void
  likedResources?: Set<string>
}

export function IntegratedResourceViewer({ 
  resource, 
  isOpen, 
  onClose, 
  onLike, 
  onShare,
  likedResources = new Set()
}: IntegratedResourceViewerProps) {
  const { isDarkMode } = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  // Use the likedResources prop to determine if this resource is liked
  const isLiked = likedResources.has(resource.id)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const [resourcePrice, setResourcePrice] = useState<number | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Check access when component opens
  useEffect(() => {
    if (isOpen && resource) {
      checkAccess()
    }
  }, [isOpen, resource])

  const checkAccess = async () => {
    console.log('Checking access for resource:', resource?.id, 'isPremium:', resource?.isPremium)
    
    if (!resource?.isPremium) {
      console.log('Resource is not premium, granting access')
      setHasAccess(true)
      return
    }

    setIsCheckingAccess(true)
    try {
      console.log('Making access check request for premium resource:', resource.id)
      const response = await fetch('/api/resources/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ resourceId: resource.id })
      })

      const data = await response.json()
      console.log('Access check response:', data)
      
      setHasAccess(data.hasAccess)
      setResourcePrice(data.priceUSD)
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
    } finally {
      setIsCheckingAccess(false)
    }
  }

  // Format duration helper
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
    // For durations less than 1 minute, show seconds
    if (minutes === 0) {
      return `${secs}s`
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return Video
      case 'PODCAST': return Headphones
      case 'EBOOK': return BookOpen
      case 'ARTICLE': return FileText
      default: return FileText
    }
  }

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'PODCAST': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'EBOOK': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ARTICLE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Handle play/pause
  const togglePlayPause = () => {
    if (resource.type === 'VIDEO' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    } else if (resource.type === 'PODCAST' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
    setIsPlaying(!isPlaying)
  }

  // Handle mute/unmute
  const toggleMute = () => {
    if (resource.type === 'VIDEO' && videoRef.current) {
      videoRef.current.muted = !isMuted
    } else if (resource.type === 'PODCAST' && audioRef.current) {
      audioRef.current.muted = !isMuted
    }
    setIsMuted(!isMuted)
  }


  // Handle like
  const handleLike = () => {
    if (onLike) {
      onLike(resource.id)
    }
  }

  // Handle share
  const handleShare = () => {
    if (onShare) {
      onShare(resource.id)
    }
  }

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!videoRef.current) return

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen()
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when the resource viewer is open
      if (!isOpen) return

      // F key for fullscreen toggle
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault()
        toggleFullscreen()
      }
      // Space key for play/pause
      else if (event.key === ' ') {
        event.preventDefault()
        togglePlayPause()
      }
      // M key for mute toggle
      else if (event.key === 'm' || event.key === 'M') {
        event.preventDefault()
        toggleMute()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, isFullscreen])

  // Update time
  const updateTime = () => {
    const current = resource.type === 'VIDEO' 
      ? (videoRef.current?.currentTime || 0)
      : (audioRef.current?.currentTime || 0)
    setCurrentTime(current)
  }

  // Set duration
  const setMediaDuration = () => {
    const dur = resource.type === 'VIDEO' 
      ? (videoRef.current?.duration || 0)
      : (audioRef.current?.duration || 0)
    setDuration(dur)
  }

  // Handle time update
  useEffect(() => {
    const mediaElement = resource.type === 'VIDEO' ? videoRef.current : audioRef.current
    if (mediaElement) {
      mediaElement.addEventListener('timeupdate', updateTime)
      mediaElement.addEventListener('loadedmetadata', setMediaDuration)
      mediaElement.addEventListener('ended', () => setIsPlaying(false))
      
      return () => {
        mediaElement.removeEventListener('timeupdate', updateTime)
        mediaElement.removeEventListener('loadedmetadata', setMediaDuration)
        mediaElement.removeEventListener('ended', () => setIsPlaying(false))
      }
    }
  }, [resource.type])

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const isScrollable = contentRef.current.scrollHeight > contentRef.current.clientHeight
        setShowScrollIndicator(isScrollable)
      }
    }

    checkScrollable()
    window.addEventListener('resize', checkScrollable)
    
    return () => window.removeEventListener('resize', checkScrollable)
  }, [resource])

  if (!isOpen) return null

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking access...</p>
        </div>
      </div>
    )
  }

  // Show payment prompt for premium resources without access
  if (resource.isPremium && !hasAccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Premium Content
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This resource requires payment to access
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{resource.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{resource.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${resource.priceUSD}
                </span>
                <Badge className={getTypeBadgeColor(resource.type)}>
                  {resource.type}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1"
            >
              Sign In to Purchase
            </Button>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        ref={containerRef}
        className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700 gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-shrink-0">
              {React.createElement(getTypeIcon(resource.type), { className: "h-4 w-4 sm:h-5 sm:w-5" })}
              <Badge className={`${getTypeBadgeColor(resource.type)} text-xs sm:text-sm`}>
                {resource.type}
              </Badge>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white line-clamp-2">
                {resource.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {resource.category} • {resource.duration ? formatDuration(resource.duration) : 'Unknown duration'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${isLiked ? 'text-red-500' : 'text-gray-500'} h-8 w-8 sm:h-9 sm:w-9 p-0`}
            >
              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="ml-1 text-xs sm:text-sm hidden sm:inline">{resource.likes + (isLiked ? 1 : 0)}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500 h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div 
          ref={contentRef}
          className="p-3 sm:p-6 overflow-y-auto flex-1 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent relative"
        >
          {/* Media Player */}
          {(resource.type === 'VIDEO' || resource.type === 'PODCAST') && (
            <div className="mb-4 sm:mb-6">
              <div className="relative bg-black rounded-lg overflow-hidden">
                {resource.type === 'VIDEO' ? (
                  <video
                    ref={videoRef}
                    src={resource.url || ''}
                    poster={resource.thumbnail || ''}
                    className="w-full h-auto max-h-[50vh] sm:max-h-[60vh]"
                    controls={false}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    playsInline
                    webkit-playsinline="true"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 sm:h-64 bg-gray-100 dark:bg-gray-800">
                    <div className="text-center">
                      <Headphones className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-2 sm:mb-4" />
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Audio Player</p>
                    </div>
                    <audio
                      ref={audioRef}
                      src={resource.url || ''}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                )}
                
                {/* Custom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 sm:p-4">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <Button
                      onClick={togglePlayPause}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white h-8 w-8 sm:h-9 sm:w-9 p-0"
                      title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                    >
                      {isPlaying ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                    
                    <div className="flex-1 bg-white/20 rounded-full h-1">
                      <div 
                        className="bg-white rounded-full h-1 transition-all duration-200"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                    
                    <span className="text-white text-xs sm:text-sm whitespace-nowrap">
                      {formatDuration(currentTime)} / {formatDuration(duration)}
                    </span>
                    
                    <Button
                      onClick={toggleMute}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white h-8 w-8 sm:h-9 sm:w-9 p-0"
                      title={isMuted ? "Unmute (M)" : "Mute (M)"}
                    >
                      {isMuted ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                    
                    <Button
                      onClick={toggleFullscreen}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white h-8 w-8 sm:h-9 sm:w-9 p-0"
                      title={isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"}
                    >
                      {isFullscreen ? <Minimize className="h-3 w-3 sm:h-4 sm:w-4" /> : <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Document Viewer */}
          {(resource.type === 'EBOOK' || resource.type === 'ARTICLE') && (
            <div className="mb-4 sm:mb-6 -mx-3 sm:mx-0">
              <div className="h-[60vh] sm:h-[65vh] border-0 sm:border border-gray-200 dark:border-gray-700 sm:rounded-lg overflow-hidden">
                {resource.url ? (
                  <DocumentViewer
                    url={resource.url}
                    title={resource.title}
                    type={resource.type}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-2 sm:mb-4" />
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Document not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resource Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Description</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{resource.description}</p>
              </div>
              
              {resource.tags && resource.tags.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Tags</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Published</span>
                <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                  {resource.publishedAt ? formatDate(resource.publishedAt) : 'Draft'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Duration</span>
                <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                  {resource.duration ? formatDuration(resource.duration) : 'Unknown'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Likes</span>
                <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                  {resource.likes + (isLiked ? 1 : 0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          {showScrollIndicator && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs animate-bounce">
              Scroll for more
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
