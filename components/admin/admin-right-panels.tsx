'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, AlertCircle, BarChart3, Bell, BookOpen, Calendar, CheckCircle, Crown, Eye, Flag, Heart, MessageCircle, RefreshCw, Settings, Star, ThumbsUp, TrendingUp, UserPlus, Users, X, User, CreditCard } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useNotifications } from '@/lib/notifications-context'

interface AdminRightPanelsProps {
  isNotificationsOpen: boolean
  onClose: (panel: string) => void
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
  notifications?: number
}

interface AdminNotification {
  id: string
  type: 'STUDENT_PURCHASE' | 'STUDENT_ENROLLMENT' | 'STUDENT_REGISTRATION' | 'STUDENT_ENQUIRY' | 'STUDENT_ACTIVITY' | 'USER_LOGIN' | 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_UPDATED' | 'SUBSCRIPTION_CANCELLED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'UPDATE' | 'EMAIL'
  title: string
  message: string
  createdAt: string
  isRead: boolean
  actionUrl?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  user?: {
    id: string
    name: string
    email: string
    image?: string
  }
}

export function AdminRightPanels({ 
  isNotificationsOpen, 
  onClose,
  user,
  notifications = 0
}: AdminRightPanelsProps) {
  const { isDarkMode } = useTheme()
  const { notifications: newNotifications, markNewAsViewed } = useNotifications()
  
  // State for managing notification read status
  const [notificationStates, setNotificationStates] = useState<{ [key: string]: boolean }>({})

  // Admin notifications state
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)

  // Fetch admin notifications
  const fetchAdminNotifications = async () => {
    try {
      setIsLoadingNotifications(true)
      const response = await fetch('/api/admin/activity-notifications?limit=20')
      if (response.ok) {
        const data = await response.json()
        setAdminNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  // Load notifications when panel opens
  useEffect(() => {
    if (isNotificationsOpen) {
      fetchAdminNotifications()
    }
  }, [isNotificationsOpen])

  // Function to mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (response.ok) {
        // Update local state
        const newStates: { [key: string]: boolean } = {}
        adminNotifications.forEach(notification => {
          newStates[notification.id] = true
        })
        setNotificationStates(newStates)
        
        // Refresh notifications to get updated data
        await fetchAdminNotifications()
      } else {
        console.error('Failed to mark all notifications as read')
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  // Function to mark individual notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotificationStates(prev => ({
          ...prev,
          [notificationId]: true
        }))
        // Refresh notifications to get updated data
        await fetchAdminNotifications()
      } else {
        console.error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Function to handle notification click
  const handleNotificationClick = async (notification: AdminNotification) => {
    await handleMarkAsRead(notification.id)
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  // Get the actual read status for a notification
  const getNotificationReadStatus = (notificationId: string) => {
    return notificationStates[notificationId] || false
  }

  // Calculate unread count
  const unreadCount = adminNotifications.filter(notification => !getNotificationReadStatus(notification.id)).length
  
  // Calculate total unread count (NEW notifications + admin notifications)
  const totalUnreadCount = newNotifications.length + unreadCount

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

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
      case 'EMAIL':
        return MessageCircle
      case 'UPDATE':
        return RefreshCw
      default:
        return Bell
    }
  }

  // Get type icon color
  const getTypeIconColor = (type: string) => {
    switch (type) {
      case 'STUDENT_PURCHASE':
        return 'text-green-500'
      case 'STUDENT_ENROLLMENT':
        return 'text-blue-500'
      case 'STUDENT_REGISTRATION':
        return 'text-purple-500'
      case 'STUDENT_ENQUIRY':
        return 'text-orange-500'
      case 'STUDENT_ACTIVITY':
        return 'text-indigo-500'
      case 'USER_LOGIN':
        return 'text-blue-500'
      case 'SUBSCRIPTION_CREATED':
      case 'SUBSCRIPTION_UPDATED':
        return 'text-green-500'
      case 'SUBSCRIPTION_CANCELLED':
        return 'text-red-500'
      case 'PAYMENT_SUCCESS':
        return 'text-green-500'
      case 'PAYMENT_FAILED':
        return 'text-red-500'
      case 'EMAIL':
        return 'text-blue-500'
      case 'UPDATE':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
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

  return (
    <>
      {/* Admin Notifications Panel */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className={`fixed right-0 top-0 h-full w-80 sm:w-96 shadow-xl transform transition-all duration-300 ease-in-out ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Bell className={`h-5 w-5 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Notifications</h2>
                {totalUnreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {totalUnreadCount}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClose('notifications')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className={`transition-colors duration-200 ${isDarkMode ? 'text-blue-400 hover:text-blue-300 disabled:text-gray-500' : 'text-blue-600 hover:text-blue-700 disabled:text-gray-400'}`}
                >
                  Mark all as read
                </Button>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Auto-refresh enabled</span>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : adminNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  adminNotifications.map((notification) => {
                    const Icon = getIconForType(notification.type)
                    const isRead = notification.isRead || getNotificationReadStatus(notification.id)
                    return (
                      <Card 
                        key={notification.id} 
                        className={`hover:shadow-md transition-all duration-200 cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} ${!isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <Icon className={`h-5 w-5 ${getTypeIconColor(notification.type)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {notification.priority && (
                                    <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                      {notification.priority}
                                    </Badge>
                                  )}
                                  {!isRead && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <p className={`text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                                {notification.actionUrl && (
                                  <span className="text-xs text-blue-500 hover:text-blue-700">
                                    View →
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
              
              <div className="mt-6 space-y-3">
                <Button 
                  variant="outline" 
                  className={`w-full transition-colors duration-200 ${isDarkMode ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    onClose('notifications')
                    window.location.href = '/admin/users'
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View All Users
                </Button>
                <Button 
                  variant="outline" 
                  className={`w-full transition-colors duration-200 ${isDarkMode ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    onClose('notifications')
                    window.location.href = '/admin/signals'
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View All Signals
                </Button>
                <Button 
                  variant="outline" 
                  className={`w-full transition-colors duration-200 ${isDarkMode ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    onClose('notifications')
                    window.location.href = '/admin/courses'
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View All Courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
