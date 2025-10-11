'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TradeKojoCatchAllRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new trade-core route
    // Using replace instead of push to avoid adding to browser history
    router.replace('/trade-core')
  }, [router])

  // Show a brief loading message while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-xen-red mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Trade With CoreFX...</p>
        <p className="text-sm text-gray-500 mt-2">
          If you are not redirected automatically, 
          <a href="/trade-core" className="text-xen-red hover:underline ml-1">
            click here
          </a>
        </p>
      </div>
    </div>
  )
}
