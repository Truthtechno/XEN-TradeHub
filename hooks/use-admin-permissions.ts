import { useState, useEffect } from 'react'
import { hasPermission } from '@/lib/admin-permissions'

export interface UseAdminPermissionsResult {
  permissions: {
    [feature: string]: {
      canView: boolean
      canCreate: boolean
      canEdit: boolean
      canDelete: boolean
      canExport: boolean
      canApprove: boolean
    }
  }
  hasPermission: (feature: string, action: string) => boolean
  isLoading: boolean
}

export function useAdminPermissions(userId: string | null, userRole: string | null): UseAdminPermissionsResult {
  const [permissions, setPermissions] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId || !userRole) {
      setIsLoading(false)
      return
    }

    // SUPERADMIN has all permissions by default
    if (userRole === 'SUPERADMIN') {
      // Create a permissions object where all permissions are true
      const allPermissions: any = {}
      const features = ['users', 'brokers', 'copy_trading', 'signals', 'market_analysis', 'academy', 'affiliates', 'enquiry', 'notifications', 'settings', 'reports']
      
      features.forEach(feature => {
        allPermissions[feature] = {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
          canApprove: true
        }
      })
      
      setPermissions(allPermissions)
      setIsLoading(false)
      return
    }

    // For other roles, fetch permissions from API
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`/api/admin/features/${userId}`)
        if (response.ok) {
          const data = await response.json()
          // Convert array to object
          const permissionsMap: any = {}
          data.permissions.forEach((p: any) => {
            permissionsMap[p.feature] = {
              canView: p.canView,
              canCreate: p.canCreate,
              canEdit: p.canEdit,
              canDelete: p.canDelete,
              canExport: p.canExport,
              canApprove: p.canApprove
            }
          })
          setPermissions(permissionsMap)
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error)
        setPermissions({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermissions()
  }, [userId, userRole])

  const checkPermission = (feature: string, action: string): boolean => {
    if (!permissions[feature]) {
      return false
    }
    
    const actionMap: Record<string, string> = {
      'view': 'canView',
      'create': 'canCreate',
      'edit': 'canEdit',
      'delete': 'canDelete',
      'export': 'canExport',
      'approve': 'canApprove'
    }

    const permissionKey = actionMap[action]
    return permissions[feature][permissionKey] || false
  }

  return {
    permissions,
    hasPermission: checkPermission,
    isLoading
  }
}

