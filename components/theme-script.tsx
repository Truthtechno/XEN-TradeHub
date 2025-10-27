'use client'

import { useEffect } from 'react'

export function ThemeScript() {
  useEffect(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light'
    const savedSettings = localStorage.getItem('app-settings')
    
    // Apply theme class immediately to prevent flash
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
    
    // Apply saved settings immediately if available
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        const root = document.documentElement
        
        // Apply colors immediately
        if (settings.lightModeColors) {
          Object.entries(settings.lightModeColors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key.replace('Color', '')}`, value as string)
          })
        }
        
        if (settings.darkModeColors) {
          Object.entries(settings.darkModeColors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key.replace('Color', '')}`, value as string)
          })
        }
        
        // Apply typography
        if (settings.headingFont) {
          root.style.setProperty('--font-heading', `'${settings.headingFont}', sans-serif`)
        }
        if (settings.bodyFont) {
          root.style.setProperty('--font-body', `'${settings.bodyFont}', sans-serif`)
        }
        if (settings.monoFont) {
          root.style.setProperty('--font-mono', `'${settings.monoFont}', monospace`)
        }
      } catch (error) {
        console.warn('Failed to parse saved settings:', error)
      }
    }
  }, [])

  return null
}
