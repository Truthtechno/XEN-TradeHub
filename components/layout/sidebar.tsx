'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSettings } from '@/lib/settings-context'
import { useNotifications } from '@/lib/notifications-context'
import { 
  BarChart3, 
  Briefcase, 
  Copy, 
  Activity, 
  GraduationCap, 
  Bell,
  DollarSign,
  Crown,
  X,
  MessageCircle,
  Users,
  ChevronDown,
  ChevronRight,
  Trophy
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// XEN TradeHub Navigation Items
const getNavigationItems = (siteName: string) => [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Trade Through Us', href: '/brokers', icon: Briefcase },
  { 
    name: 'Copy Trading', 
    href: '/copy-trading', 
    icon: Copy,
    subItems: [
      { name: 'Browse Traders', href: '/copy-trading', icon: Copy },
      { name: 'Monthly Challenge', href: '/copy-trading/monthly-challenge', icon: Trophy }
    ]
  },
  { name: 'Academy', href: '/academy', icon: GraduationCap },
  // { name: 'Market Analysis', href: '/market-analysis', icon: Activity },
  { name: 'Earn With Us', href: '/affiliates', icon: DollarSign },
  { name: 'Live Enquiry', href: '/enquiry', icon: MessageCircle },
  { name: 'Notifications', href: '/notifications', icon: Bell },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { settings } = useSettings()
  const { hasNewNotification, markNewAsViewed } = useNotifications()
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(['Copy Trading'])

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    )
  }

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
          const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href))
          const Icon = item.icon
          const hasNew = hasNewNotification(item.href)
          const isExpanded = expandedMenus.includes(item.name)
          const hasSubItems = item.subItems && item.subItems.length > 0

          const handleClick = async (e: React.MouseEvent) => {
            if (hasSubItems) {
              e.preventDefault()
              toggleMenu(item.name)
            } else {
              if (hasNew) {
                await markNewAsViewed(item.href)
              }
              // Close mobile sidebar when navigating
              if (onClose) {
                onClose()
              }
            }
          }

          return (
            <div key={item.name}>
              <Link
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
                {hasSubItems && (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                )}
                {hasNew && (
                <Badge variant="xen-red" className="ml-2 text-xs">
                  NEW
                </Badge>
              )}
            </Link>
            
            {/* Submenu Items */}
            {hasSubItems && isExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {item.subItems!.map((subItem) => {
                  const isSubActive = pathname === subItem.href
                  const SubIcon = subItem.icon

                  return (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      onClick={() => onClose && onClose()}
                      className={cn(
                        'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isSubActive
                          ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      <SubIcon
                        className={cn(
                          'mr-3 h-4 w-4 flex-shrink-0',
                          isSubActive ? 'text-brand-primary' : 'text-gray-400 dark:text-gray-500'
                        )}
                      />
                      <span>{subItem.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
          )
        })}
      </nav>
    </div>
  )
}
