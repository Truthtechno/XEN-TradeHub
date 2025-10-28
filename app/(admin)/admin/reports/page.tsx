'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Calendar, DollarSign, Download, Eye, FileText, FileSpreadsheet, Filter, RefreshCw, TrendingUp, Users, Building, GraduationCap, Copy, MessageCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import { RequirePermission } from '@/components/admin/require-permission'

interface ReportData {
  users: {
    total: number
    new: number
    active: number
    churn: number
  }
  revenue: {
    total: number
    monthly: number
    growth: number
  }
  copyTrading: {
    totalTrades: number
    activeCopiers: number
    successRate: number
  }
  academy: {
    totalCourses: number
    enrollments: number
    revenue: number
  }
  affiliates: {
    totalAffiliates: number
    commissions: number
    revenue: number
  }
  broker: {
    registrations: number
  }
  enquiries: {
    total: number
    resolved: number
    pending: number
  }
}

interface ChartData {
  name: string
  value: number
  trades?: number
  copiers?: number
  enrollments?: number
  revenue?: number
  affiliates?: number
  commissions?: number
  color?: string
}

export default function ReportsPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [revenueChartData, setRevenueChartData] = useState<ChartData[]>([])
  const [userChartData, setUserChartData] = useState<ChartData[]>([])
  const [copyTradingChartData, setCopyTradingChartData] = useState<ChartData[]>([])
  const [academyChartData, setAcademyChartData] = useState<ChartData[]>([])
  const [affiliatesChartData, setAffiliatesChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('all')
  const [reportType, setReportType] = useState('overview')

  const fetchReportData = async () => {
    setIsLoading(true)
    console.log('🔄 Fetching report data with dateRange:', dateRange)
    try {
      const url = `/api/admin/reports/simple?dateRange=${dateRange}&_t=${Date.now()}`
      console.log('📡 API URL:', url)
      const response = await fetch(url, { cache: 'no-store' })
      console.log('📥 Response status:', response.status)
      if (!response.ok) {
        throw new Error('Failed to fetch report data')
      }
      const data = await response.json()
      console.log('✅ Report data received:', data)
      console.log('📊 Setting report data:', data.data)
      
      setReportData(data.data)
    } catch (error) {
      console.error('❌ Failed to fetch report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChartData = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/reports/charts?type=${type}&dateRange=${dateRange}&_t=${Date.now()}`, {
        cache: 'no-store'
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} chart data`)
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(`Failed to fetch ${type} chart data:`, error)
      return []
    }
  }

  const fetchAllChartData = async () => {
    const [revenue, users, copyTrading, academy, affiliates] = await Promise.all([
      fetchChartData('revenue'),
      fetchChartData('users'),
      fetchChartData('copyTrading'),
      fetchChartData('academy'),
      fetchChartData('affiliates')
    ])
    
    console.log('Chart Data Fetched:', {
      revenue: revenue?.length || 0,
      users: users?.length || 0,
      copyTrading: copyTrading?.length || 0,
      academy: academy?.length || 0,
      affiliates: affiliates?.length || 0
    })
    
    setRevenueChartData(revenue)
    setUserChartData(users)
    setCopyTradingChartData(copyTrading)
    setAcademyChartData(academy)
    setAffiliatesChartData(affiliates)
  }

  useEffect(() => {
    console.log('🔄 Date Range Changed:', dateRange)
    fetchReportData()
    fetchAllChartData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const exportReport = async (type: string, format: string = 'excel') => {
    setIsExporting(`${type}-${format}`)
    try {
      const response = await fetch('/api/admin/reports/export-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: type,
          format: format,
          dateRange: dateRange
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      if (format === 'csv' || format === 'excel') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const fileExtension = format === 'excel' ? 'xlsx' : 'csv'
        a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${fileExtension}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else if (format === 'pdf') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(null)
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  return (
    <RequirePermission feature="reports">
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-theme tracking-tight">Reports & Analytics</h1>
          <p className="text-theme-secondary text-base sm:text-lg max-w-2xl">
            View detailed analytics and export reports
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={fetchReportData} 
            className="border-theme-border hover:bg-theme-bg-secondary px-6 py-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => exportReport('full', 'excel')} 
            className="bg-theme-primary hover:bg-theme-primary-700 text-white px-6 py-3"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export All Excel
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card className="bg-theme-card border-theme-border">
        <CardHeader>
          <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-48">
              <label className={`block text-sm font-medium ${textHierarchy.cardDescription()} mb-2`}>
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => {
                  console.log('📅 Dropdown changed to:', e.target.value)
                  setDateRange(e.target.value)
                }}
                className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg text-theme-text"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <div className="sm:w-48">
              <label className={`block text-sm font-medium ${textHierarchy.cardDescription()} mb-2`}>
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg text-theme-text"
              >
                <option value="overview">Overview</option>
                <option value="users">Users</option>
                <option value="revenue">Revenue</option>
                <option value="copyTrading">Copy Trading</option>
                <option value="academy">Academy</option>
                <option value="affiliates">Affiliates</option>
                <option value="broker">Broker</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {(reportType === 'overview' || reportType === 'users') && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Users</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">{formatNumber(reportData?.users.total || 0)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    +{formatNumber(reportData?.users.new || 0)} new users
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(reportData?.revenue.total || 0)}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  +{reportData?.revenue.growth || 0}% growth
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Copy Trading Success</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">{reportData?.copyTrading.successRate || 0}%</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Copy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {formatNumber(reportData?.copyTrading.activeCopiers || 0)} active copiers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Live Enquiries</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">{formatNumber(reportData?.enquiries.total || 0)}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {formatNumber(reportData?.enquiries.pending || 0)} pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Broker Registrations</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">{formatNumber(reportData?.broker.registrations || 0)}</p>
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Building className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    New registrations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Academy Revenue</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(reportData?.academy.revenue || 0)}</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {formatNumber(reportData?.academy.enrollments || 0)} enrollments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue Chart */}
        {(reportType === 'overview' || reportType === 'revenue') && (
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Revenue Trend</CardTitle>
            <CardDescription className={textHierarchy.subheading()}>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))} 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                    color: isDarkMode ? '#f9fafb' : '#111827',
                    borderRadius: '8px',
                    boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        )}

        {/* User Growth Chart */}
        {(reportType === 'overview' || reportType === 'users') && (
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>User Growth</CardTitle>
              <CardDescription className={textHierarchy.subheading()}>New user registrations by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userChartData}>
                  <defs>
                    <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    formatter={(value) => formatNumber(Number(value))} 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                      color: isDarkMode ? '#f9fafb' : '#111827',
                      borderRadius: '8px',
                      boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="url(#userGrowthGradient)" stroke="#ffffff" strokeWidth={1} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Copy Trading Performance Chart */}
          {(reportType === 'overview' || reportType === 'copyTrading') && (
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Copy Trading Performance</CardTitle>
              <CardDescription className={textHierarchy.subheading()}>Trades and active copiers over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={copyTradingChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                      color: isDarkMode ? '#f9fafb' : '#111827',
                      borderRadius: '8px',
                      boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="trades" stroke="#8b5cf6" strokeWidth={3} name="Trades" />
                  <Line type="monotone" dataKey="copiers" stroke="#10b981" strokeWidth={3} name="Active Copiers" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          )}
        </div>

      {/* Academy & Affiliates Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Academy Performance Chart */}
        {(reportType === 'overview' || reportType === 'academy') && (
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Academy Performance</CardTitle>
            <CardDescription className={textHierarchy.subheading()}>Enrollments and revenue by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={academyChartData}>
                <defs>
                  <linearGradient id="academyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  formatter={(value) => formatNumber(Number(value))} 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                    color: isDarkMode ? '#f9fafb' : '#111827',
                    borderRadius: '8px',
                    boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="enrollments" 
                  stroke="#10b981" 
                  fill="url(#academyGradient)"
                  strokeWidth={3}
                  name="Enrollments"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        )}

        {/* Affiliates Performance Chart */}
        {(reportType === 'overview' || reportType === 'affiliates') && (
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Affiliates Performance</CardTitle>
            <CardDescription className={textHierarchy.subheading()}>Affiliates and commissions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={affiliatesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))} 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                    color: isDarkMode ? '#f9fafb' : '#111827',
                    borderRadius: '8px',
                    boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="affiliates" stroke="#f59e0b" strokeWidth={3} name="Active Affiliates" />
                <Line type="monotone" dataKey="commissions" stroke="#10b981" strokeWidth={3} name="Commissions ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {(reportType === 'overview' || reportType === 'users') && (
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Users Report</CardTitle>
            <CardDescription className={textHierarchy.subheading()}>Detailed user analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Total Users</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.users.total || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>New Users</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.users.new || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Active Users</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.users.active || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Churn Rate</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{reportData?.users.churn || 0}%</span>
              </div>
              <div className="pt-4 border-t border-theme-border-secondary space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('users', 'excel')}
                  disabled={isExporting === 'users-excel'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'users-excel' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('users', 'pdf')}
                  disabled={isExporting === 'users-pdf'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'users-pdf' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Revenue Report */}
        {(reportType === 'overview' || reportType === 'revenue') && (
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Revenue Report</CardTitle>
            <CardDescription className={textHierarchy.subheading()}>Financial performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Total Revenue</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatCurrency(reportData?.revenue.total || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Period Revenue</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatCurrency(reportData?.revenue.monthly || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Growth Rate</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>+{reportData?.revenue.growth || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Academy Revenue</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatCurrency(reportData?.academy.revenue || 0)}</span>
              </div>
              <div className="pt-4 border-t border-theme-border-secondary space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('revenue', 'excel')}
                  disabled={isExporting === 'revenue-excel'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'revenue-excel' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('revenue', 'pdf')}
                  disabled={isExporting === 'revenue-pdf'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'revenue-pdf' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Copy Trading Report */}
        {(reportType === 'overview' || reportType === 'copyTrading') && (
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Copy Trading Report</CardTitle>
            <CardDescription className={textHierarchy.subheading()}>Copy trading performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Total Trades</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.copyTrading.totalTrades || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Active Copiers</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.copyTrading.activeCopiers || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Success Rate</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{reportData?.copyTrading.successRate || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Status</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>Active</span>
              </div>
              <div className="pt-4 border-t border-theme-border-secondary space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('copyTrading', 'excel')}
                  disabled={isExporting === 'copyTrading-excel'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'copyTrading-excel' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('copyTrading', 'pdf')}
                  disabled={isExporting === 'copyTrading-pdf'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'copyTrading-pdf' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Academy Report */}
        {(reportType === 'overview' || reportType === 'academy') && (
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Academy Report</CardTitle>
            <CardDescription className={textHierarchy.subheading()}>Academy performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Total Courses</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.academy.totalCourses || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Enrollments</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.academy.enrollments || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Revenue</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatCurrency(reportData?.academy.revenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Avg per Enrollment</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>
                  {reportData?.academy.enrollments ? formatCurrency((reportData.academy.revenue || 0) / reportData.academy.enrollments) : '$0.00'}
                </span>
              </div>
              <div className="pt-4 border-t border-theme-border-secondary space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('academy', 'excel')}
                  disabled={isExporting === 'academy-excel'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'academy-excel' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('academy', 'pdf')}
                  disabled={isExporting === 'academy-pdf'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'academy-pdf' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Affiliates Report */}
        {(reportType === 'overview' || reportType === 'affiliates') && (
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Affiliates Report</CardTitle>
            <CardDescription className={textHierarchy.subheading()}>Affiliate program metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Total Affiliates</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.affiliates.totalAffiliates || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Paid Commissions</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatCurrency(reportData?.affiliates.commissions || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Total Revenue</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatCurrency(reportData?.affiliates.revenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Avg per Affiliate</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>
                  {reportData?.affiliates.totalAffiliates ? formatCurrency((reportData.affiliates.revenue || 0) / reportData.affiliates.totalAffiliates) : '$0.00'}
                </span>
              </div>
              <div className="pt-4 border-t border-theme-border-secondary space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('affiliates', 'excel')}
                  disabled={isExporting === 'affiliates-excel'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'affiliates-excel' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('affiliates', 'pdf')}
                  disabled={isExporting === 'affiliates-pdf'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'affiliates-pdf' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Enquiries Report */}
        {(reportType === 'overview' || reportType === 'broker') && (
        <Card className="bg-theme-card border-theme-border">
          <CardHeader>
            <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Enquiries Report</CardTitle>
            <CardDescription className={textHierarchy.subheading()}>Customer enquiry tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Total Enquiries</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.enquiries.total || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Pending</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.enquiries.pending || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Resolved</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>{formatNumber(reportData?.enquiries.resolved || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${textHierarchy.cardDescription()}`}>Resolution Rate</span>
                <span className={`text-sm ${textHierarchy.metaText(isDarkMode)}`}>
                  {reportData?.enquiries.total ? Math.round((reportData.enquiries.resolved / reportData.enquiries.total) * 100) : 0}%
                </span>
              </div>
              <div className="pt-4 border-t border-theme-border-secondary space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('enquiries', 'excel')}
                  disabled={isExporting === 'enquiries-excel'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'enquiries-excel' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportReport('enquiries', 'pdf')}
                  disabled={isExporting === 'enquiries-pdf'}
                  className="w-full border-theme-border hover:bg-theme-bg-secondary"
                >
                  {isExporting === 'enquiries-pdf' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Export Options */}
      <Card className="bg-theme-card border-theme-border">
        <CardHeader>
          <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Export Reports</CardTitle>
          <CardDescription className={textHierarchy.subheading()}>Download comprehensive professional Excel reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => exportReport('users', 'excel')}
                disabled={isExporting === 'users-excel'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'users-excel' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Users Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>Excel</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('users', 'pdf')}
                disabled={isExporting === 'users-pdf'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'users-pdf' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Users Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>PDF</span>
              </Button>
            </div>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => exportReport('revenue', 'excel')}
                disabled={isExporting === 'revenue-excel'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'revenue-excel' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Revenue Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>Excel</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('revenue', 'pdf')}
                disabled={isExporting === 'revenue-pdf'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'revenue-pdf' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Revenue Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>PDF</span>
              </Button>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => exportReport('copyTrading', 'excel')}
                disabled={isExporting === 'copyTrading-excel'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'copyTrading-excel' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Copy Trading Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>Excel</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('copyTrading', 'pdf')}
                disabled={isExporting === 'copyTrading-pdf'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'copyTrading-pdf' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Copy Trading Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>PDF</span>
              </Button>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => exportReport('academy', 'excel')}
                disabled={isExporting === 'academy-excel'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'academy-excel' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Academy Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>Excel</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('academy', 'pdf')}
                disabled={isExporting === 'academy-pdf'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'academy-pdf' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Academy Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>PDF</span>
              </Button>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => exportReport('affiliates', 'excel')}
                disabled={isExporting === 'affiliates-excel'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'affiliates-excel' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Affiliates Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>Excel</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('affiliates', 'pdf')}
                disabled={isExporting === 'affiliates-pdf'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'affiliates-pdf' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Affiliates Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>PDF</span>
              </Button>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => exportReport('broker', 'excel')}
                disabled={isExporting === 'broker-excel'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'broker-excel' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Broker Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>Excel</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('broker', 'pdf')}
                disabled={isExporting === 'broker-pdf'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'broker-pdf' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Broker Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>PDF</span>
              </Button>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => exportReport('full', 'excel')}
                disabled={isExporting === 'full-excel'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'full-excel' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Full Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>Excel</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('full', 'pdf')}
                disabled={isExporting === 'full-pdf'}
                className="h-16 w-full flex flex-col items-center justify-center space-y-1 border-theme-border hover:bg-theme-bg-secondary"
              >
                {isExporting === 'full-pdf' ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className={`text-sm ${textHierarchy.cardDescription()}`}>Full Report</span>
                <span className={`text-xs ${textHierarchy.metaText(isDarkMode)}`}>PDF</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </RequirePermission>
  )
}
