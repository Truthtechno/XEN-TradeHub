'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSettings } from '@/lib/settings-context'
import { useNotifications } from '@/lib/notifications-context'
import { 
  BarChart3, 
  Hand, 
  TrendingUp, 
  Activity, 
  GraduationCap, 
  Users, 
  Building, 
  BookOpen, 
  Calendar, 
  HelpCircle, 
  Crown,
  Bell,
  X
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// This will be moved inside the component to use dynamic settings
const getNavigationItems = (siteName: string) => [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: `Trade With ${siteName}`, href: '/trade-core', icon: Hand },
  { name: 'Signals', href: '/signals', icon: TrendingUp },
  { name: 'Market Analysis', href: '/market-analysis', icon: Activity },
  { name: 'Online Course', href: '/courses', icon: GraduationCap },
  { name: 'One on One', href: '/one-on-one', icon: Users },
  { name: 'Academy', href: '/academy', icon: Building },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Live Enquiry', href: '/enquiry', icon: HelpCircle },
  { name: 'Notifications', href: '/notifications', icon: Bell },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { settings } = useSettings()
  const { hasNewNotification, markNewAsViewed } = useNotifications()

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={`${settings.siteName} Logo`}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary">
              <Crown className="h-5 w-5 text-white" />
            </div>
          )}
          <span className="text-xl font-bold text-gray-900 dark:text-white">{settings.siteName}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-auto"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {getNavigationItems(settings.siteName).map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const hasNew = hasNewNotification(item.href)

          const handleClick = async () => {
            if (hasNew) {
              await markNewAsViewed(item.href)
            }
            // Close mobile sidebar when navigating
            if (onClose) {
              onClose()
            }
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClick}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                )}
              />
              <span className="flex-1">{item.name}</span>
              {hasNew && (
                <Badge variant="xen-red" className="ml-2 text-xs">
                  NEW
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
