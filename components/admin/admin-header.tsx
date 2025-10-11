'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Bell, LogOut, Menu, Moon, RefreshCw, Settings, Sun, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSetting } from '@/lib/settings-context'
import { useTheme } from '@/lib/optimized-theme-context'
import { useAdminNotifications } from '@/lib/use-admin-notifications'

interface AdminHeaderProps {
  onMenuClick: () => void
  onNotificationsClick: () => void
  user: any
}

export function AdminHeader({ onMenuClick, onNotificationsClick, user }: AdminHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const siteName = useSetting('siteName')
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { notificationCount } = useAdminNotifications()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Refresh data logic here
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // Clear any auth tokens
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      // Redirect to main landing page where login form is located
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear any auth tokens even on error
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      // Redirect to main landing page where login form is located
      router.push('/')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'ANALYST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'EDITOR':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'SUPPORT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 sm:px-4 lg:px-6 transition-colors duration-200">
      {/* Left side */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
          <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
            <span className="hidden sm:inline">{siteName} Admin Dashboard</span>
            <span className="sm:hidden">Admin</span>
          </h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
        {/* Refresh Button - Hidden on mobile */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          className="hidden sm:flex"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>

        {/* Dark Mode Toggle - Hidden on mobile */}
        <Button 
          variant="ghost" 
          size="icon"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onClick={toggleDarkMode}
          className="hidden sm:flex"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Settings Button - Hidden on mobile */}
        <Button 
          variant="ghost" 
          size="icon"
          title="Settings"
          onClick={() => router.push('/admin/settings')}
          className="hidden sm:flex"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          title="Notifications"
          onClick={onNotificationsClick}
        >
          <Bell className="h-5 w-5" />
          {notificationCount.unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center font-bold bg-brand-primary text-white">
              {notificationCount.unread}
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
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Admin User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <Badge className={`w-fit ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
