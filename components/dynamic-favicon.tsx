'use client'

import { useSettings } from '@/lib/settings-context'
import Head from 'next/head'
import { useEffect } from 'react'

export function DynamicFavicon() {
  const { settings } = useSettings()

  useEffect(() => {
    if (settings.faviconUrl) {
      // Update the favicon link
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link')
      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      link.href = settings.faviconUrl
      document.getElementsByTagName('head')[0].appendChild(link)
    }
  }, [settings.faviconUrl])

  return null
}
