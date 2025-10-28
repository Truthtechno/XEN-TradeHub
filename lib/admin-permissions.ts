import { prisma } from './prisma'

export interface UserPermissions {
  [feature: string]: {
    canView: boolean
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canExport: boolean
    canApprove: boolean
  }
}

/**
 * Get all permissions for a specific user
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  try {
    const permissions = await prisma.adminFeature.findMany({
      where: { userId },
      select: {
        feature: true,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canApprove: true
      }
    })

    // Convert array to object for easy lookup
    const permissionsMap: UserPermissions = {}
    
    permissions.forEach(p => {
      permissionsMap[p.feature] = {
        canView: p.canView,
        canCreate: p.canCreate,
        canEdit: p.canEdit,
        canDelete: p.canDelete,
        canExport: p.canExport,
        canApprove: p.canApprove
      }
    })

    return permissionsMap
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return {}
  }
}

/**
 * Check if a user has permission for a specific feature and action
 * Simplified version: if a user has access to a feature, they have all actions
 */
export async function hasPermission(
  userId: string, 
  feature: string, 
  action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve' = 'view'
): Promise<boolean> {
  // SUPERADMIN always has all permissions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (user?.role === 'SUPERADMIN') {
    return true
  }

  // For other admin users, check the permissions in the database
  // In the simplified system, we just check if they canView (which means they can access the page)
  const permission = await prisma.adminFeature.findUnique({
    where: { 
      userId_feature: { userId, feature }
    }
  })

  if (!permission) {
    return false
  }

  // Simplified: if canView is true, they can access the feature and perform all actions
  return permission.canView || false
}

/**
 * Middleware function to check permissions before allowing access
 */
export async function requirePermission(
  userId: string,
  feature: string,
  action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve'
): Promise<{ authorized: boolean; reason?: string }> {
  const authorized = await hasPermission(userId, feature, action)
  
  if (!authorized) {
    return {
      authorized: false,
      reason: `User does not have ${action} permission for ${feature}`
    }
  }

  return { authorized: true }
}

/**
 * Get a mapping of features to check
 */
export function getFeatureForPath(path: string): string | null {
  // Map URL paths to feature names
  const featureMap: Record<string, string> = {
    '/admin/users': 'users',
    '/admin/brokers': 'brokers',
    '/admin/copy-trading': 'copy_trading',
    '/admin/signals': 'signals',
    '/admin/market-analysis': 'market_analysis',
    '/admin/academy': 'academy',
    '/admin/affiliates': 'affiliates',
    '/admin/enquiry': 'enquiry',
    '/admin/notifications': 'notifications',
    '/admin/settings': 'settings',
    '/admin/reports': 'reports'
  }

  // Find matching feature
  for (const [pathPattern, feature] of Object.entries(featureMap)) {
    if (path.includes(pathPattern)) {
      return feature
    }
  }

  return null
}

