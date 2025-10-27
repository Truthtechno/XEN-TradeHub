'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Shield, 
  Search, 
  Save, 
  X, 
  Check, 
  Users,
  Briefcase,
  Copy,
  TrendingUp,
  Activity,
  GraduationCap,
  DollarSign,
  MessageCircle,
  Bell,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
}

interface FeaturePermission {
  feature: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canExport: boolean
  canApprove: boolean
}

interface UserPermissions {
  userId: string
  userName: string
  userEmail: string
  userRole: string
  permissions: FeaturePermission[]
}

const AVAILABLE_FEATURES = [
  { key: 'users', name: 'Users Management', icon: Users, description: 'Manage user accounts and profiles' },
  { key: 'brokers', name: 'Brokers', icon: Briefcase, description: 'Manage broker partnerships and accounts' },
  { key: 'copy_trading', name: 'Copy Trading', icon: Copy, description: 'Manage master traders and subscriptions' },
  { key: 'signals', name: 'Trading Signals', icon: TrendingUp, description: 'Create and manage trading signals' },
  { key: 'market_analysis', name: 'Market Analysis', icon: Activity, description: 'Publish market insights and forecasts' },
  { key: 'academy', name: 'Academy Classes', icon: GraduationCap, description: 'Manage training classes and sessions' },
  { key: 'affiliates', name: 'Affiliate Program', icon: DollarSign, description: 'Manage affiliate commissions and payouts' },
  { key: 'enquiry', name: 'Live Enquiry', icon: MessageCircle, description: 'Handle customer inquiries and support' },
  { key: 'notifications', name: 'Notifications', icon: Bell, description: 'Send system notifications and banners' },
  { key: 'settings', name: 'System Settings', icon: Settings, description: 'Configure system-wide settings' },
  { key: 'reports', name: 'Reports & Analytics', icon: BarChart3, description: 'View and export system reports' }
]

const PERMISSION_TYPES = [
  { key: 'canView', label: 'View', icon: Eye, description: 'Can view and access the feature' },
  { key: 'canCreate', label: 'Create', icon: Edit, description: 'Can create new records' },
  { key: 'canEdit', label: 'Edit', icon: Edit, description: 'Can modify existing records' },
  { key: 'canDelete', label: 'Delete', icon: Trash2, description: 'Can delete records' },
  { key: 'canExport', label: 'Export', icon: Download, description: 'Can export data' },
  { key: 'canApprove', label: 'Approve', icon: CheckCircle, description: 'Can approve/verify submissions' }
]

export default function FeaturesPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [userPermissions, setUserPermissions] = useState<FeaturePermission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()

  useEffect(() => {
    fetchAdminUsers()
  }, [])

  const fetchAdminUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/features/users', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      console.log('Fetch response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Received admin users:', data.users)
        setAdminUsers(data.users || [])
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch admin users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserPermissions = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/features/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUserPermissions(data.permissions || [])
      }
    } catch (error) {
      console.error('Failed to fetch user permissions:', error)
    }
  }

  const handleSelectUser = async (user: AdminUser) => {
    setSelectedUser(user)
    setHasChanges(false)
    await fetchUserPermissions(user.id)
  }

  const handlePermissionChange = (featureKey: string, permissionKey: string, value: boolean) => {
    setHasChanges(true)
    setUserPermissions(prev => {
      const existing = prev.find(p => p.feature === featureKey)
      if (existing) {
        return prev.map(p => 
          p.feature === featureKey 
            ? { ...p, [permissionKey]: value }
            : p
        )
      } else {
        return [...prev, {
          feature: featureKey,
          canView: permissionKey === 'canView' ? value : false,
          canCreate: permissionKey === 'canCreate' ? value : false,
          canEdit: permissionKey === 'canEdit' ? value : false,
          canDelete: permissionKey === 'canDelete' ? value : false,
          canExport: permissionKey === 'canExport' ? value : false,
          canApprove: permissionKey === 'canApprove' ? value : false
        }]
      }
    })
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/features/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions: userPermissions })
      })
      
      if (response.ok) {
        setHasChanges(false)
        alert('Permissions updated successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update permissions')
      }
    } catch (error) {
      console.error('Failed to save permissions:', error)
      alert('Failed to save permissions')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetPermissions = () => {
    if (selectedUser) {
      fetchUserPermissions(selectedUser.id)
      setHasChanges(false)
    }
  }

  const getPermissionValue = (featureKey: string, permissionKey: string): boolean => {
    const feature = userPermissions.find(p => p.feature === featureKey)
    return feature ? feature[permissionKey as keyof FeaturePermission] as boolean : false
  }

  const filteredUsers = adminUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme tracking-tight truncate">
              Features & Permissions
            </h1>
          </div>
          <p className="text-theme-secondary text-sm sm:text-base lg:text-lg max-w-2xl">
            Control what admin users can access and do in the system
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAdminUsers}
          className="border-gray-300 dark:border-gray-600"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Admin Users List */}
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Admin Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              Select a user to manage permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm"
              />
            </div>

            {/* Users List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedUser?.id === user.id
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-400'
                      : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                      user.role === 'SUPERADMIN' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {user.name || 'Admin User'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <Badge 
                        variant={user.role === 'SUPERADMIN' ? 'destructive' : 'outline'}
                        className="text-xs mt-1"
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600 dark:text-gray-400">No admin users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Grid */}
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedUser ? `Permissions for ${selectedUser.name || selectedUser.email}` : 'Select a User'}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedUser ? 'Configure feature access and actions' : 'Choose an admin user from the list to manage their permissions'}
                </CardDescription>
              </div>
              {selectedUser && hasChanges && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetPermissions}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSavePermissions}
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-4">
                {/* Permissions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          Feature
                        </th>
                        {PERMISSION_TYPES.map(type => (
                          <th key={type.key} className="text-center py-3 px-2 text-xs font-semibold text-gray-900 dark:text-white">
                            <div className="flex flex-col items-center space-y-1">
                              <type.icon className="h-4 w-4" />
                              <span className="hidden sm:inline">{type.label}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AVAILABLE_FEATURES.map((feature, index) => (
                        <tr 
                          key={feature.key}
                          className={`border-b border-gray-100 dark:border-gray-800 ${
                            index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <feature.icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {feature.name}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          {PERMISSION_TYPES.map(type => (
                            <td key={type.key} className="text-center py-3 px-2">
                              <label className="inline-flex items-center justify-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={getPermissionValue(feature.key, type.key)}
                                  onChange={(e) => handlePermissionChange(feature.key, type.key, e.target.checked)}
                                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                />
                              </label>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View - Cards */}
                <div className="lg:hidden space-y-4">
                  {AVAILABLE_FEATURES.map(feature => (
                    <Card key={feature.key} className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <feature.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                              {feature.name}
                            </CardTitle>
                            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">
                              {feature.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {PERMISSION_TYPES.map(type => (
                            <label key={type.key} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={getPermissionValue(feature.key, type.key)}
                                onChange={(e) => handlePermissionChange(feature.key, type.key, e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-900 dark:text-white">{type.label}</span>
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No User Selected
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                  Select an admin user from the list on the left to view and manage their feature permissions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
