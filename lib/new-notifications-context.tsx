'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface NewNotification {
  id: string
  pagePath: string
  title: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

interface NewNotificationsContextType {
  notifications: NewNotification[]
  isLoading: boolean
  hasNewNotification: (pagePath: string) => boolean
  markAsViewed: (pagePath: string) => Promise<void>
  refreshNotifications: () => Promise<void>
  addNewNotification: (notification: NewNotification) => void
}

const NewNotificationsContext = createContext<NewNotificationsContextType | undefined>(undefined)

export function NewNotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NewNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewedNotifications, setViewedNotifications] = useState<Set<string>>(new Set())

  // Load viewed notifications from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('viewedNotifications')
    if (stored) {
      try {
        const viewed = JSON.parse(stored)
        setViewedNotifications(new Set(viewed))
        console.log('Loaded viewed notifications from localStorage:', viewed)
      } catch (error) {
        console.error('Failed to parse viewed notifications from localStorage:', error)
      }
    }
  }, [])

  // Save viewed notifications to localStorage whenever it changes
  React.useEffect(() => {
    if (viewedNotifications.size > 0) {
      localStorage.setItem('viewedNotifications', JSON.stringify(Array.from(viewedNotifications)))
      console.log('Saved viewed notifications to localStorage:', Array.from(viewedNotifications))
    }
  }, [viewedNotifications])

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      console.log('Fetching NEW notifications...')
      const response = await fetch('/api/new-notifications', {
        credentials: 'include'
      })
      console.log('NEW notifications response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('NEW notifications data:', data)
        setNotifications(data.notifications || [])
      } else {
        const errorData = await response.json()
        console.error('NEW notifications API error:', errorData)
      }
    } catch (error) {
      console.error('Failed to fetch NEW notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if a page has a NEW notification (not yet viewed)
  const hasNewNotification = (pagePath: string): boolean => {
    const hasNotification = notifications.some(notification => 
      notification.pagePath === pagePath && 
      notification.isActive &&
      (!notification.expiresAt || new Date(notification.expiresAt) > new Date()) &&
      !viewedNotifications.has(notification.id) // Only show if not viewed
    )
    console.log(`Checking NEW notification for ${pagePath}:`, hasNotification, 'Total notifications:', notifications.length, 'Viewed:', Array.from(viewedNotifications))
    return hasNotification
  }

  // Mark a notification as viewed
  const markAsViewed = async (pagePath: string): Promise<void> => {
    try {
      // Find notifications for this page path that haven't been viewed yet
      const notificationsToMark = notifications.filter(notification => 
        notification.pagePath === pagePath && 
        !viewedNotifications.has(notification.id)
      )

      if (notificationsToMark.length === 0) {
        console.log('No unviewed notifications to mark for', pagePath)
        return
      }

      // Mark them as viewed in local state immediately
      const newViewedIds = notificationsToMark.map(n => n.id)
      setViewedNotifications(prev => new Set([...Array.from(prev), ...newViewedIds]))
      
      console.log('Marked notifications as viewed:', newViewedIds)

      // Also call the API to mark them as viewed in the database
      const response = await fetch('/api/new-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pagePath }),
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('Failed to mark notification as viewed in database')
      }
    } catch (error) {
      console.error('Failed to mark notification as viewed:', error)
    }
  }

  // Add a new notification (for real-time updates)
  const addNewNotification = (notification: NewNotification): void => {
    setNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(n => n.id === notification.id)
      if (exists) {
        console.log('Notification already exists:', notification.id)
        return prev
      }
      
      console.log('Adding new notification:', notification)
      return [notification, ...prev]
    })
  }

  // Refresh notifications
  const refreshNotifications = async (): Promise<void> => {
    setIsLoading(true)
    await fetchNotifications()
  }

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  const value: NewNotificationsContextType = {
    notifications,
    isLoading,
    hasNewNotification,
    markAsViewed,
    refreshNotifications,
    addNewNotification,
  }

  return (
    <NewNotificationsContext.Provider value={value}>
      {children}
    </NewNotificationsContext.Provider>
  )
}

export function useNewNotifications() {
  const context = useContext(NewNotificationsContext)
  if (context === undefined) {
    throw new Error('useNewNotifications must be used within a NewNotificationsProvider')
  }
  return context
}
