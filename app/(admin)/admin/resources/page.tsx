'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Edit, Eye, FileText, Filter, Headphones, Heart, MessageCircle, MoreHorizontal, Play, Plus, Search, Trash2, Users, Video, X } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResourceForm } from '@/components/admin/resource-form'

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
  purchases?: {
    amountUSD: number
    status: string
  }[]
}

interface ResourcePurchase {
  id: string
  userId: string
  resourceId: string
  amountUSD: number
  status: string
  provider: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  resource: {
    id: string
    title: string
    type: string
  }
}

export default function ResourcesPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [resources, setResources] = useState<Resource[]>([])
  const [purchases, setPurchases] = useState<ResourcePurchase[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [activeTab, setActiveTab] = useState<'resources' | 'purchases'>('resources')
  const [revenueFilter, setRevenueFilter] = useState<'all' | 'week' | 'month' | 'year'>('all')
  const [viewingResource, setViewingResource] = useState<Resource | null>(null)

  const fetchResources = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/resources')
      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }
      const data = await response.json()
      setResources(data.resources || [])
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      setResources([])
    } finally {
      setIsLoading(false)
    }
  }


  const fetchPurchases = async () => {
    setIsLoadingPurchases(true)
    try {
      const response = await fetch('/api/admin/resources/purchases')
      if (!response.ok) {
        throw new Error('Failed to fetch purchases')
      }
      const data = await response.json()
      setPurchases(data.purchases || [])
      setTotalRevenue(data.totalRevenue || 0)
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
      setPurchases([])
    } finally {
      setIsLoadingPurchases(false)
    }
  }

  useEffect(() => {
    fetchResources()
    fetchPurchases()
  }, [])

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === 'all' || resource.type === typeFilter
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter
    return matchesSearch && matchesType && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />
      case 'WEBINAR':
        return <Play className="h-4 w-4" />
      case 'PODCAST':
        return <Headphones className="h-4 w-4" />
      case 'EBOOK':
        return <BookOpen className="h-4 w-4" />
      case 'ARTICLE':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'bg-theme-error-100 text-theme-error-800 dark:bg-theme-error-900 dark:text-theme-error-200'
      case 'WEBINAR':
        return 'bg-theme-primary-100 text-theme-primary-800 dark:bg-theme-primary-900 dark:text-theme-primary-200'
      case 'PODCAST':
        return 'bg-theme-accent-100 text-theme-accent-800 dark:bg-theme-accent-900 dark:text-theme-accent-200'
      case 'EBOOK':
        return 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200'
      case 'ARTICLE':
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200'
      default:
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200'
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDateFilter = (filter: string) => {
    const now = new Date()
    switch (filter) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return weekAgo
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return monthAgo
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        return yearAgo
      default:
        return null
    }
  }

  const filteredPurchases = purchases.filter(purchase => {
    if (revenueFilter === 'all') return true
    const filterDate = getDateFilter(revenueFilter)
    if (!filterDate) return true
    return new Date(purchase.createdAt) >= filterDate
  })

  const filteredRevenue = filteredPurchases.reduce((sum, purchase) => {
    return sum + (purchase.status === 'COMPLETED' ? purchase.amountUSD : 0)
  }, 0)

  const handleResourceSave = (savedResource: Resource) => {
    if (editingResource) {
      setResources(prev => prev.map(r => r.id === savedResource.id ? savedResource : r))
    } else {
      setResources(prev => [savedResource, ...prev])
    }
    setEditingResource(null)
  }

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource)
    setIsFormOpen(true)
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const response = await fetch(`/api/admin/resources/${resourceId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete resource')
      }

      setResources(prev => prev.filter(r => r.id !== resourceId))
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Failed to delete resource. Please try again.')
    }
  }

  const handleViewResource = (resource: Resource) => {
    setViewingResource(resource)
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-theme tracking-tight">
            Resources
          </h1>
          <p className="text-theme-secondary text-base sm:text-lg max-w-2xl">
            Manage educational content, videos, webinars, and more
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button 
            onClick={() => fetchResources()} 
            variant="outline"
            className="border-theme-border hover:bg-theme-bg-secondary px-6 py-3"
          >
            <Search className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            variant="theme-primary"
            className="px-6 py-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Resource
          </Button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtered Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${filteredRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{purchases.length}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtered Purchases</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredPurchases.length}</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-3 sm:py-2 px-1 border-b-2 font-medium text-sm sm:text-base text-left sm:text-center ${
                activeTab === 'resources'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-3 sm:py-2 px-1 border-b-2 font-medium text-sm sm:text-base text-left sm:text-center ${
                activeTab === 'purchases'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Recent Purchases
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'resources' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{resources.length}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {resources.reduce((acc, r) => acc + r.likes, 0)}
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Content</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {resources.filter(r => r.isPremium).length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="VIDEO">Video</option>
                <option value="WEBINAR">Webinar</option>
                <option value="PODCAST">Podcast</option>
                <option value="EBOOK">Ebook</option>
                <option value="ARTICLE">Article</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="Education">Education</option>
                <option value="Analysis">Analysis</option>
                <option value="Psychology">Psychology</option>
                <option value="Strategy">Strategy</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card className="bg-theme-card border-theme-border">
        <CardHeader>
          <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Resources ({filteredResources.length})</CardTitle>
          <CardDescription className={textHierarchy.subheading()}>
            Manage educational content and track engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-theme-border">
                <TableHead className="text-theme-text">Resource</TableHead>
                <TableHead className="text-theme-text">Type</TableHead>
                <TableHead className="text-theme-text">Category</TableHead>
                <TableHead className="text-theme-text">Duration</TableHead>
                <TableHead className="text-theme-text">Access</TableHead>
                <TableHead className="text-theme-text">Likes</TableHead>
                <TableHead className="text-theme-text">Published</TableHead>
                <TableHead className="w-[50px] text-theme-text"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((resource) => (
                <TableRow key={resource.id} className="border-theme-border hover:bg-theme-bg-secondary">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {resource.thumbnail ? (
                        <img 
                          src={resource.thumbnail} 
                          alt={resource.title}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-theme-bg-secondary rounded-md flex items-center justify-center">
                          {getTypeIcon(resource.type)}
                        </div>
                      )}
                      <div>
                        <div className={`font-medium ${textHierarchy.cardTitle(isDarkMode)}`}>{resource.title}</div>
                        <div className={`text-sm ${textHierarchy.cardDescription()} line-clamp-2`}>
                          {resource.description}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {resource.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-theme-border">
                              {tag}
                            </Badge>
                          ))}
                          {resource.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs border-theme-border">
                              +{resource.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(resource.type)}
                      <Badge className={getTypeBadgeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className={textHierarchy.cardTitle(isDarkMode)}>{resource.category}</TableCell>
                  <TableCell className={textHierarchy.cardTitle(isDarkMode)}>{formatDuration(resource.duration)}</TableCell>
                  <TableCell>
                    <Badge className={resource.isPremium ? 'bg-theme-warning-100 text-theme-warning-800 dark:bg-theme-warning-900 dark:text-theme-warning-200' : 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200'}>
                      {resource.isPremium ? 'Premium' : 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3 text-theme-error" />
                      <span className={textHierarchy.cardTitle(isDarkMode)}>{resource.likes}</span>
                    </div>
                  </TableCell>
                  <TableCell className={textHierarchy.cardTitle(isDarkMode)}>
                    {resource.publishedAt ? formatDate(resource.publishedAt) : 'Draft'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-theme-bg-secondary">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-theme-card border-theme-border">
                        <DropdownMenuLabel className={textHierarchy.cardTitle(isDarkMode)}>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewResource(resource)} className="text-theme-text hover:bg-theme-bg-secondary">
                          <Eye className="mr-2 h-4 w-4" />
                          View Resource
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditResource(resource)} className="text-theme-text hover:bg-theme-bg-secondary">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Resource
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteResource(resource.id)}
                          className="text-theme-error hover:bg-theme-error-50 dark:hover:bg-theme-error-900/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Resource
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

          {/* Resource Form Modal */}
          <ResourceForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false)
              setEditingResource(null)
            }}
            onSave={handleResourceSave}
            resource={editingResource}
          />
        </>
      ) : (
        <>
          {/* Revenue Filter */}
          <Card className="mb-6 bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Revenue Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary h-4 w-4" />
                    <Input
                      placeholder="Search purchases..."
                      className="pl-10 bg-theme-bg border-theme-border text-theme-text"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={revenueFilter}
                    onChange={(e) => setRevenueFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg text-theme-text"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchases Table */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>
                Recent Purchases ({filteredPurchases.length})
              </CardTitle>
              <CardDescription className={textHierarchy.subheading()}>
                Track resource purchases and revenue in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPurchases ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
                  <span className={`ml-2 ${textHierarchy.metaText(isDarkMode)}`}>Loading purchases...</span>
                </div>
              ) : filteredPurchases.length === 0 ? (
                <div className={`text-center py-8 ${textHierarchy.cardDescription()}`}>
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No purchases found</p>
                  <p className="text-sm">Purchases will appear here when users buy premium resources</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-theme-border">
                      <TableHead className="text-theme-text">Resource</TableHead>
                      <TableHead className="text-theme-text">Customer</TableHead>
                      <TableHead className="text-theme-text">Amount</TableHead>
                      <TableHead className="text-theme-text">Status</TableHead>
                      <TableHead className="text-theme-text">Date</TableHead>
                      <TableHead className="w-[50px] text-theme-text"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="border-theme-border hover:bg-theme-bg-secondary">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getTypeIcon(purchase.resource.type)}
                            </div>
                            <div>
                              <p className={`font-medium ${textHierarchy.cardTitle(isDarkMode)}`}>
                                {purchase.resource.title}
                              </p>
                              <p className={`text-sm ${textHierarchy.cardDescription()}`}>
                                {purchase.resource.type}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={`font-medium ${textHierarchy.cardTitle(isDarkMode)}`}>
                              {purchase.user.name || 'Unknown User'}
                            </p>
                            <p className={`text-sm ${textHierarchy.cardDescription()}`}>
                              {purchase.user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className={`font-semibold text-theme-success`}>
                            ${purchase.amountUSD.toFixed(2)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200">
                            {purchase.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={textHierarchy.cardTitle(isDarkMode)}>
                          {formatDate(purchase.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-theme-bg-secondary">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-theme-card border-theme-border">
                              <DropdownMenuLabel className={textHierarchy.cardTitle(isDarkMode)}>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-theme-text hover:bg-theme-bg-secondary">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-theme-text hover:bg-theme-bg-secondary">
                                <Users className="mr-2 h-4 w-4" />
                                View Customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Resource Viewer Modal */}
      {viewingResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-card border-theme-border rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-theme-border">
              <h2 className={`text-2xl font-bold ${textHierarchy.largeHeading(isDarkMode)}`}>
                {viewingResource.title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingResource(null)}
                className="text-theme-text-tertiary hover:text-theme-text-secondary"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Thumbnail and Basic Info */}
                <div className="lg:col-span-1">
                  {/* Thumbnail */}
                  <div className="mb-4">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-theme-bg-secondary flex items-center justify-center">
                      {viewingResource.thumbnail ? (
                        <img 
                          src={viewingResource.thumbnail} 
                          alt={viewingResource.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="flex flex-col items-center justify-center h-full text-theme-text-tertiary">
                                  <FileText class="h-12 w-12 mb-2" />
                                  <span class="text-sm">No thumbnail available</span>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className={`flex flex-col items-center justify-center h-full ${textHierarchy.cardDescription()}`}>
                          <FileText className="h-12 w-12 mb-2" />
                          <span className="text-sm">No thumbnail available</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getTypeBadgeColor(viewingResource.type)}>
                      {viewingResource.type}
                    </Badge>
                    <Badge className={viewingResource.isPremium ? 'bg-theme-warning-100 text-theme-warning-800 dark:bg-theme-warning-900 dark:text-theme-warning-200' : 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200'}>
                      {viewingResource.isPremium ? 'Premium' : 'Free'}
                    </Badge>
                    {viewingResource.isPremium && viewingResource.priceUSD && (
                      <Badge className="bg-theme-primary-100 text-theme-primary-800 dark:bg-theme-primary-900 dark:text-theme-primary-200">
                        ${viewingResource.priceUSD}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-theme-border-secondary">
                      <span className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Likes</span>
                      <span className={`text-sm ${textHierarchy.cardTitle(isDarkMode)}`}>{viewingResource.likes}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-theme-border-secondary">
                      <span className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Duration</span>
                      <span className={`text-sm ${textHierarchy.cardTitle(isDarkMode)}`}>{formatDuration(viewingResource.duration)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-theme-border-secondary">
                      <span className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Published</span>
                      <span className={`text-sm ${textHierarchy.cardTitle(isDarkMode)}`}>
                        {viewingResource.publishedAt ? formatDate(viewingResource.publishedAt) : 'Draft'}
                      </span>
                    </div>
                    
                    {/* Premium Resource Stats */}
                    {viewingResource.isPremium && viewingResource.purchases && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-theme-border-secondary">
                          <span className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Purchases</span>
                          <span className={`text-sm font-semibold text-theme-success`}>
                            {viewingResource.purchases.filter(p => p.status === 'COMPLETED').length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Revenue</span>
                          <span className={`text-sm font-semibold text-theme-success`}>
                            ${viewingResource.purchases
                              .filter(p => p.status === 'COMPLETED')
                              .reduce((sum, p) => sum + p.amountUSD, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Right Column - Detailed Info */}
                <div className="lg:col-span-2">
                  {/* Description */}
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold ${textHierarchy.sectionHeading(isDarkMode)} mb-3`}>Description</h3>
                    <p className={`${textHierarchy.cardDescription()} leading-relaxed`}>{viewingResource.description}</p>
                  </div>
                  
                  {/* Category */}
                  <div className="mb-6">
                    <h4 className={`font-medium ${textHierarchy.cardTitle(isDarkMode)} mb-2`}>Category</h4>
                    <Badge variant="outline" className={`${textHierarchy.cardDescription()} border-theme-border`}>
                      {viewingResource.category}
                    </Badge>
                  </div>
                  
                  {/* Tags */}
                  {viewingResource.tags && viewingResource.tags.length > 0 && (
                    <div className="mb-6">
                      <h4 className={`font-medium ${textHierarchy.cardTitle(isDarkMode)} mb-3`}>Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingResource.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Resource URL */}
                  {viewingResource.url && (
                    <div className="mb-6">
                      <h4 className={`font-medium ${textHierarchy.cardTitle(isDarkMode)} mb-2`}>Resource URL</h4>
                      <div className="p-3 bg-theme-bg-secondary rounded-lg">
                        <a 
                          href={viewingResource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-theme-primary hover:text-theme-primary-700 break-all text-sm"
                        >
                          {viewingResource.url}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-theme-border bg-theme-bg-secondary">
              <Button
                variant="outline"
                onClick={() => setViewingResource(null)}
                className="border-theme-border hover:bg-theme-bg-secondary"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewingResource(null)
                  handleEditResource(viewingResource)
                }}
                variant="theme-primary"
              >
                Edit Resource
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
