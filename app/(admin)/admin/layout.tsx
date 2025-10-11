'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'
import { AdminRightPanels } from '@/components/admin/admin-right-panels'
import { NewNotificationsProvider } from '@/lib/new-notifications-context'
import { useAdminNotifications } from '@/lib/use-admin-notifications'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

// Use a more flexible user type that works with JWT auth
type SessionUser = {
  id?: string
  email?: string
  name?: string | null
  image?: string | null
  role?: string
  profile?: any
  subscription?: any
  brokerAccount?: any
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const router = useRouter()
  const { notificationCount } = useAdminNotifications()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          const adminRoles = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR', 'SUPPORT']
          
          if (adminRoles.includes(data.user.role)) {
            setUser(data.user)
          } else {
            // Redirect to dashboard if not admin
            router.push('/dashboard')
            return
          }
        } else {
          // Redirect to main landing page where login form is located
          router.push('/')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Redirect to main landing page where login form is located
        router.push('/')
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className={textHierarchy.metaText(isDarkMode)}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }


  return (
    <NewNotificationsProvider>
      <div className="flex h-screen bg-theme transition-colors duration-200">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <AdminSidebar 
            isOpen={true} 
            onClose={() => {}}
            userRole={user?.role || 'STUDENT'}
            user={user ? {
              id: user.id || '',
              email: user.email || '',
              name: user.name || null,
              role: user.role || 'STUDENT',
              profile: user.profile || null,
              subscription: user.subscription || null,
              brokerAccount: user.brokerAccount || null
            } : undefined}
          />
        </div>
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex w-64 flex-col h-full bg-theme-card">
            <AdminSidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)}
              userRole={user?.role || 'STUDENT'}
              user={user ? {
              id: user.id || '',
              email: user.email || '',
              name: user.name || null,
              role: user.role || 'STUDENT',
              profile: user.profile || null,
              subscription: user.subscription || null,
              brokerAccount: user.brokerAccount || null
            } : undefined}
            />
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
            <AdminHeader 
              onMenuClick={() => setSidebarOpen(true)}
              onNotificationsClick={() => setIsNotificationsOpen(true)}
              user={user ? {
              id: user.id || '',
              email: user.email || '',
              name: user.name || null,
              role: user.role || 'STUDENT',
              profile: user.profile || null,
              subscription: user.subscription || null,
              brokerAccount: user.brokerAccount || null
            } : undefined}
            />
          
          <main className="flex-1 overflow-y-auto bg-theme transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
              <AdminBreadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Right Panels */}
      <AdminRightPanels
        isNotificationsOpen={isNotificationsOpen}
        onClose={(panel) => {
          if (panel === 'notifications') {
            setIsNotificationsOpen(false)
          }
        }}
        user={user}
        notifications={notificationCount.unread}
      />
    </NewNotificationsProvider>
  )
}
