'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

interface RequirePermissionProps {
  children: React.ReactNode
  feature: string  // e.g., 'users', 'brokers', etc.
  fallback?: React.ReactNode
}

export function RequirePermission({ children, feature, fallback }: RequirePermissionProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()

  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Get current user info
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          const user = data.user

          // SUPERADMIN always has access
          if (user.role === 'SUPERADMIN') {
            setHasAccess(true)
            setIsLoading(false)
            return
          }

          // For other admin users, check permissions
          if (user.role === 'ADMIN') {
            // Fetch user's permissions
            const permResponse = await fetch(`/api/admin/features/${user.id}`)
            if (permResponse.ok) {
              const permData = await permResponse.json()
              const permissions = permData.permissions || []
              
              // Check if user has access to this feature
              const hasPermission = permissions.some((p: any) => p.feature === feature && p.canView)
              setHasAccess(hasPermission)
            } else {
              setHasAccess(false)
            }
          } else {
            // For non-admin roles, check role-based access
            setHasAccess(true) // Allow by default for ANALYST, EDITOR, SUPPORT
          }
        } else {
          setHasAccess(false)
        }
      } catch (error) {
        console.error('Error checking permissions:', error)
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPermission()
  }, [feature])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={textHierarchy.metaText(isDarkMode)}>Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    // Show custom fallback or default access denied message
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-2xl w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                <Lock className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Access Restricted
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
              You don't have permission to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              If you believe you should have access to this page, please contact your system administrator.
            </p>
            <Button
              onClick={() => router.push('/admin')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

