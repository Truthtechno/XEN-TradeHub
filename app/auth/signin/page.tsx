'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  // Redirect to the main landing page where the actual login form is located
  useEffect(() => {
    // Clear any existing auth tokens
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Redirect to the main landing page (/) where the login form is located
    router.replace('/')
  }, [router])

  // Show loading message while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to login page...</p>
      </div>
    </div>
  )
}