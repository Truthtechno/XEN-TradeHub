'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useSettings } from '@/lib/settings-context'

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function OptimizedThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSetting } = useSettings()

  // Determine if dark mode is active based on settings
  const isDarkMode = settings.theme === 'dark' || 
    (settings.theme === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Remove DOM manipulation - let inline scripts and OptimizedDynamicStyles handle it
  // This component now only provides context, not DOM manipulation

  const toggleDarkMode = async () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    try {
      // Update localStorage immediately
      localStorage.setItem('theme', newTheme)
      
      // Apply theme immediately to DOM
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
        // Set dark mode CSS variables immediately
        document.documentElement.style.setProperty('--color-bg', '#0F172A')
        document.documentElement.style.setProperty('--color-text', '#F8FAFC')
        document.documentElement.style.setProperty('--color-bg-secondary', '#1E293B')
        document.documentElement.style.setProperty('--color-text-secondary', '#CBD5E1')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
        // Set light mode CSS variables immediately
        document.documentElement.style.setProperty('--color-bg', '#FFFFFF')
        document.documentElement.style.setProperty('--color-text', '#0F172A')
        document.documentElement.style.setProperty('--color-bg-secondary', '#F8FAFC')
        document.documentElement.style.setProperty('--color-text-secondary', '#475569')
      }
      
      // Simplified - let CSS handle text colors to prevent conflicts
      
      // Update settings in database
      await updateSetting('theme', newTheme)
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within an OptimizedThemeProvider')
  }
  return context
}
