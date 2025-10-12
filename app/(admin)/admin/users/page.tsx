'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Download, Edit, Eye, Filter, Mail, MoreHorizontal, Save, Search, User, UserX, X, Crown, Shield, Star, Zap, Clock, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { getCountryFromPhoneNumber } from '@/lib/country-utils'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import { useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface User {
  id: string
  email: string
  name: string
  role: string
  hasMentorship: boolean
  lastLoginAt: string | null
  createdAt: string
  profile?: {
    country?: string
    phone?: string
    whatsappNumber?: string
    firstName?: string
    lastName?: string
    isActive?: boolean
  }
  subscription?: {
    plan: string
    status: string
    currentPeriodEnd?: string
  } | null
  mentorshipPayments?: {
    amount: number
    status: string
    createdAt: string
  }[]
  adminProfile?: {
    country?: string
    phone?: string
    telegram?: string
  }
  _count?: {
    orders: number
    pollVotes: number
    affiliateClicks: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const { data: session, status } = useSession()
  const [showUserDetails, setShowUserDetails] = useState(false)
  
  const [userDetails, setUserDetails] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    country: '',
    subscriptionType: 'NONE',
    subscriptionPlan: 'MONTHLY'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [detailsEditForm, setDetailsEditForm] = useState({
    name: '',
    email: '',
    role: '',
    country: '',
    phone: '',
    whatsappNumber: '',
    telegram: ''
  })
  const [isSavingDetails, setIsSavingDetails] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showEmailOptions, setShowEmailOptions] = useState(false)
  const [emailSubject, setEmailSubject] = useState('CoreFX - Admin Communication')
  const [emailBody, setEmailBody] = useState('Dear CoreFX User,\n\nThis is an important communication from the CoreFX admin team.\n\nBest regards,\nCoreFX Admin Team')

  const fetchUsers = async (isRefresh = false) => {
    // Only show loading state on initial load, not on refreshes
    if (!isRefresh) {
      setIsLoading(true)
    }
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      params.append('limit', '100') // Increase limit to show more users
      
      console.log('Fetching users from:', `/api/admin/users?${params.toString()}`)
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to fetch users: ${response.status} ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Users data received:', data)
      console.log('Users count:', data.users?.length)
      console.log('Total users:', data.pagination?.total)
      setUsers(data.users || [])
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Failed to fetch users:', message)
    } finally {
      if (!isRefresh) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchUsers() // Initial load

    // Auto-refresh users every 60 seconds, but only if the page is visible
    const refreshInterval = setInterval(() => {
      // Only refresh if the page is visible to prevent unnecessary API calls
      if (!document.hidden) {
        console.log('Auto-refreshing users...')
        fetchUsers(true) // Pass true to indicate this is a refresh
      }
    }, 60000) // 60 seconds - reduced frequency to prevent flickering

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval)
  }, [roleFilter])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(true) // Pass true to indicate this is a refresh
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const fetchUserDetails = async (userId: string) => {
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user details')
      }
      const data = await response.json()
      setUserDetails(data)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Failed to fetch user details:', message)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleViewDetails = async (user: User) => {
    console.log('View details clicked for user:', user)
    setSelectedUser(user)
    setShowUserDetails(true)
    await fetchUserDetails(user.id)
  }

  const handleEditUser = (user: User) => {
    console.log('Edit user clicked for user:', user)
    setEditingUser(user)
    
    // Determine subscription type and plan based on user data
    let subscriptionType = 'NONE'
    let subscriptionPlan = 'MONTHLY'
    
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      // User has an active subscription
      subscriptionPlan = user.subscription.plan || 'MONTHLY'
      if (user.role === 'PREMIUM') {
        subscriptionType = 'PREMIUM'
      } else if (user.role === 'SIGNALS') {
        subscriptionType = 'SIGNALS'
      }
    } else if (user.role === 'PREMIUM') {
      // User has PREMIUM role but no active subscription
      subscriptionType = 'PREMIUM'
    } else if (user.role === 'SIGNALS') {
      // User has SIGNALS role but no active subscription
      subscriptionType = 'SIGNALS'
    }
    
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      country: getCountry(user),
      subscriptionType: subscriptionType,
      subscriptionPlan: subscriptionPlan
    })
    // Close any open dropdown menus
    document.body.click()
    // Show a brief notification
    console.log(`Editing user: ${user.name}`)
  }

  const handleSaveUser = async () => {
    if (!editingUser) return
    
    
    setIsSaving(true)
    try {
      // Update basic user information
      const userResponse = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          country: editForm.country
        }),
      })
      
      if (!userResponse.ok) {
        const error = await userResponse.json()
        alert(error.error || 'Failed to update user')
        console.error('Failed to update user:', error)
        return
      }

      // Update subscription if it changed
      // Determine current subscription type based on actual subscription data, not just role
      let currentSubscriptionType = 'NONE'
      if (editingUser.subscription) {
        // If user has an active subscription, determine type from subscription data
        if (editingUser.subscription.plan === 'MONTHLY' || editingUser.subscription.plan === 'YEARLY') {
          // Check if it's a premium subscription by looking at the role or subscription type
          currentSubscriptionType = editingUser.role === 'PREMIUM' ? 'PREMIUM' : 'SIGNALS'
        }
      } else if (editingUser.role === 'PREMIUM') {
        // If user has PREMIUM role but no subscription, they might have premium access without subscription
        currentSubscriptionType = 'PREMIUM'
      } else if (editingUser.role === 'SIGNALS') {
        // If user has SIGNALS role but no subscription, they might have signals access
        currentSubscriptionType = 'SIGNALS'
      }
      
      console.log('Current subscription type:', currentSubscriptionType)
      console.log('New subscription type:', editForm.subscriptionType)
      console.log('User role:', editingUser.role)
      console.log('User subscription:', editingUser.subscription)
      
      if (editForm.subscriptionType !== currentSubscriptionType) {
        console.log('Subscription changed, updating...')
        try {
          const subscriptionResponse = await fetch('/api/admin/users/subscription', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: editingUser.id,
              subscriptionType: editForm.subscriptionType,
              plan: editForm.subscriptionPlan,
              reason: 'Admin subscription update'
            }),
          })
          
          console.log('Subscription response status:', subscriptionResponse.status)
          
          if (!subscriptionResponse.ok) {
            const error = await subscriptionResponse.json()
            console.error('Subscription update failed:', error)
            alert(`User updated but subscription update failed: ${error.message}`)
            return // Don't continue if subscription update fails
          } else {
            const result = await subscriptionResponse.json()
            console.log('Subscription update successful:', result)
          }
        } catch (subscriptionError: unknown) {
          const message = subscriptionError instanceof Error ? subscriptionError.message : String(subscriptionError);
          console.error('Subscription update error:', message)
          alert(`User updated but subscription update failed: ${message}`)
          return // Don't continue if subscription update fails
        }
      }
      
      await fetchUsers(true) // Refresh the list
      setEditingUser(null)
      setEditForm({ name: '', email: '', role: '', country: '', subscriptionType: 'NONE', subscriptionPlan: 'MONTHLY' })
      alert(`User ${editingUser.name} updated successfully!`)
      console.log('User updated successfully:', editingUser.name)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Failed to update user:', message)
      alert('Failed to update user')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({ name: '', email: '', role: '', country: '', subscriptionType: 'NONE', subscriptionPlan: 'MONTHLY' })
  }

  const handleEditDetails = () => {
    if (!userDetails) return
    
    setIsEditingDetails(true)
    setDetailsEditForm({
      name: userDetails.name || '',
      email: userDetails.email || '',
      role: userDetails.role || '',
      country: getCountry(userDetails),
      phone: userDetails.profile?.phone || userDetails.adminProfile?.phone || '',
      whatsappNumber: userDetails.profile?.whatsappNumber || '',
      telegram: userDetails.adminProfile?.telegram || ''
    })
  }

  const handleSaveDetails = async () => {
    if (!userDetails) return
    
    setIsSavingDetails(true)
    try {
      const response = await fetch(`/api/admin/users/${userDetails.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: detailsEditForm.name,
          email: detailsEditForm.email,
          role: detailsEditForm.role,
          country: detailsEditForm.country
        }),
      })
      
      if (response.ok) {
        // Update the user details with the new data
        setUserDetails({
          ...userDetails,
          name: detailsEditForm.name,
          email: detailsEditForm.email,
          role: detailsEditForm.role,
          profile: {
            ...userDetails.profile,
            phone: detailsEditForm.phone,
            whatsappNumber: detailsEditForm.whatsappNumber,
            country: detailsEditForm.country
          },
          adminProfile: {
            ...userDetails.adminProfile,
            telegram: detailsEditForm.telegram
          }
        })
        
        // Refresh the users list
        await fetchUsers(true)
        
        setIsEditingDetails(false)
        alert(`User ${detailsEditForm.name} updated successfully!`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update user')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Failed to update user details:', message)
      alert('Failed to update user details')
    } finally {
      setIsSavingDetails(false)
    }
  }

  const handleCancelDetailsEdit = () => {
    setIsEditingDetails(false)
    setDetailsEditForm({
      name: '',
      email: '',
      role: '',
      country: '',
      phone: '',
      whatsappNumber: '',
      telegram: ''
    })
  }

  const handleDeactivateUser = async (user: User) => {
    console.log('Delete user clicked for user:', user)
    if (confirm(`Are you sure you want to permanently delete ${user.name}? This will completely remove all user data and cannot be undone.`)) {
      try {
        // Use the batch delete API with hard delete for individual users
        const response = await fetch('/api/admin/users', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userIds: [user.id],
            hardDelete: true
          })
        })
        
        if (response.ok) {
          await fetchUsers(true) // Refresh the list
          alert('User deleted successfully!')
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to delete user')
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Failed to delete user:', message)
        alert('Failed to delete user')
      }
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleBatchDelete = async () => {
    if (selectedUsers.length === 0) return
    
    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userIds: selectedUsers,
          hardDelete: true // Use hard delete to completely remove users
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete users')
      }
      
      const result = await response.json()
      console.log('Batch delete result:', result)
      
      // Clear selection and refresh users
      setSelectedUsers([])
      setShowDeleteDialog(false)
      
      // Show success message
      alert(`Successfully deleted ${result.count} users. The page will refresh to show the updated list.`)
      
      // Small delay to ensure the alert is seen, then refresh
      setTimeout(async () => {
        await fetchUsers(true)
      }, 100)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Failed to delete users:', message)
      alert('Failed to delete users. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/users/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to export users')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      alert('Users exported successfully!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Failed to export users:', message)
      alert('Failed to export users. Please try again.')
    }
  }

  const handleSendEmail = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to send email to.')
      return
    }
    
    // Get emails of selected users
    const selectedUserEmails = selectedUsers
      .map(userId => {
        const user = users.find(u => u.id === userId)
        return user?.email
      })
      .filter(Boolean) // Remove any undefined emails
    
    if (selectedUserEmails.length === 0) {
      alert('No valid email addresses found for selected users.')
      return
    }
    
    // Debug: Log selected users and emails
    console.log('Selected users:', selectedUsers)
    console.log('Selected emails:', selectedUserEmails)
    
    // Show email options dialog
    setShowEmailOptions(true)
  }

  const handleOpenEmailApp = () => {
    // Get emails of selected users
    const selectedUserEmails = selectedUsers
      .map(userId => {
        const user = users.find(u => u.id === userId)
        return user?.email
      })
      .filter((e): e is string => Boolean(e)) // Type-safe filter to ensure string[]
    
    // Create mailto URL with custom subject and body
    const mailtoUrl = createMailtoUrl(selectedUserEmails, emailSubject, emailBody)
    
    // Debug: Log the mailto URL
    console.log('Opening mailto URL:', mailtoUrl)
    console.log('Selected emails:', selectedUserEmails)
    
    // Open default email app
    window.open(mailtoUrl, '_blank')
    
    // Close options dialog
    setShowEmailOptions(false)
  }

  const createMailtoUrl = (emails: string[], subject: string, body: string) => {
    // Join emails with comma and space for better readability
    const recipients = emails.join(', ')
    
    // Encode subject and body for URL
    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(body)
    
    // Create mailto URL
    return `mailto:${recipients}?subject=${encodedSubject}&body=${encodedBody}`
  }


  // Users are already filtered server-side
  const filteredUsers = users

  const getCountry = (user: User) => {
    // First try to get country from phone number
    const phoneNumber = user.profile?.whatsappNumber || user.profile?.phone || user.adminProfile?.phone
    if (phoneNumber) {
      const detectedCountry = getCountryFromPhoneNumber(phoneNumber)
      if (detectedCountry !== 'N/A') {
        return detectedCountry
      }
    }
    
    // Fallback to stored country
    return user.profile?.country || user.adminProfile?.country || 'N/A'
  }

  const getSubscriptionStatus = (user: User) => {
    // Check if user has mentorship payment (PREMIUM)
    const hasMentorshipPayment = user.mentorshipPayments && user.mentorshipPayments.length > 0
    
    // Check if user has active subscription first (prioritize subscription over role)
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      const isExpired = user.subscription.currentPeriodEnd && 
        new Date(user.subscription.currentPeriodEnd) < new Date()
      
      if (isExpired) {
        return {
          status: 'SIGNALS EXPIRED',
          type: 'expired',
          description: 'Signals subscription expired'
        }
      }

      // Determine subscription type based on user role when they have an active subscription
      if (user.role === 'PREMIUM') {
        return {
          status: 'PREMIUM ACTIVE',
          type: 'premium',
          description: 'Full access to all features'
        }
      } else if (user.role === 'SIGNALS') {
        return {
          status: 'SIGNALS ACTIVE',
          type: 'signals',
          description: 'Premium signals access'
        }
      } else {
        // Fallback to signals if they have a subscription but unclear role
        return {
          status: 'SIGNALS ACTIVE',
          type: 'signals',
          description: 'Premium signals access'
        }
      }
    }
    
    // If no active subscription, check if user has premium role or mentorship payment
    if (hasMentorshipPayment || user.role === 'PREMIUM') {
      return {
        status: 'PREMIUM ACTIVE',
        type: 'premium',
        description: 'Full access to all features'
      }
    }

    return {
      status: 'No subscription',
      type: 'basic',
      description: 'Basic access only'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' // Bright red for highest authority
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' // Bright blue for admin
      case 'ANALYST':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100' // Bright cyan for analysts
      case 'EDITOR':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' // Bright purple for editors
      case 'SUPPORT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' // Bright orange for support
      case 'AFFILIATE':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100' // Bright pink for affiliates
      case 'PREMIUM':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-100' // Bright green gradient for premium
      case 'SIGNALS':
        return 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 dark:from-indigo-900 dark:to-blue-900 dark:text-indigo-100' // Bright indigo-blue gradient for signals
      case 'STUDENT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' // Bright gray for students
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' // Bright gray default
    }
  }

  const getSubscriptionBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' // Bright green for active
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' // Bright red for cancelled
      case 'PAST_DUE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' // Bright yellow for past due
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' // Bright gray for default
    }
  }

  // Generate user avatar with initials
  const getUserAvatar = (user: User) => {
    const name = user.name || user.email
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    return initials
  }

  // Get user avatar background color based on role
  const getUserAvatarColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-gradient-to-br from-red-500 to-red-700'
      case 'ADMIN':
        return 'bg-gradient-to-br from-blue-500 to-blue-700'
      case 'ANALYST':
        return 'bg-gradient-to-br from-cyan-500 to-cyan-700'
      case 'EDITOR':
        return 'bg-gradient-to-br from-purple-500 to-purple-700'
      case 'SUPPORT':
        return 'bg-gradient-to-br from-orange-500 to-orange-700'
      case 'AFFILIATE':
        return 'bg-gradient-to-br from-pink-500 to-pink-700'
      case 'PREMIUM':
        return 'bg-gradient-to-br from-emerald-500 to-emerald-700'
      case 'SIGNALS':
        return 'bg-gradient-to-br from-indigo-500 to-indigo-700'
      case 'STUDENT':
        return 'bg-gradient-to-br from-gray-500 to-gray-700'
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-700'
    }
  }

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return <Crown className="h-3 w-3" />
      case 'ADMIN':
        return <Shield className="h-3 w-3" />
      case 'ANALYST':
        return <Zap className="h-3 w-3" />
      case 'EDITOR':
        return <Edit className="h-3 w-3" />
      case 'SUPPORT':
        return <User className="h-3 w-3" />
      case 'AFFILIATE':
        return <Star className="h-3 w-3" />
      case 'PREMIUM':
        return <Crown className="h-3 w-3" />
      case 'SIGNALS':
        return <Zap className="h-3 w-3" />
      case 'STUDENT':
        return <User className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  // Get subscription status icon
  const getSubscriptionIcon = (subStatus: any) => {
    switch (subStatus.type) {
      case 'premium':
        return <Crown className="h-3 w-3" />
      case 'signals':
        return <Zap className="h-3 w-3" />
      case 'expired':
        return <XCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  // Get activity status based on last login
  const getActivityStatus = (lastLoginAt: string | null) => {
    if (!lastLoginAt) return { status: 'inactive', label: 'Never', color: 'text-gray-500' }
    
    const lastLogin = new Date(lastLoginAt)
    const now = new Date()
    const diffInHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return { status: 'active', label: 'Active', color: 'text-green-500' }
    } else if (diffInHours < 168) { // 7 days
      return { status: 'recent', label: 'Recent', color: 'text-yellow-500' }
    } else {
      return { status: 'inactive', label: 'Inactive', color: 'text-gray-500' }
    }
  }


  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-theme-bg-secondary rounded-lg w-32 animate-pulse"></div>
            <div className="h-4 bg-theme-bg-secondary rounded w-64 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-theme-bg-secondary rounded-lg w-24 animate-pulse"></div>
            <div className="h-10 bg-theme-bg-secondary rounded-lg w-28 animate-pulse"></div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <div className="h-6 bg-theme-bg-secondary rounded w-16 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 h-10 bg-theme-bg-secondary rounded-lg animate-pulse"></div>
              <div className="w-48 h-10 bg-theme-bg-secondary rounded-lg animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Users List Skeleton */}
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <div className="h-6 bg-theme-bg-secondary rounded w-24 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Table Header Skeleton */}
              <div className="hidden md:flex items-center px-4 py-3 bg-theme-bg-secondary/30 rounded-lg">
                <div className="w-8 h-4 bg-theme-bg-secondary rounded animate-pulse"></div>
                <div className="w-12 h-4 bg-theme-bg-secondary rounded animate-pulse ml-4"></div>
                <div className="flex-1 h-4 bg-theme-bg-secondary rounded animate-pulse ml-4"></div>
                <div className="w-32 h-4 bg-theme-bg-secondary rounded animate-pulse ml-4"></div>
                <div className="w-24 h-4 bg-theme-bg-secondary rounded animate-pulse ml-4"></div>
                <div className="w-48 h-4 bg-theme-bg-secondary rounded animate-pulse ml-4"></div>
                <div className="w-32 h-4 bg-theme-bg-secondary rounded animate-pulse ml-4"></div>
              </div>
              
              {/* List Items Skeleton */}
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="bg-theme-card border-theme-border">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-theme-bg-secondary rounded animate-pulse"></div>
                      <div className="w-10 h-10 bg-theme-bg-secondary rounded-full animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <div className="h-4 bg-theme-bg-secondary rounded w-32 animate-pulse"></div>
                          <div className="h-5 bg-theme-bg-secondary rounded w-16 animate-pulse"></div>
                        </div>
                        <div className="h-3 bg-theme-bg-secondary rounded w-48 animate-pulse"></div>
                      </div>
                      <div className="w-20 h-5 bg-theme-bg-secondary rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-theme-bg-secondary rounded animate-pulse"></div>
                      <div className="w-32 h-4 bg-theme-bg-secondary rounded animate-pulse"></div>
                      <div className="w-24 h-8 bg-theme-bg-secondary rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme tracking-tight truncate">
              Users
            </h1>
          </div>
          <p className="text-theme-secondary text-sm sm:text-base lg:text-lg max-w-2xl">
            Manage user accounts, roles, and subscriptions
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 flex-shrink-0">
          <Button 
            variant="outline" 
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Export CSV</span>
            <span className="xs:hidden">Export</span>
          </Button>
          <Button 
            variant="theme-secondary"
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            onClick={handleSendEmail}
          >
            <Mail className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Send Email</span>
            <span className="xs:hidden">Email</span>
          </Button>
          {selectedUsers.length > 0 && (
            <Button 
              variant="theme-error"
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            >
              <UserX className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Delete ({selectedUsers.length})</span>
              <span className="xs:hidden">Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Q Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col xs:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Q Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="xs:w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              >
                <option value="all">All Roles</option>
                <option value="SUPERADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="ANALYST">Analyst</option>
                <option value="EDITOR">Editor</option>
                <option value="SUPPORT">Support</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Users ({filteredUsers.length})</CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                A grid of all users in the system
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <input
                type="checkbox"
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Select All</span>
            </div>
          </div>
          
          {/* Statistics Summary */}
          {filteredUsers.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredUsers.filter(u => u.role === 'STUDENT').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Students</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredUsers.filter(u => getSubscriptionStatus(u).type === 'premium' || getSubscriptionStatus(u).type === 'signals').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Premium</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredUsers.filter(u => u.hasMentorship).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Mentorship</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredUsers.filter(u => getActivityStatus(u.lastLoginAt).status === 'active').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Active</div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-theme-bg-secondary rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-theme-text-secondary" />
              </div>
              <h3 className={`text-lg font-semibold ${textHierarchy.cardTitle(isDarkMode)} mb-2`}>
                No users found
              </h3>
              <p className={`text-sm ${textHierarchy.cardDescription()} mb-4 max-w-md`}>
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters to find users.'
                  : 'No users have been registered yet. Users will appear here once they sign up.'
                }
              </p>
              {(searchTerm || roleFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('all')
                  }}
                  className="border-theme-border text-theme-text hover:bg-theme-bg-secondary"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="hidden md:flex items-center px-4 py-3 bg-theme-bg-secondary/30 rounded-lg text-xs font-medium text-theme-text-secondary border-b border-theme-border-secondary">
                <div className="w-8"></div> {/* Checkbox space */}
                <div className="w-12"></div> {/* Avatar space */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <span>User</span>
                    <span className="text-xs text-theme-text-secondary">•</span>
                    <span>Role</span>
                  </div>
                </div>
                <div className="w-32 text-center">Subscription</div>
                <div className="w-24 text-center">Activity</div>
                <div className="w-48 text-center">Additional Info</div>
                <div className="w-32 text-center">Actions</div>
              </div>
              
              {filteredUsers.map((user) => {
              const subStatus = getSubscriptionStatus(user)
              const activityStatus = getActivityStatus(user.lastLoginAt)
              
              return (
                <Card 
                  key={user.id} 
                  className={`group bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${
                    editingUser?.id === user.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${selectedUsers.includes(user.id) ? 'ring-2 ring-blue-500 shadow-md' : ''}`}
                >
                  <CardContent className="p-3 sm:p-4">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden space-y-3">
                      {/* Header with checkbox, avatar, and actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <div className={`w-10 h-10 ${getUserAvatarColor(user.role)} rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800`}>
                            <span className="text-white font-bold text-xs">
                              {getUserAvatar(user)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(user)}
                            className="h-7 w-7 p-0 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            className="h-7 w-7 p-0 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {editingUser?.id === user.id ? (
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="text-sm font-semibold"
                              placeholder="User name"
                            />
                          ) : (
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                              {user.name || 'Unknown User'}
                            </h3>
                          )}
                          {getRoleIcon(user.role)}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                        {editingUser?.id === user.id ? (
                          <div className="space-y-2">
                            <select
                              value={editForm.role}
                              onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="STUDENT">STUDENT</option>
                              <option value="SIGNALS">SIGNALS</option>
                              <option value="PREMIUM">PREMIUM</option>
                              <option value="AFFILIATE">AFFILIATE</option>
                              <option value="SUPPORT">SUPPORT</option>
                              <option value="EDITOR">EDITOR</option>
                              <option value="ANALYST">ANALYST</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="SUPERADMIN">SUPERADMIN</option>
                            </select>
                            <div className="space-y-1">
                              <label className="text-xs text-gray-600 dark:text-gray-400">Subscription</label>
                              <select
                                value={editForm.subscriptionType}
                                onChange={(e) => setEditForm({...editForm, subscriptionType: e.target.value})}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="NONE">No Subscription</option>
                                <option value="SIGNALS">Signals Subscription</option>
                                <option value="PREMIUM">Premium Subscription</option>
                              </select>
                              {editForm.subscriptionType === 'SIGNALS' && (
                                <select
                                  value={editForm.subscriptionPlan}
                                  onChange={(e) => setEditForm({...editForm, subscriptionPlan: e.target.value})}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                  <option value="MONTHLY">Monthly</option>
                                  <option value="YEARLY">Yearly</option>
                                </select>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Badge className={`${getRoleBadgeColor(user.role)} text-xs px-2 py-0.5 font-medium w-fit`}>
                            {user.role}
                          </Badge>
                        )}
                      </div>

                      {/* Status and Info Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Subscription Status */}
                        <div className="flex items-center space-x-1">
                          {getSubscriptionIcon(subStatus)}
                          <Badge className={`${
                            subStatus.type === 'premium' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' :
                            subStatus.type === 'signals' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' :
                            subStatus.type === 'expired' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                            'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                          } text-xs px-2 py-0.5 font-medium shadow-sm`}>
                            {subStatus.status}
                          </Badge>
                        </div>

                        {/* Activity Status */}
                        <div className="flex items-center space-x-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            activityStatus.status === 'active' ? 'bg-green-500' :
                            activityStatus.status === 'recent' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <span className={`text-xs ${activityStatus.color} font-medium`}>
                            {activityStatus.label}
                          </span>
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                          <Globe className="h-3 w-3" />
                          <span className="truncate">{getCountry(user)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                          <User className="h-3 w-3" />
                          <span>{user.hasMentorship ? 'Mentor' : 'No'}</span>
                        </div>
                      </div>

                      {/* Edit Actions */}
                      {editingUser?.id === user.id && (
                        <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            onClick={handleSaveUser}
                            disabled={isSaving}
                            variant="theme-success"
                            className="h-7 px-3 text-xs"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="h-7 px-3 text-xs border-gray-300 dark:border-gray-600"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center space-x-4">
                      {/* Checkbox and Avatar */}
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <div className={`w-10 h-10 ${getUserAvatarColor(user.role)} rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800`}>
                          <span className="text-white font-bold text-xs">
                            {getUserAvatar(user)}
                          </span>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {editingUser?.id === user.id ? (
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="text-sm font-semibold"
                              placeholder="User name"
                            />
                          ) : (
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {user.name || 'Unknown User'}
                            </h3>
                          )}
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(user.role)}
                            {editingUser?.id === user.id ? (
                              <div className="space-y-2">
                                <select
                                  value={editForm.role}
                                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                  <option value="STUDENT">STUDENT</option>
                                  <option value="SIGNALS">SIGNALS</option>
                                  <option value="PREMIUM">PREMIUM</option>
                                  <option value="AFFILIATE">AFFILIATE</option>
                                  <option value="SUPPORT">SUPPORT</option>
                                  <option value="EDITOR">EDITOR</option>
                                  <option value="ANALYST">ANALYST</option>
                                  <option value="ADMIN">ADMIN</option>
                                  <option value="SUPERADMIN">SUPERADMIN</option>
                                </select>
                                <div className="space-y-1">
                                  <label className="text-xs text-gray-600 dark:text-gray-400">Subscription</label>
                                  <select
                                    value={editForm.subscriptionType}
                                    onChange={(e) => setEditForm({...editForm, subscriptionType: e.target.value})}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  >
                                    <option value="NONE">No Subscription</option>
                                    <option value="SIGNALS">Signals Subscription</option>
                                    <option value="PREMIUM">Premium Subscription</option>
                                  </select>
                                  {editForm.subscriptionType === 'SIGNALS' && (
                                    <select
                                      value={editForm.subscriptionPlan}
                                      onChange={(e) => setEditForm({...editForm, subscriptionPlan: e.target.value})}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                      <option value="MONTHLY">Monthly</option>
                                      <option value="YEARLY">Yearly</option>
                                    </select>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <Badge className={`${getRoleBadgeColor(user.role)} text-xs px-2 py-0.5 font-medium`}>
                                {user.role}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Subscription Status */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {getSubscriptionIcon(subStatus)}
                        <Badge className={`${
                          subStatus.type === 'premium' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' :
                          subStatus.type === 'signals' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' :
                          subStatus.type === 'expired' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                          'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        } text-xs px-2 py-0.5 font-medium shadow-sm`}>
                          {subStatus.status}
                        </Badge>
                      </div>

                      {/* Activity Status */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          activityStatus.status === 'active' ? 'bg-green-500' :
                          activityStatus.status === 'recent' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-xs ${activityStatus.color} font-medium`}>
                          {activityStatus.label}
                        </span>
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span className="truncate max-w-16">{getCountry(user)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span className="hidden lg:inline">{user.hasMentorship ? 'Mentor' : 'No'}</span>
                          <span className="lg:hidden">{user.hasMentorship ? 'M' : 'N'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className="truncate max-w-12">{formatDate(user.lastLoginAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {editingUser?.id === user.id ? (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={handleSaveUser}
                              disabled={isSaving}
                              variant="theme-success"
                              className="h-7 px-2 text-xs"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="h-7 px-2 text-xs border-gray-300 dark:border-gray-600"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(user)}
                              className="h-7 w-7 p-0 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(user)}
                              className="h-7 w-7 p-0 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <DropdownMenuLabel className="text-gray-900 dark:text-white">More Actions</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => handleDeactivateUser(user)}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-theme-card border-theme-border">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className={textHierarchy.largeHeading(isDarkMode)}>User Details</DialogTitle>
                <DialogDescription className={textHierarchy.subheading()}>
                  Complete information about {selectedUser?.name || 'the user'}
                </DialogDescription>
              </div>
              <div className="flex space-x-2">
                {!isEditingDetails ? (
                  <Button
                    variant="theme-primary"
                    onClick={handleEditDetails}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="theme-success"
                      onClick={handleSaveDetails}
                      disabled={isSavingDetails}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSavingDetails ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={handleCancelDetailsEdit}
                      variant="outline"
                      className="border-theme-border"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-theme-card border-theme-border">
                  <CardHeader>
                    <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Name</label>
                      {isEditingDetails ? (
                        <Input
                          value={detailsEditForm.name}
                          onChange={(e) => setDetailsEditForm({...detailsEditForm, name: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className={textHierarchy.cardTitle(isDarkMode)}>{userDetails.name || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Email</label>
                      {isEditingDetails ? (
                        <Input
                          value={detailsEditForm.email}
                          onChange={(e) => setDetailsEditForm({...detailsEditForm, email: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className={textHierarchy.cardTitle(isDarkMode)}>{userDetails.email}</p>
                      )}
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Role</label>
                      {isEditingDetails ? (
                        <select
                          value={detailsEditForm.role}
                          onChange={(e) => setDetailsEditForm({...detailsEditForm, role: e.target.value})}
                          className="mt-1 w-full px-3 py-2 border border-theme-border rounded-md bg-theme-bg text-theme-text"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="AFFILIATE">AFFILIATE</option>
                          <option value="SUPPORT">SUPPORT</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="ANALYST">ANALYST</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPERADMIN">SUPERADMIN</option>
                        </select>
                      ) : (
                        <Badge className={getRoleBadgeColor(userDetails.role)}>
                          {userDetails.role}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Created</label>
                      <p className={textHierarchy.cardTitle(isDarkMode)}>{formatDate(userDetails.createdAt)}</p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Last Login</label>
                      <p className={textHierarchy.cardTitle(isDarkMode)}>{formatDate(userDetails.lastLoginAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-theme-card border-theme-border">
                  <CardHeader>
                    <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Country</label>
                      {isEditingDetails ? (
                        <Input
                          value={detailsEditForm.country}
                          onChange={(e) => setDetailsEditForm({...detailsEditForm, country: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className={textHierarchy.cardTitle(isDarkMode)}>
                          {getCountry(userDetails)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Phone</label>
                      {isEditingDetails ? (
                        <Input
                          value={detailsEditForm.phone}
                          onChange={(e) => setDetailsEditForm({...detailsEditForm, phone: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className={textHierarchy.cardTitle(isDarkMode)}>
                          {userDetails.profile?.phone || userDetails.adminProfile?.phone || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>WhatsApp</label>
                      {isEditingDetails ? (
                        <Input
                          value={detailsEditForm.whatsappNumber}
                          onChange={(e) => setDetailsEditForm({...detailsEditForm, whatsappNumber: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className={textHierarchy.cardTitle(isDarkMode)}>
                          {userDetails.profile?.whatsappNumber || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Telegram</label>
                      {isEditingDetails ? (
                        <Input
                          value={detailsEditForm.telegram}
                          onChange={(e) => setDetailsEditForm({...detailsEditForm, telegram: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className={textHierarchy.cardTitle(isDarkMode)}>
                          {userDetails.adminProfile?.telegram || 'N/A'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Information */}
              <Card className="bg-theme-card border-theme-border">
                <CardHeader>
                  <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Subscription Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {userDetails.subscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Plan</span>
                        <Badge className={getSubscriptionBadgeColor(userDetails.subscription.status)}>
                          {userDetails.subscription.plan}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Status</span>
                        <span className={textHierarchy.cardTitle(isDarkMode)}>{userDetails.subscription.status}</span>
                      </div>
                      {userDetails.subscription.currentPeriodStart && (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Current Period</span>
                          <span className={textHierarchy.cardTitle(isDarkMode)}>
                            {formatDate(userDetails.subscription.currentPeriodStart)} - {formatDate(userDetails.subscription.currentPeriodEnd)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className={textHierarchy.cardDescription()}>No active subscription</p>
                  )}
                </CardContent>
              </Card>

              {/* Engagement Statistics */}
              <Card className="bg-theme-card border-theme-border">
                <CardHeader>
                  <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Engagement Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${textHierarchy.cardTitle(isDarkMode)}`}>
                        {userDetails._count?.orders || 0}
                      </div>
                      <div className={textHierarchy.cardDescription()}>Orders</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${textHierarchy.cardTitle(isDarkMode)}`}>
                        {userDetails._count?.pollVotes || 0}
                      </div>
                      <div className={textHierarchy.cardDescription()}>Poll Votes</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${textHierarchy.cardTitle(isDarkMode)}`}>
                        {userDetails._count?.affiliateClicks || 0}
                      </div>
                      <div className={textHierarchy.cardDescription()}>Affiliate Clicks</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={textHierarchy.cardDescription()}>Failed to load user details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-theme-card border-theme-border">
          <DialogHeader>
            <DialogTitle className="text-theme-error">Confirm Permanent Delete</DialogTitle>
            <DialogDescription className={textHierarchy.subheading()}>
              Are you sure you want to permanently delete {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}? 
              This will completely remove all user data and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="theme-error"
              onClick={handleBatchDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deactivating...' : `Deactivate ${selectedUsers.length} User${selectedUsers.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Options Dialog */}
      <Dialog open={showEmailOptions} onOpenChange={setShowEmailOptions}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-theme-card border-theme-border">
          <DialogHeader>
            <DialogTitle className="text-theme-primary flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Email {selectedUsers.length} User{selectedUsers.length > 1 ? 's' : ''}</span>
            </DialogTitle>
            <DialogDescription className={textHierarchy.subheading()}>
              Customize your email and it will open in your default email app with the selected recipients.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Recipients Preview */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Recipients ({selectedUsers.length})</label>
              <div className="max-h-32 overflow-y-auto border border-theme-border rounded-md p-3 bg-theme-bg-secondary">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedUsers.map(userId => {
                    const user = users.find(u => u.id === userId)
                    return user ? (
                      <div key={userId} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-theme-primary rounded-full"></div>
                        <span className={textHierarchy.cardTitle(isDarkMode)}>{user.name || user.email}</span>
                        <span className="text-theme-muted">({user.email})</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Subject</label>
              <Input
                placeholder="Enter email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)}`}>Message</label>
              <textarea
                placeholder="Write your email message here..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full h-48 p-3 border border-theme-border rounded-md resize-none focus:ring-2 focus:ring-theme-primary focus:border-transparent bg-theme-bg text-theme-text"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-theme-border">
              <Button
                variant="outline"
                onClick={() => {
                  // Test mailto with a simple example
                  const testUrl = 'mailto:test@example.com?subject=Test&body=This is a test email'
                  console.log('Testing mailto with:', testUrl)
                  window.open(testUrl, '_blank')
                }}
                className="text-xs"
              >
                Test Mailto
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEmailOptions(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOpenEmailApp}
                  disabled={!emailSubject.trim() || !emailBody.trim()}
                  variant="theme-primary"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Open Email App
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
