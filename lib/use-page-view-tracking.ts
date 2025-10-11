'use client'

import { useEffect } from 'react'
import { useNotifications } from './notifications-context'

/**
 * Hook to automatically mark NEW notifications as viewed when a page loads
 * Use this hook on pages that should remove NEW badges when visited
 */
export function usePageViewTracking(pagePath: string) {
  const { hasNewNotification, markNewAsViewed } = useNotifications()

  useEffect(() => {
    // Check if there's a NEW notification for this page and mark it as viewed
    if (hasNewNotification(pagePath)) {
      markNewAsViewed(pagePath)
    }
  }, [pagePath, hasNewNotification, markNewAsViewed])
}
