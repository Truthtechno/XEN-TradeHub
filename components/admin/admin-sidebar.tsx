'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Users,
  TrendingUp,
  BookOpen,
  FileText,
  Settings,
  Bell,
  Megaphone,
  Link as LinkIcon,
  Shield,
  X,
  ChevronDown,
  ChevronRight,
  Crown,
  MessageCircle,
  Calendar,
  Building
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSetting } from '@/lib/settings-context'
import { useAdminNotifications } from '@/lib/use-admin-notifications'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  profile: any
  subscription: any
  brokerAccount: any
}

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  userRole: string
  user?: AdminUser
}

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  children?: MenuItem[]
  badge?: string
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    roles: ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR', 'SUPPORT']
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['SUPERADMIN', 'ADMIN', 'SUPPORT']
  },
  {
    name: 'Trade & Broker',
    href: '/admin/trade',
    icon: LinkIcon,
    roles: ['SUPERADMIN', 'ADMIN', 'ANALYST']
  },
  {
    name: 'Signals',
    href: '/admin/signals',
    icon: TrendingUp,
    roles: ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
  },
  {
    name: 'Market Analysis',
    href: '/admin/market-analysis',
    icon: BarChart3,
    roles: ['SUPERADMIN', 'ADMIN', 'ANALYST']
  },
  {
    name: 'Courses',
    href: '/admin/courses',
    icon: BookOpen,
    roles: ['SUPERADMIN', 'ADMIN', 'EDITOR']
  },
  {
    name: 'Resources',
    href: '/admin/resources',
    icon: FileText,
    roles: ['SUPERADMIN', 'ADMIN', 'EDITOR']
  },
  {
    name: 'Events',
    href: '/admin/events',
    icon: Calendar,
    roles: ['SUPERADMIN', 'ADMIN', 'EDITOR']
  },
  {
    name: 'Academy',
    href: '/admin/academy',
    icon: Building,
    roles: ['SUPERADMIN', 'ADMIN', 'EDITOR']
  },
  {
    name: 'Mentorship',
    href: '/admin/mentorship',
    icon: Users,
    roles: ['SUPERADMIN', 'ADMIN', 'SUPPORT']
  },
  {
    name: 'Enquiry',
    href: '/admin/enquiry',
    icon: MessageCircle,
    roles: ['SUPERADMIN', 'ADMIN', 'SUPPORT']
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    roles: ['SUPERADMIN', 'ADMIN', 'EDITOR']
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['SUPERADMIN', 'ADMIN']
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
    roles: ['SUPERADMIN', 'ADMIN', 'ANALYST']
  }
]

export function AdminSidebar({ isOpen, onClose, userRole, user }: AdminSidebarProps) {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const pathname = usePathname()
  const siteName = useSetting('siteName')
  const logoUrl = useSetting('logoUrl')
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { notificationCount } = useAdminNotifications()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  // Create dynamic menu items with notification counts
  const dynamicMenuItems = menuItems.map(item => {
    if (item.name === 'Notifications') {
      return {
        ...item,
        badge: notificationCount.unread > 0 ? notificationCount.unread.toString() : undefined
      }
    }
    return item
  })

  const filteredMenuItems = dynamicMenuItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="flex h-full w-full flex-col bg-theme-card border-r border-theme-border transition-colors duration-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-theme-border">
        <div className="flex items-center space-x-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${siteName} Logo`}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-theme-primary">
              <Crown className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <span className={`text-xl font-bold ${textHierarchy.largeHeading(isDarkMode)}`}>{siteName}</span>
            <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>Admin Panel</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-theme-text-tertiary hover:text-theme-text-secondary ml-auto"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-theme-border">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-theme-primary text-white font-semibold">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${textHierarchy.cardTitle(isDarkMode)} truncate`}>
                {user.name || 'Admin User'}
              </p>
              <p className={`text-xs ${textHierarchy.cardDescription()} truncate`}>
                {user.email}
              </p>
              <Badge variant="destructive" className="text-xs mt-1">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedItems.includes(item.name)
          const Icon = item.icon

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-theme-primary text-white'
                    : `text-theme-text-secondary hover:bg-theme-bg-secondary hover:text-theme-text`
                )}
                onClick={hasChildren ? (e) => {
                  e.preventDefault()
                  toggleExpanded(item.name)
                } : undefined}
              >
                <Icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-theme-text-tertiary group-hover:text-theme-text-secondary'
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
                {hasChildren && (
                  <div className="ml-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                )}
              </Link>
              
              {hasChildren && isExpanded && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname === child.href
                          ? 'bg-theme-primary text-white'
                          : `text-theme-text-tertiary hover:bg-theme-bg-secondary hover:text-theme-text`
                      )}
                    >
                      <child.icon className="mr-3 h-4 w-4 text-theme-text-tertiary group-hover:text-theme-text-secondary" />
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
