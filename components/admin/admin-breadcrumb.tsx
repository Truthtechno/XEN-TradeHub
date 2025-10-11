'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export function AdminBreadcrumb() {
  const pathname = usePathname()
  
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // Remove 'admin' from the beginning if it exists
  if (pathSegments[0] === 'admin') {
    pathSegments.shift()
  }

  const breadcrumbItems = [
    { name: 'Admin', href: '/admin', icon: Home }
  ]

  // Add dynamic breadcrumb items based on path
  if (pathSegments.length > 0) {
    const currentPath = pathSegments.join('/')
    
    // Map path segments to readable names
    const segmentNames: Record<string, string> = {
      'users': 'Users',
      'trade': 'Trade & Broker',
      'signals': 'Signals',
      'courses': 'Courses',
      'resources': 'Resources',
      'events': 'Events',
      'notifications': 'Notifications',
      'banners': 'Banners',
      'settings': 'Settings',
      'features': 'Features',
      'reports': 'Reports'
    }

    let currentHref = '/admin'
    pathSegments.forEach((segment, index) => {
      currentHref += `/${segment}`
      const name = segmentNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      
      breadcrumbItems.push({
        name,
        href: currentHref,
        icon: ChevronRight
      })
    })
  }

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          
          return (
            <li key={item.href} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-1" />
              )}
              
              {isLast ? (
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-xen-red dark:hover:text-xen-red flex items-center transition-colors"
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
