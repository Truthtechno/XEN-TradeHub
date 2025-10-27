'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignupRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Get the referral code from URL
    const ref = searchParams.get('ref')
    
    // Redirect to home page with referral code
    if (ref) {
      router.replace(`/?ref=${ref}&mode=signup`)
    } else {
      router.replace('/?mode=signup')
    }
  }, [router, searchParams])
  
  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to signup...</p>
      </div>
    </div>
  )
}
