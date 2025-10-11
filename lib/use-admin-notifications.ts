'use client'

import { useState, useEffect } from 'react'

interface AdminNotificationCount {
  total: number
  unread: number
}

export function useAdminNotifications() {
  const [notificationCount, setNotificationCount] = useState<AdminNotificationCount>({
    total: 0,
    unread: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotificationCount = async () => {
    try {
      // Only set loading on initial fetch, not on periodic updates
      if (notificationCount.total === 0 && notificationCount.unread === 0) {
        setIsLoading(true)
      }
      const response = await fetch('/api/admin/activity-notifications?limit=1')
      if (response.ok) {
        const data = await response.json()
        const newCount = {
          total: data.stats?.total || 0,
          unread: data.stats?.unread || 0
        }
        // Only update state if the count actually changed to prevent unnecessary re-renders
        if (newCount.total !== notificationCount.total || newCount.unread !== notificationCount.unread) {
          setNotificationCount(newCount)
        }
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotificationCount()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    notificationCount,
    isLoading,
    refreshCount: fetchNotificationCount
  }
}
