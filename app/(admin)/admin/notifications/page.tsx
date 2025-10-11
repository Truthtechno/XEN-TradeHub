'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, Calendar, CheckCircle, Clock, Edit, Eye, EyeOff, Plus, Search, Trash2, Bell, Megaphone, Users, TrendingUp, BookOpen, Crown, MessageCircle, UserPlus, User, CreditCard } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  user?: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface NewNotification {
  id: string
  pagePath: string
  title: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  expiresAt?: string
  _count: {
    userViews: number
  }
}

export default function NotificationsPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [activeTab, setActiveTab] = useState<'notifications' | 'new-notifications'>('notifications')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [newNotifications, setNewNotifications] = useState<NewNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<NewNotification | null>(null)

  // Form state for NEW notifications
  const [formData, setFormData] = useState({
    pagePath: '',
    title: '',
    message: '',
    description: '',
    isActive: true,
    expiresAt: '',
    color: 'blue'
  })

  // Error state
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Predefined page paths
  const pagePaths = [
    { value: '/', label: 'Home Page' },
    { value: '/courses', label: 'Courses Page' },
    { value: '/resources', label: 'Resources Page' },
    { value: '/signals', label: 'Signals Page' },
    { value: '/events', label: 'Events Page' },
    { value: '/academy', label: 'Academy Page' },
    { value: '/mentorship', label: 'Mentorship Page' },
    { value: '/dashboard', label: 'Dashboard Page' }
  ]

  // Color options - mapped to semantic meanings
  const colorOptions = [
    { value: 'primary', label: 'Primary (Main)', class: 'bg-theme-primary' }, // Main notifications
    { value: 'secondary', label: 'Secondary (Important)', class: 'bg-theme-secondary' }, // Important alerts
    { value: 'accent', label: 'Accent (Highlight)', class: 'bg-theme-accent' }, // Highlighted content
    { value: 'success', label: 'Success (Positive)', class: 'bg-theme-success' }, // Success messages
    { value: 'warning', label: 'Warning (Caution)', class: 'bg-theme-warning' }, // Warning messages
    { value: 'error', label: 'Error (Critical)', class: 'bg-theme-error' }, // Error messages
    { value: 'info', label: 'Info (Information)', class: 'bg-theme-info' }, // Information
    { value: 'neutral', label: 'Neutral (Default)', class: 'bg-theme-neutral' } // Default/neutral
  ]

  // Fetch admin notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/activity-notifications?limit=50')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch NEW notifications
  const fetchNewNotifications = async () => {
    try {
      const response = await fetch('/api/admin/new-notifications?limit=50')
      if (response.ok) {
        const data = await response.json()
        setNewNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch NEW notifications:', error)
    }
  }

  // Create NEW notification
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/admin/new-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'banner' // Add type for banner
        })
      })
      
      if (response.ok) {
        await fetchNewNotifications()
        setIsCreateOpen(false)
        setFormData({ pagePath: '', title: '', message: '', description: '', isActive: true, expiresAt: '', color: 'blue' })
        setError('')
      } else {
        const errorData = await response.json()
        console.error('Failed to create banner:', errorData)
        setError(errorData.error || 'Failed to create banner. Please try again.')
      }
    } catch (error) {
      console.error('Failed to create notification:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update NEW notification
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNotification) return

    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/new-notifications/${editingNotification.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await fetchNewNotifications()
        setIsEditOpen(false)
        setEditingNotification(null)
        setFormData({ pagePath: '', title: '', message: '', description: '', isActive: true, expiresAt: '', color: 'blue' })
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update banner. Please try again.')
      }
    } catch (error) {
      console.error('Failed to update notification:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete NEW notification
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/new-notifications/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchNewNotifications()
        setError('') // Clear any previous errors
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete banner. Please try again.')
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
      setError('Network error. Please check your connection and try again.')
    }
  }

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        await fetchNotifications()
      } else {
        console.error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (response.ok) {
        await fetchNotifications()
      } else {
        console.error('Failed to mark all notifications as read')
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications()
    } else if (activeTab === 'new-notifications') {
      fetchNewNotifications()
    }
  }, [activeTab])

  // Get icon for notification type
  const getIconForType = (type: string) => {
    switch (type) {
      case 'STUDENT_PURCHASE':
        return Crown
      case 'STUDENT_ENROLLMENT':
        return BookOpen
      case 'STUDENT_REGISTRATION':
        return UserPlus
      case 'STUDENT_ENQUIRY':
        return MessageCircle
      case 'STUDENT_ACTIVITY':
        return TrendingUp
      case 'USER_LOGIN':
        return User
      case 'SUBSCRIPTION_CREATED':
      case 'SUBSCRIPTION_UPDATED':
        return CreditCard
      case 'SUBSCRIPTION_CANCELLED':
        return AlertCircle
      case 'PAYMENT_SUCCESS':
        return CheckCircle
      case 'PAYMENT_FAILED':
        return AlertCircle
      default:
        return Bell
    }
  }

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'STUDENT_PURCHASE':
        return 'text-theme-success'
      case 'STUDENT_ENROLLMENT':
        return 'text-theme-primary'
      case 'STUDENT_REGISTRATION':
        return 'text-theme-accent'
      case 'STUDENT_ENQUIRY':
        return 'text-theme-warning'
      case 'STUDENT_ACTIVITY':
        return 'text-theme-info'
      case 'USER_LOGIN':
        return 'text-theme-primary'
      case 'SUBSCRIPTION_CREATED':
      case 'SUBSCRIPTION_UPDATED':
        return 'text-theme-success'
      case 'SUBSCRIPTION_CANCELLED':
        return 'text-theme-error'
      case 'PAYMENT_SUCCESS':
        return 'text-theme-success'
      case 'PAYMENT_FAILED':
        return 'text-theme-error'
      default:
        return 'text-theme-text-tertiary'
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredNewNotifications = newNotifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.pagePath.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications & Banners</h1>
          <p className={`text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1`}>
            Manage admin notifications and NEW banners
          </p>
        </div>
        {activeTab === 'new-notifications' && (
          <Button onClick={() => setIsCreateOpen(true)} className="bg-theme-primary hover:bg-theme-primary-700 text-white w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Banner
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-theme-border">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-theme-primary text-theme-primary'
                : `border-transparent ${textHierarchy.metaText(isDarkMode)} hover:text-theme-text hover:border-theme-border`
            }`}
          >
            Admin Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('new-notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'new-notifications'
                ? 'border-theme-primary text-theme-primary'
                : `border-transparent ${textHierarchy.metaText(isDarkMode)} hover:text-theme-text hover:border-theme-border`
            }`}
          >
            NEW Banners ({newNotifications.length})
          </button>
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary h-4 w-4" />
          <Input
            placeholder={`Search ${activeTab === 'notifications' ? 'notifications' : 'banners'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-theme-bg border-theme-border text-theme-text"
          />
        </div>
        {activeTab === 'notifications' && notifications.length > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            className="bg-theme-primary hover:bg-theme-primary-700 text-white border-theme-primary w-full sm:w-auto"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card className="bg-theme-card border-theme-border">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-theme-text-tertiary mx-auto mb-4" />
                <h3 className={`text-lg font-medium ${textHierarchy.sectionHeading(isDarkMode)} mb-2`}>No notifications</h3>
                <p className={textHierarchy.cardDescription()}>Admin notifications will appear here when students perform activities.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const Icon = getIconForType(notification.type)
                return (
                  <Card key={notification.id} className={`bg-theme-card border-theme-border hover:shadow-theme-md transition-all duration-200 ${!notification.isRead ? 'border-l-4 border-l-theme-primary' : ''}`}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${getTypeColor(notification.type)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <h4 className={`text-sm font-medium ${textHierarchy.cardTitle(isDarkMode)} break-words`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs border-theme-border text-theme-text">
                                {notification.type.replace('STUDENT_', '')}
                              </Badge>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-theme-error rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className={`text-sm mt-2 ${textHierarchy.cardDescription()} break-words`}>
                            {notification.message}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
                            <p className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs hover:bg-theme-bg-secondary w-fit"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'new-notifications' && (
        <div className="space-y-4">
          {filteredNewNotifications.length === 0 ? (
            <Card className="bg-theme-card border-theme-border">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-theme-text-tertiary mx-auto mb-4" />
                <h3 className={`text-lg font-medium ${textHierarchy.sectionHeading(isDarkMode)} mb-2`}>No NEW banners</h3>
                <p className={textHierarchy.cardDescription()}>Create NEW banners to highlight new content on specific pages.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNewNotifications.map((notification) => (
                <Card key={notification.id} className="bg-theme-card border-theme-border hover:shadow-theme-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <h4 className={`text-sm font-medium ${textHierarchy.cardTitle(isDarkMode)}`}>
                            {notification.title}
                          </h4>
                          <Badge variant={notification.isActive ? 'default' : 'secondary'} className={notification.isActive ? 'bg-theme-success-700 text-white' : 'bg-theme-neutral-700 text-white'}>
                            {notification.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className={`text-sm ${textHierarchy.cardDescription()} mt-1`}>
                          Page: {notification.pagePath}
                        </p>
                        {notification.description && (
                          <p className={`text-sm ${textHierarchy.metaText(isDarkMode)} mt-1 break-words`}>
                            {notification.description}
                          </p>
                        )}
                        <p className={`text-xs ${textHierarchy.metaText(isDarkMode)} mt-2`}>
                          Created: {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNotification(notification)
                            setFormData({
                              pagePath: notification.pagePath,
                              title: notification.title,
                              message: notification.description || '',
                              description: notification.description || '',
                              isActive: notification.isActive,
                              expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : '',
                              color: 'blue' // Default color for existing banners
                            })
                            setIsEditOpen(true)
                          }}
                          className="hover:bg-theme-bg-secondary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(notification.id)}
                          className="hover:bg-theme-error-50 dark:hover:bg-theme-error-900/20 text-theme-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false)
          setIsEditOpen(false)
          setEditingNotification(null)
          setFormData({ pagePath: '', title: '', message: '', description: '', isActive: true, expiresAt: '', color: 'blue' })
          setError('')
        }
      }}>
        <DialogContent className="max-w-md mx-auto sm:max-w-lg bg-theme-card border-theme-border">
          <DialogHeader>
            <DialogTitle className={`text-lg sm:text-xl ${textHierarchy.sectionHeading(isDarkMode)}`}>
              {isCreateOpen ? 'Create NEW Banner' : 'Edit NEW Banner'}
            </DialogTitle>
            <DialogDescription className={textHierarchy.cardDescription()}>
              {isCreateOpen ? 'Create a new banner to highlight content on specific pages.' : 'Update the banner settings.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={isCreateOpen ? handleCreate : handleUpdate}>
            {error && (
              <div className="bg-theme-error-50 dark:bg-theme-error-900/20 border border-theme-error-200 dark:border-theme-error-800 rounded-md p-3 mb-4">
                <p className={`text-sm text-theme-error-600 dark:text-theme-error-400`}>{error}</p>
              </div>
            )}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <Label htmlFor="pagePath" className={textHierarchy.cardDescription()}>Page Path</Label>
                <select
                  id="pagePath"
                  value={formData.pagePath}
                  onChange={(e) => setFormData({ ...formData, pagePath: e.target.value })}
                  className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg text-theme-text"
                  required
                >
                  <option value="">Select a page...</option>
                  {pagePaths.map((path) => (
                    <option key={path.value} value={path.value}>
                      {path.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="title" className={textHierarchy.cardDescription()}>Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="New Course Available!"
                  className="bg-theme-bg border-theme-border text-theme-text"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message" className={textHierarchy.cardDescription()}>Message</Label>
                <Input
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Brief message for the banner"
                  className="bg-theme-bg border-theme-border text-theme-text"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className={textHierarchy.cardDescription()}>Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the new content"
                  className="bg-theme-bg border-theme-border text-theme-text"
                />
              </div>
              <div>
                <Label htmlFor="expiresAt" className={textHierarchy.cardDescription()}>Expires At (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="bg-theme-bg border-theme-border text-theme-text"
                />
              </div>
              <div>
                <Label htmlFor="color" className={textHierarchy.cardDescription()}>Banner Color</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`p-2 sm:p-3 rounded-md border-2 transition-all ${
                        formData.color === color.value
                          ? 'border-theme-primary ring-2 ring-theme-primary'
                          : 'border-theme-border hover:border-theme-border-secondary'
                      }`}
                    >
                      <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full ${color.class} mx-auto`}></div>
                      <span className={`text-xs mt-1 ${textHierarchy.metaText(isDarkMode)}`}>{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className={textHierarchy.cardDescription()}>Active</Label>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreateOpen(false)
                setIsEditOpen(false)
                setEditingNotification(null)
                setFormData({ pagePath: '', title: '', message: '', description: '', isActive: true, expiresAt: '', color: 'blue' })
              }} className="w-full sm:w-auto border-theme-border hover:bg-theme-bg-secondary">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto bg-theme-primary hover:bg-theme-primary-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isCreateOpen ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  isCreateOpen ? 'Create Banner' : 'Update Banner'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}