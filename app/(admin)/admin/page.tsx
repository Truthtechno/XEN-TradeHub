'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, Building, Calculator, Calendar, Calendar as CalendarIcon, CreditCard, DollarSign, Eye, FileText, GraduationCap, Hand, HelpCircle, Link as LinkIcon, RefreshCw, Settings, Shield, TrendingUp, User, UserPlus, Users } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  newUsers24h: number
  newUsers7d: number
  totalRevenue: number
  monthlyRevenue: number
  activeSubscriptions: number
  totalSignals: number
  publishedSignals: number
  signalHitRate: number
  brokerRegistrations: number
  verifiedRegistrations: number
}

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  profile: any
  subscription: any
  brokerAccount: any
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers24h: 0,
    newUsers7d: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    totalSignals: 0,
    publishedSignals: 0,
    signalHitRate: 0,
    brokerRegistrations: 0,
    verifiedRegistrations: 0
  })
  const [loading, setLoading] = useState(false) // Start with false to prevent infinite loading
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()

  useEffect(() => {
    fetchStats()
    fetchUser()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Admin dashboard loading timeout - using default stats')
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          newUsers24h: 0,
          newUsers7d: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          activeSubscriptions: 0,
          totalSignals: 0,
          publishedSignals: 0,
          signalHitRate: 0,
          brokerRegistrations: 0,
          verifiedRegistrations: 0
        })
        setLastUpdated(new Date())
        setLoading(false)
      }
    }, 3000) // 3 second timeout
    
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setLastUpdated(new Date())
      } else {
        // If not authenticated, show default stats
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          newUsers24h: 0,
          newUsers7d: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          activeSubscriptions: 0,
          totalSignals: 0,
          publishedSignals: 0,
          signalHitRate: 0,
          brokerRegistrations: 0,
          verifiedRegistrations: 0
        })
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Show default stats on error
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        newUsers24h: 0,
        newUsers7d: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        totalSignals: 0,
        publishedSignals: 0,
        signalHitRate: 0,
        brokerRegistrations: 0,
        verifiedRegistrations: 0
      })
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const adminCards = [
    {
      title: 'Users',
      description: 'Manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-slate-500', // Slate for users
      roles: ['SUPERADMIN', 'ADMIN', 'SUPPORT']
    },
    {
      title: 'Trade with Us',
      description: 'Broker partnership registrations',
      icon: Hand,
      href: '/admin/trade',
      color: 'bg-red-500', // Red for trading/broker
      roles: ['SUPERADMIN', 'ADMIN', 'ANALYST']
    },
    {
      title: 'Signals',
      description: 'Premium trading signals',
      icon: TrendingUp,
      href: '/admin/signals',
      color: 'bg-green-500', // Green for profitable signals
      roles: ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
    },
    {
      title: 'Market Analysis',
      description: 'Real-time market insights',
      icon: BarChart3,
      href: '/admin/market-analysis',
      color: 'bg-indigo-500', // Indigo for market analysis
      roles: ['SUPERADMIN', 'ADMIN', 'ANALYST']
    },
    {
      title: 'Courses',
      description: 'Master the Art & Practice of Trading',
      icon: GraduationCap,
      href: '/admin/courses',
      color: 'bg-purple-500', // Purple for education
      roles: ['SUPERADMIN', 'ADMIN', 'EDITOR']
    },
    {
      title: 'Resources',
      description: 'Educational materials',
      icon: FileText,
      href: '/admin/resources',
      color: 'bg-cyan-500', // Cyan for resources
      roles: ['SUPERADMIN', 'ADMIN', 'EDITOR']
    },
    {
      title: 'Events',
      description: 'Webinars and workshops',
      icon: Calendar,
      href: '/admin/events',
      color: 'bg-violet-500', // Violet for events
      roles: ['SUPERADMIN', 'ADMIN', 'EDITOR']
    },
    {
      title: 'Academy',
      description: 'In-person training & classes',
      icon: Building,
      href: '/admin/academy',
      color: 'bg-teal-500', // Teal for academy
      roles: ['SUPERADMIN', 'ADMIN', 'EDITOR']
    },
    {
      title: 'Mentorship',
      description: 'One-on-one coaching',
      icon: User,
      href: '/admin/mentorship',
      color: 'bg-orange-500', // Orange for mentorship
      roles: ['SUPERADMIN', 'ADMIN', 'SUPPORT']
    },
    {
      title: 'Enquiry',
      description: 'Customer inquiries & feedback',
      icon: HelpCircle,
      href: '/admin/enquiry',
      color: 'bg-pink-500', // Pink for enquiries
      roles: ['SUPERADMIN', 'ADMIN', 'SUPPORT']
    },
    {
      title: 'Notifications',
      description: 'System notifications',
      icon: Bell,
      href: '/admin/notifications',
      color: 'bg-amber-500', // Amber for notifications
      roles: ['SUPERADMIN', 'ADMIN', 'EDITOR']
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500', // Gray for settings
      roles: ['SUPERADMIN', 'ADMIN']
    },
    {
      title: 'Reports',
      description: 'Analytics and reports',
      icon: BarChart3,
      href: '/admin/reports',
      color: 'bg-emerald-500', // Emerald for reports
      roles: ['SUPERADMIN', 'ADMIN', 'ANALYST']
    }
  ]

  const filteredCards = user ? adminCards.filter(card => 
    card.roles.includes(user.role)
  ) : adminCards

  if (loading) {
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme tracking-tight">
            Welcome back, {user?.name || 'ADMIN'}! 👋
          </h1>
          <p className="text-theme-secondary text-sm sm:text-base lg:text-lg max-w-2xl">
            Here's your complete navigation hub. Click any card to access that section.
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 flex-shrink-0">
          {lastUpdated && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-right">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={fetchStats} 
            variant="outline" 
            size="sm" 
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Refresh</span>
            <span className="xs:hidden">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {filteredCards.map((card, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${card.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <card.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
              <Button 
                className="w-full bg-theme-primary hover:bg-theme-primary-700 text-white transition-colors font-medium py-2 sm:py-2.5 text-sm sm:text-base"
                onClick={() => window.location.href = card.href}
              >
                <span className="hidden xs:inline">Access Now</span>
                <span className="xs:hidden">Access</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Platform Overview
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Users */}
            <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</CardTitle>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalUsers)}</div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  +{formatNumber(stats.newUsers7d)} from last week
                </p>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</CardTitle>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.activeUsers)}</div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  +{formatNumber(stats.newUsers24h)} today
                </p>
              </CardContent>
            </Card>

            {/* Monthly Revenue */}
            <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</CardTitle>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.monthlyRevenue)}</div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {formatNumber(stats.activeSubscriptions)} active subscriptions
                </p>
              </CardContent>
            </Card>

            {/* Signal Hit Rate */}
            <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Signal Hit Rate</CardTitle>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.signalHitRate.toFixed(1)}%</div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {formatNumber(stats.publishedSignals)} signals published
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}