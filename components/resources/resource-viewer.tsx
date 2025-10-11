'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookOpen, Calendar, CreditCard, Download, ExternalLink, Eye, FileText, Globe, Headphones, Heart, MessageCircle, Pause, Play, Video, Volume2, VolumeX } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { PaymentPortal } from '@/components/payment/payment-portal'

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
  tags: string[]
  likes: number
  createdAt: string
  updatedAt: string
}


interface ResourceViewerProps {
  resource: Resource | null
  isOpen: boolean
  onClose: () => void
  onLike: (resourceId: string) => void
  likedResources: Set<string>
}

export function ResourceViewer({ resource, isOpen, onClose, onLike, likedResources }: ResourceViewerProps) {
  const { isDarkMode } = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasAccess, setHasAccess] = useState(true)
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const [resourcePrice, setResourcePrice] = useState<number | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPaymentPortal, setShowPaymentPortal] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return Video
      case 'WEBINAR': return Globe
      case 'PODCAST': return Headphones
      case 'EBOOK': return BookOpen
      case 'ARTICLE': return FileText
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'WEBINAR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PODCAST': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'EBOOK': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ARTICLE': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    
    // If duration is less than 60 seconds, show in seconds
    if (seconds < 60) {
      return `${seconds}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    
    // For durations between 1-60 minutes, show minutes and seconds if there are remaining seconds
    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    
    return `${minutes}m`
  }

  const getContentDescription = () => {
    if (isFileContent()) {
      if (resource?.type === 'PODCAST') {
        return 'Download and listen to this podcast on your device'
      } else if (resource?.type === 'EBOOK') {
        return 'Download and read this ebook on your device'
      } else if (resource?.type === 'ARTICLE') {
        return 'Download and read this article on your device'
      }
      return 'Download this content on your device'
    } else if (isExternalContent()) {
      return 'Click to watch on the external platform'
    }
    return 'Click to view this resource'
  }


  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleLike = () => {
    if (resource) {
      onLike(resource.id)
    }
  }

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

  const handleExternalLink = () => {
    if (!hasAccess) {
      // Show premium modal or redirect to upgrade
      window.location.href = '/upgrade'
      return
    }

    if (resource?.url) {
      if (isFileContent()) {
        // For file content, trigger download
        const link = document.createElement('a')
        link.href = resource.url
        link.download = `${resource.title}.${getFileExtension(resource.url)}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For external content, open in new tab
        window.open(resource.url, '_blank')
      }
    }
  }

  const handleSubscribe = () => {
    // Redirect to subscription page or open payment modal
    window.location.href = '/signals' // or wherever your subscription page is
  }

  const handlePurchase = () => {
    console.log('handlePurchase called', { resource: resource?.id, price: resourcePrice })
    if (!resource) {
      console.log('Missing resource')
      return
    }
    if (!resourcePrice) {
      console.log('Missing price, using default $5')
      setResourcePrice(5)
    }
    console.log('Opening payment portal')
    setShowPaymentPortal(true)
  }

  const handlePaymentSuccess = async () => {
    // Refresh access after successful payment
    await checkAccess()
    setShowPaymentPortal(false)
  }

  const getFileExtension = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'm4a':
      case 'aac':
        return extension
      case 'pdf':
        return 'pdf'
      case 'doc':
        return 'doc'
      case 'docx':
        return 'docx'
      case 'txt':
        return 'txt'
      case 'epub':
        return 'epub'
      default:
        return 'file'
    }
  }

  const isFileContent = () => {
    return ['EBOOK', 'ARTICLE', 'PODCAST'].includes(resource?.type || '')
  }

  const isExternalContent = () => {
    return ['VIDEO'].includes(resource?.type || '')
  }

  // Check access when component opens
  useEffect(() => {
    if (isOpen && resource) {
      console.log('ResourceViewer opened', { resource: resource.id, isPremium: resource.isPremium })
      checkAccess()
    }
  }, [isOpen, resource])

  // Debug state changes
  useEffect(() => {
    console.log('ResourceViewer state changed', { 
      hasAccess, 
      resourcePrice, 
      showPaymentPortal,
      isCheckingAccess,
      resource: resource?.id 
    })
  }, [hasAccess, resourcePrice, showPaymentPortal, isCheckingAccess, resource])

  const getContentAction = () => {
    if (isFileContent()) {
      return {
        label: 'Download',
        action: () => handleExternalLink(),
        icon: Download
      }
    } else if (isExternalContent()) {
      return {
        label: 'Watch/Listen',
        action: () => handleExternalLink(),
        icon: ExternalLink
      }
    }
    return null
  }


  if (!resource) return null

  const TypeIcon = getTypeIcon(resource.type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{resource.title}</DialogTitle>
          <DialogDescription className="text-base">
            {resource.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resource Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge className={getTypeColor(resource.type)}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {resource.type}
              </Badge>
              <Badge variant="outline">{resource.category}</Badge>
              {resource.isPremium && (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Premium
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {formatDuration(resource.duration)}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {formatDate(resource.createdAt)}
              </span>
            </div>
          </div>

          {/* Media Player */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {resource.thumbnail ? (
              <div className="relative">
                <img
                  src={resource.thumbnail}
                  alt={resource.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  {isCheckingAccess ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      <span className="text-white text-sm">Checking access...</span>
                    </div>
                  ) : !hasAccess ? (
                    <Button
                      size="lg"
                      onClick={() => {
                        console.log('Pay button clicked', { hasAccess, resourcePrice, resource: resource?.id })
                        handlePurchase()
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CreditCard className="h-6 w-6 mr-2" />
                      {resourcePrice ? `Pay $${resourcePrice} to ${isFileContent() ? 'Download' : 'Watch'}` : 'Pay to Access'}
                    </Button>
                  ) : (() => {
                    const contentAction = getContentAction()
                    if (contentAction) {
                      const ActionIcon = contentAction.icon
                      return (
                        <Button
                          size="lg"
                          onClick={contentAction.action}
                          className="bg-white text-black hover:bg-gray-100"
                        >
                          <ActionIcon className="h-6 w-6 mr-2" />
                          {contentAction.label}
                        </Button>
                      )
                    } else {
                      return (
                        <Button
                          size="lg"
                          onClick={handlePlay}
                          className="bg-white text-black hover:bg-gray-100"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>
                      )
                    }
                  })()}
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  {isExternalContent() && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleMute}
                        className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                  {resource.url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleExternalLink}
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-800">
                <TypeIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content Description */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {getContentDescription()}
          </div>

          {/* Resource Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 hover:text-red-500 transition-colors"
              >
                <Heart className={`h-4 w-4 ${likedResources.has(resource.id) ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-sm text-gray-600">{resource.likes} likes</span>
              </button>
            </div>
            {resource.url && (
              <Button 
                onClick={!hasAccess ? () => {
                  console.log('Bottom pay button clicked', { hasAccess, resourcePrice, resource: resource?.id })
                  handlePurchase()
                } : handleExternalLink} 
                variant="outline"
                className={!hasAccess ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {!hasAccess ? 
                  (resourcePrice ? `Pay $${resourcePrice} to ${isFileContent() ? 'Download' : 'Watch'}` : 'Pay to Access') : 
                  isFileContent() ? 
                    (resource?.type === 'PODCAST' ? 'Download Audio' : 'Download File') : 
                    'Open in New Tab'
                }
              </Button>
            )}
          </div>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

        </div>
      </DialogContent>

      {/* Payment Portal */}
      <PaymentPortal
        isOpen={showPaymentPortal}
        onClose={() => setShowPaymentPortal(false)}
        onSuccess={handlePaymentSuccess}
        resourceTitle={resource.title}
        resourceType={resource.type}
        priceUSD={resourcePrice || 0}
        resourceUrl={resource.url || undefined}
        resourceId={resource.id}
      />
    </Dialog>
  )
}
