'use client'

import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/lib/settings-context'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export function ThemeToggle({ 
  className = '', 
  size = 'md',
  variant = 'ghost'
}: ThemeToggleProps) {
  const { settings, updateSetting } = useSettings()

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    try {
      await updateSetting('theme', newTheme)
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }

  const getIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getNextTheme = () => {
    switch (settings.theme) {
      case 'light':
        return 'dark'
      case 'dark':
        return 'auto'
      default:
        return 'light'
    }
  }

  const getTooltip = () => {
    switch (settings.theme) {
      case 'light':
        return 'Switch to dark mode'
      case 'dark':
        return 'Switch to auto mode'
      default:
        return 'Switch to light mode'
    }
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={() => handleThemeChange(getNextTheme())}
      className={`${sizeClasses[size]} ${className}`}
      title={getTooltip()}
    >
      {getIcon()}
    </Button>
  )
}
