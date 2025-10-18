'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, DollarSign, FileText, Filter, Headphones, Heart, Lock, Play, Search, Users, Video, X } from 'lucide-react'
import { IntegratedResourceViewer } from '@/components/resources/integrated-resource-viewer'
import StripePaymentForm from '@/components/ui/stripe-payment-form'
import BannerDisplay from '@/components/banner-display'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

interface Resource {
  id: string
  title: string
  slug: string
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
  access?: {
    hasAccess: boolean
    requiresPayment: boolean
    reason: string
    priceUSD: number | null
  }
}

export default function ResourcesPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [userAccess, setUserAccess] = useState<{
    hasPremiumAccess: boolean
    isAuthenticated: boolean
  } | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [resourceToPurchase, setResourceToPurchase] = useState<Resource | null>(null)
  const [likedResources, setLikedResources] = useState<Set<string>>(new Set())

  // Fetch resources
  const fetchResources = async () => {
    setIsLoading(true)
    try {
      // Add cache-busting and explicit credentials
      const response = await fetch(`/api/resources?t=${Date.now()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        
        setResources(data.resources || [])
        setFilteredResources(data.resources || [])
        setUserAccess(data.userAccess || null)
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user's liked resources
  const fetchLikedResources = async () => {
    try {
      const response = await fetch('/api/resources/liked', {
        method: 'GET',
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setLikedResources(new Set(data.likedResourceIds || []))
      }
    } catch (error) {
      console.error('Error fetching liked resources:', error)
    }
  }

  useEffect(() => {
    fetchResources()
    fetchLikedResources()
  }, [])

  // Check authentication and redirect if needed
  useEffect(() => {
    if (userAccess && !userAccess.isAuthenticated) {
      alert('Please sign in to access resources')
      window.location.href = '/'
    }
  }, [userAccess])

  // Filter resources
  useEffect(() => {
    let filtered = resources

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(resource => resource.type === typeFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(resource => resource.category === categoryFilter)
    }

    setFilteredResources(filtered)
  }, [resources, searchTerm, typeFilter, categoryFilter])

  // Format duration helper
  const formatDuration = (seconds: number) => {
    if (!seconds) return 'Unknown'
    
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

  // Get type badge color - mapped to semantic meanings
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'bg-theme-error-100 text-theme-error-800 dark:bg-theme-error-900 dark:text-theme-error-200' // Error for video (attention-grabbing)
      case 'PODCAST': return 'bg-theme-info-100 text-theme-info-800 dark:bg-theme-info-900 dark:text-theme-info-200' // Info for podcast (informational)
      case 'EBOOK': return 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200' // Success for ebook (valuable content)
      case 'ARTICLE': return 'bg-theme-primary-100 text-theme-primary-800 dark:bg-theme-primary-900 dark:text-theme-primary-200' // Primary for article (main content)
      default: return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200' // Neutral default
    }
  }

  // Handle resource view
  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource)
    setIsViewerOpen(true)
  }

  // Handle like
  const handleLike = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/like`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update local state
        setResources(prev => prev.map(r => 
          r.id === resourceId ? { ...r, likes: data.likes } : r
        ))
        
        // Update liked resources set
        setLikedResources(prev => {
          const newSet = new Set(prev)
          if (data.liked) {
            newSet.add(resourceId)
          } else {
            newSet.delete(resourceId)
          }
          return newSet
        })
      }
    } catch (error) {
      console.error('Error liking resource:', error)
    }
  }

  // Handle share
  const handleShare = async (resourceId: string) => {
    try {
      await navigator.share({
        title: selectedResource?.title,
        text: selectedResource?.description,
        url: window.location.href
      })
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Handle resource purchase
  const handlePurchaseResource = (resource: Resource) => {
    // Check if user is authenticated
    if (!userAccess?.isAuthenticated) {
      alert('Please sign in to purchase resources')
      window.location.href = '/'
      return
    }
    
    setResourceToPurchase(resource)
    setIsPaymentOpen(true)
  }

  // Handle successful payment
  const handlePaymentSuccess = async (paymentIntent: any) => {
    if (!resourceToPurchase) return
    
    console.log('🎉 Payment successful!', {
      paymentIntentId: paymentIntent.id,
      resourceTitle: resourceToPurchase.title,
      resourceId: resourceToPurchase.id
    })
    
    // The purchase record should already be created by the /api/resources/purchase endpoint
    // The webhook should handle updating the status, but let's also try to update it manually
    try {
      const response = await fetch('/api/resources/update-purchase-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          resourceId: resourceToPurchase.id,
          paymentIntentId: paymentIntent.id,
          status: 'COMPLETED'
        })
      })
      
      if (response.ok) {
        console.log('✅ Purchase status updated to COMPLETED')
      } else {
        console.log('⚠️ Manual status update failed, but webhook might have handled it')
        const errorData = await response.json()
        console.log('Error details:', errorData)
      }
    } catch (error) {
      console.log('⚠️ Error updating purchase status:', error)
    }
    
    setIsPaymentOpen(false)
    setResourceToPurchase(null)
    
    // Refresh resources to show updated access
    setTimeout(() => {
      console.log('🔄 Refreshing resources to show updated access...')
      fetchResources()
    }, 2000) // Increased timeout to allow webhook to process
  }

  // Handle payment error
  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`)
  }

  // Handle payment cancel
  const handlePaymentCancel = () => {
    setIsPaymentOpen(false)
    setResourceToPurchase(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banners */}
        <BannerDisplay pagePath="/resources" className="mb-6" />
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className={`${textHierarchy.largeHeading(isDarkMode)} mb-2`}>
            Educational Resources
          </h1>
          <p className={textHierarchy.subheading()}>
            Access premium educational content, videos, webinars, and more
          </p>
        </div>

        {/* Premium Upgrade Banner for Non-Premium Users */}
        {userAccess && !userAccess.hasPremiumAccess && (
          <Card className="mb-6 sm:mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                      Gain Premium Access
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Purchase individual resources or upgrade to Premium for free access to all content
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => window.location.href = '/one-on-one'}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 sm:h-11"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 h-10 sm:h-11 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                >
                  <option value="all">All Types</option>
                  <option value="VIDEO">Video</option>
                  <option value="PODCAST">Podcast</option>
                  <option value="EBOOK">Ebook</option>
                  <option value="ARTICLE">Article</option>
                </select>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 h-10 sm:h-11 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                >
                  <option value="all">All Categories</option>
                  <option value="Education">Education</option>
                  <option value="Analysis">Analysis</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Tutorial">Tutorial</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-6 sm:pb-8">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden">
              <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {React.createElement(getTypeIcon(resource.type), { className: "h-4 w-4 sm:h-5 sm:w-5" })}
                    <Badge className={`${getTypeBadgeColor(resource.type)} text-xs sm:text-sm`}>
                      {resource.type}
                    </Badge>
                  </div>
                  {resource.isPremium && (
                    <div className="flex items-center space-x-1">
                      <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                      {resource.priceUSD && (
                        <span className="text-xs sm:text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          ${resource.priceUSD}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2 mb-2">
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base line-clamp-2 text-gray-600 dark:text-gray-300">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Thumbnail */}
                {resource.thumbnail && (
                  <div className="mb-4">
                    <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img 
                        src={resource.thumbnail} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <Button
                          onClick={() => handleViewResource(resource)}
                          className={`opacity-0 hover:opacity-100 transition-opacity duration-200 text-xs sm:text-sm px-3 py-2 ${
                            isDarkMode 
                              ? 'bg-white/90 hover:bg-white text-gray-900' 
                              : 'bg-white/90 hover:bg-white text-gray-900'
                          }`}
                        >
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {resource.type === 'VIDEO' ? 'Watch' : 
                           resource.type === 'PODCAST' ? 'Listen' : 
                           resource.type === 'EBOOK' ? 'Read' : 'View'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resource Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{resource.duration ? formatDuration(resource.duration) : 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{resource.likes}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{resource.category}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {resource.publishedAt ? formatDate(resource.publishedAt) : 'Draft'}
                    </span>
                  </div>

                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          +{resource.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-4 sm:mt-6">
                  {resource.access?.hasAccess ? (
                    <Button
                      onClick={() => handleViewResource(resource)}
                      className={`w-full h-10 sm:h-11 text-sm sm:text-base ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      variant="outline"
                    >
                      {resource.type === 'VIDEO' ? 'Watch Video' : 
                       resource.type === 'PODCAST' ? 'Listen to Podcast' : 
                       resource.type === 'EBOOK' ? 'Read Ebook' : 'Read Article'}
                    </Button>
                  ) : resource.isPremium ? (
                    <Button
                      onClick={() => handlePurchaseResource(resource)}
                      className={`w-full h-10 sm:h-11 text-sm sm:text-base ${
                        isDarkMode 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Purchase ${resource.priceUSD || 0}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => window.location.href = '/'}
                      className={`w-full h-10 sm:h-11 text-sm sm:text-base ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Sign In to Access
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No resources found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Integrated Resource Viewer */}
      {selectedResource && (
        <IntegratedResourceViewer
          resource={selectedResource}
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false)
            setSelectedResource(null)
          }}
          onLike={handleLike}
          onShare={handleShare}
          likedResources={likedResources}
        />
      )}

      {/* Payment Modal */}
      {resourceToPurchase && userAccess?.isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Purchase Resource
                </h3>
                <button
                  onClick={handlePaymentCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  {resourceToPurchase.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {resourceToPurchase.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${resourceToPurchase.priceUSD}
                  </span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {resourceToPurchase.type}
                  </Badge>
                </div>
              </div>

              <StripePaymentForm
                amount={resourceToPurchase.priceUSD || 0}
                currency="USD"
                courseId={resourceToPurchase.id}
                courseTitle={resourceToPurchase.title}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
                paymentIntentEndpoint="/api/resources/purchase"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}