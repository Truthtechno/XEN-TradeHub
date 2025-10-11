'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AlertCircle, ArrowLeft, Bell, Calendar, CheckCircle, Clock, Eye, EyeOff, Filter, Gift, Info, Loader2, MoreVertical, RefreshCw, Search, Shield } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import { useNotifications, Notification } from '@/lib/notifications-context'
import { usePageViewTracking } from '@/lib/use-page-view-tracking'
import { useUserRole } from '@/lib/use-user-role'
import Link from 'next/link'

export default function NotificationsPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const { userRole, isLoading: isLoadingUser, isAdmin, isStudent } = useUserRole()
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    refreshNotifications 
  } = useNotifications()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Track page view to remove NEW badge
  usePageViewTracking('/notifications')

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      // Student notification types
      case 'LOGIN':
        return CheckCircle
      case 'WELCOME':
        return Info
      case 'SYSTEM':
        return AlertCircle
      case 'UPDATE':
        return CheckCircle
      case 'SECURITY':
        return Shield
      case 'PROMOTION':
        return Gift
      case 'SIGNAL':
        return Bell
      case 'COURSE':
        return Calendar
      case 'BOOKING':
        return Calendar
      case 'PAYMENT':
        return CheckCircle
      // Admin notification types
      case 'STUDENT_PURCHASE':
        return Gift
      case 'STUDENT_ENROLLMENT':
        return CheckCircle
      case 'STUDENT_REGISTRATION':
        return Calendar
      case 'STUDENT_ENQUIRY':
        return Info
      case 'STUDENT_ACTIVITY':
        return Bell
      default:
        return Bell
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  // Mark notification as read
  const handleMarkAsRead = (notificationId: string) => {
    markAsRead([notificationId])
  }

  // Mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || notification.type.toLowerCase() === filterType
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.isRead) ||
                         (filterStatus === 'unread' && !notification.isRead)
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Get type badge variant
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      // Student notification types
      case 'LOGIN': return 'default'
      case 'WELCOME': return 'secondary'
      case 'SYSTEM': return 'destructive'
      case 'UPDATE': return 'outline'
      case 'SECURITY': return 'destructive'
      case 'PROMOTION': return 'secondary'
      case 'SIGNAL': return 'signal'
      case 'COURSE': return 'outline'
      case 'BOOKING': return 'outline'
      case 'PAYMENT': return 'default'
      // Admin notification types
      case 'STUDENT_PURCHASE': return 'secondary'
      case 'STUDENT_ENROLLMENT': return 'default'
      case 'STUDENT_REGISTRATION': return 'outline'
      case 'STUDENT_ENQUIRY': return 'secondary'
      case 'STUDENT_ACTIVITY': return 'default'
      default: return 'default'
    }
  }

  // Get type color - mapped to semantic meanings
  const getTypeColor = (type: string) => {
    switch (type) {
      // Student notification types
      case 'LOGIN': return 'text-theme-success' // Success for login notifications
      case 'WELCOME': return 'text-theme-primary' // Primary for welcome messages
      case 'SYSTEM': return 'text-theme-warning' // Warning for system notifications
      case 'UPDATE': return 'text-theme-info' // Info for updates
      case 'SECURITY': return 'text-theme-error' // Error for security alerts
      case 'PROMOTION': return 'text-theme-accent' // Accent for promotional content
      case 'SIGNAL': return 'text-theme-primary' // Primary for signals
      case 'COURSE': return 'text-theme-info' // Info for course notifications
      case 'BOOKING': return 'text-theme-info' // Info for booking notifications
      case 'PAYMENT': return 'text-theme-success' // Success for payment notifications
      // Admin notification types
      case 'STUDENT_PURCHASE': return 'text-theme-accent' // Accent for student purchases
      case 'STUDENT_ENROLLMENT': return 'text-theme-success' // Success for enrollments
      case 'STUDENT_REGISTRATION': return 'text-theme-info' // Info for registrations
      case 'STUDENT_ENQUIRY': return 'text-theme-warning' // Warning for enquiries
      case 'STUDENT_ACTIVITY': return 'text-theme-primary' // Primary for general activity
      default: return 'text-theme-primary' // Neutral for unknown types
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Loading notifications...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={textHierarchy.largeHeading(isDarkMode)}>
                Notifications
              </h1>
              <p className={`${textHierarchy.subheading()} mt-2`}>
                {isAdmin 
                  ? 'Monitor student activities, enrollments, and purchases'
                  : 'Stay updated with new courses, resources, events, and signals'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshNotifications}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Mark all as read</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <EyeOff className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Read</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length - unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`px-3 py-2 border rounded-md text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">All Types</option>
                  {isAdmin ? (
                    // Admin notification types
                    <>
                      <option value="STUDENT_PURCHASE">Student Purchase</option>
                      <option value="STUDENT_ENROLLMENT">Student Enrollment</option>
                      <option value="STUDENT_REGISTRATION">Student Registration</option>
                      <option value="STUDENT_ENQUIRY">Student Enquiry</option>
                      <option value="STUDENT_ACTIVITY">Student Activity</option>
                    </>
                  ) : (
                    // Student notification types
                    <>
                      <option value="LOGIN">Login</option>
                      <option value="WELCOME">Welcome</option>
                      <option value="SYSTEM">System</option>
                      <option value="UPDATE">Update</option>
                      <option value="SECURITY">Security</option>
                      <option value="PROMOTION">Promotion</option>
                      <option value="SIGNAL">Signal</option>
                      <option value="COURSE">Course</option>
                      <option value="BOOKING">Booking</option>
                      <option value="PAYMENT">Payment</option>
                    </>
                  )}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-3 py-2 border rounded-md text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'You\'re all caught up! New notifications will appear here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              
              return (
                <Card 
                  key={notification.id}
                  className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  } ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${getTypeColor(notification.type)}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h4 className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                              {notification.type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm mt-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        {notification.actionUrl && (
                          <div className="mt-3">
                            <Link 
                              href={notification.actionUrl}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View Details →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}