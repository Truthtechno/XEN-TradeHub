'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSettings } from './settings-context'

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSetting } = useSettings()

  // Determine if dark mode is active based on settings
  const isDarkMode = settings.theme === 'dark' || 
    (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    // Apply theme to document based on settings
    const applyTheme = () => {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
      } else {
        // Auto theme - follow system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
          document.body.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
          document.body.classList.remove('dark')
        }
      }
    }

    applyTheme()
  }, [settings.theme])

  const toggleDarkMode = async () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    try {
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
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
