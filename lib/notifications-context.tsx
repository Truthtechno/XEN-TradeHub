'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'LOGIN' | 'WELCOME' | 'SYSTEM' | 'UPDATE' | 'SECURITY' | 'PROMOTION' | 'SIGNAL' | 'COURSE' | 'BOOKING' | 'PAYMENT' | 'STUDENT_PURCHASE' | 'STUDENT_ENROLLMENT' | 'STUDENT_REGISTRATION' | 'STUDENT_ENQUIRY' | 'STUDENT_ACTIVITY'
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export interface NewNotification {
  id: string
  pagePath: string
  title: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

interface NotificationsContextType {
  // User notifications
  notifications: Notification[]
  isLoading: boolean
  unreadCount: number
  
  // NEW notifications (page-specific)
  newNotifications: NewNotification[]
  isLoadingNew: boolean
  
  // Actions
  markAsRead: (notificationIds: string[]) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  
  // NEW notification actions
  hasNewNotification: (pagePath: string) => boolean
  markNewAsViewed: (pagePath: string) => Promise<void>
  refreshNewNotifications: () => Promise<void>
  
  // Create notification
  createNotification: (data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  // User notifications state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // NEW notifications state
  const [newNotifications, setNewNotifications] = useState<NewNotification[]>([])
  const [isLoadingNew, setIsLoadingNew] = useState(true)
  const [viewedNewNotifications, setViewedNewNotifications] = useState<Set<string>>(new Set())

  // Load viewed NEW notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('viewedNewNotifications')
    if (stored) {
      try {
        const viewed = JSON.parse(stored)
        setViewedNewNotifications(new Set(viewed))
      } catch (error) {
        console.error('Failed to parse viewed NEW notifications from localStorage:', error)
      }
    }
  }, [])

  // Save viewed NEW notifications to localStorage
  useEffect(() => {
    if (viewedNewNotifications.size > 0) {
      localStorage.setItem('viewedNewNotifications', JSON.stringify(Array.from(viewedNewNotifications)))
    }
  }, [viewedNewNotifications])

  // Fetch user notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } else {
        console.error('Failed to fetch notifications:', response.statusText)
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
      setIsLoadingNew(true)
      const response = await fetch('/api/new-notifications', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setNewNotifications(data.notifications || [])
      } else {
        console.error('Failed to fetch NEW notifications:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch NEW notifications:', error)
    } finally {
      setIsLoadingNew(false)
    }
  }

  // Mark notifications as read
  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
        credentials: 'include'
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notificationIds.includes(notification.id) 
              ? { ...notification, isRead: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAll: true }),
        credentials: 'include'
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  // Refresh notifications
  const refreshNotifications = async () => {
    await fetchNotifications()
  }

  // Check if a page has a NEW notification
  const hasNewNotification = (pagePath: string): boolean => {
    return newNotifications.some(notification => 
      notification.pagePath === pagePath && 
      notification.isActive &&
      (!notification.expiresAt || new Date(notification.expiresAt) > new Date()) &&
      !viewedNewNotifications.has(notification.id)
    )
  }

  // Mark NEW notification as viewed
  const markNewAsViewed = async (pagePath: string) => {
    try {
      const notificationsToMark = newNotifications.filter(notification => 
        notification.pagePath === pagePath && 
        !viewedNewNotifications.has(notification.id)
      )

      if (notificationsToMark.length === 0) return

      // Update local state immediately
      const newViewedIds = notificationsToMark.map(n => n.id)
      setViewedNewNotifications(prev => new Set([...Array.from(prev), ...newViewedIds]))

      // Call API
      const response = await fetch('/api/new-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pagePath }),
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('Failed to mark NEW notification as viewed')
      }
    } catch (error) {
      console.error('Failed to mark NEW notification as viewed:', error)
    }
  }

  // Refresh NEW notifications
  const refreshNewNotifications = async () => {
    await fetchNewNotifications()
  }

  // Create notification
  const createNotification = async (data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      if (response.ok) {
        // Refresh notifications to get the new one
        await refreshNotifications()
      } else {
        console.error('Failed to create notification')
      }
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
  }

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications()
    fetchNewNotifications()
  }, [])

  const value: NotificationsContextType = {
    notifications,
    isLoading,
    unreadCount,
    newNotifications,
    isLoadingNew,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    hasNewNotification,
    markNewAsViewed,
    refreshNewNotifications,
    createNotification
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
