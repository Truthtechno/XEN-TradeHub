'use client'

import React, { useState } from 'react'
import { Bell, Calculator, Calendar, Grid3X3, LogOut, Menu, Settings, TrendingUp, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RightPanels } from './right-panels'
import { useNotifications } from '@/lib/notifications-context'

interface HeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  onMenuClick?: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const [isForecastOpen, setIsForecastOpen] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { unreadCount, hasNewNotification, markNewAsViewed } = useNotifications()

  // Listen for custom event to open calculator panel
  React.useEffect(() => {
    const handleOpenCalculator = () => {
      setIsCalculatorOpen(true)
    }

    window.addEventListener('openCalculatorPanel', handleOpenCalculator)
    return () => {
      window.removeEventListener('openCalculatorPanel', handleOpenCalculator)
    }
  }, [])

  // Listen for custom event to open forecast panel
  React.useEffect(() => {
    const handleOpenForecast = () => {
      setIsForecastOpen(true)
    }

    window.addEventListener('openForecastPanel', handleOpenForecast)
    return () => {
      window.removeEventListener('openForecastPanel', handleOpenForecast)
    }
  }, [])

  const handleClosePanel = (panel: string) => {
    switch (panel) {
      case 'forecast':
        setIsForecastOpen(false)
        break
      case 'calculator':
        setIsCalculatorOpen(false)
        break
      case 'settings':
        setIsSettingsOpen(false)
        break
      case 'notifications':
        setIsNotificationsOpen(false)
        break
    }
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 lg:px-6 transition-colors duration-200">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Forecast Button - Icon only on mobile, full button on desktop */}
          <Button 
            variant="xen-blue" 
            className="relative"
            onClick={async () => {
              if (hasNewNotification('/forecast')) {
                await markNewAsViewed('/forecast')
              }
              setIsForecastOpen(true)
            }}
            title="Forecast"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Forecast</span>
            {hasNewNotification('/forecast') && (
              <Badge variant="xen-red" className="absolute -top-2 -right-2 text-xs">
                NEW
              </Badge>
            )}
          </Button>

          {/* Calculator Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsCalculatorOpen(true)}
            title="Lot Size Calculator"
          >
            <Calculator className="h-5 w-5" />
          </Button>

          {/* Settings Button - Hidden on mobile, accessible via profile menu */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            className="hidden sm:flex"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setIsNotificationsOpen(true)}
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge variant="xen-red" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center font-bold">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/'
                } catch (error) {
                  console.error('Logout error:', error)
                }
              }}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Right Panels */}
      <RightPanels
        isForecastOpen={isForecastOpen}
        isCalculatorOpen={isCalculatorOpen}
        isSettingsOpen={isSettingsOpen}
        isNotificationsOpen={isNotificationsOpen}
        onClose={handleClosePanel}
        user={user}
        notifications={unreadCount}
      />
    </>
  )
}
