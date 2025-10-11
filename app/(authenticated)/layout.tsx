'use client'

import React, { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
// Removed old notification system - now using unified notifications context
import { EnrolledCoursesProvider } from '@/lib/use-enrolled-courses'
import { LessonProgressProvider } from '@/lib/use-lesson-progress'

// Component that uses the notifications context
function AuthenticatedContent({ 
  children, 
  user 
}: { 
  children: React.ReactNode
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
}) {
  return (
    <MainLayout user={user}>
      {children}
    </MainLayout>
  )
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<{ name?: string | null; email?: string | null; image?: string | null; role?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Redirect to main landing page where login form is located
          window.location.href = '/'
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        window.location.href = '/'
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return (
    <EnrolledCoursesProvider>
      <LessonProgressProvider>
        <AuthenticatedContent user={user}>
          {children}
        </AuthenticatedContent>
      </LessonProgressProvider>
    </EnrolledCoursesProvider>
  )
}
