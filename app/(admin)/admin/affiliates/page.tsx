'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, Users, TrendingUp, CheckCircle, Clock, XCircle, Phone, Wallet, Download, RefreshCw, UserCheck, Eye, Mail, Calendar, CreditCard, Building, User, Search, Filter, SortAsc, SortDesc, X, ChevronDown, FileSpreadsheet } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Collapsible } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

interface AffiliateProgram {
  id: string
  affiliateCode: string
  fullName: string | null
  phone: string | null
  paymentMethod: string
  payoutDetails: any
  tier: string
  commissionRate: number
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
  totalReferrals: number
  isActive: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface AffiliatePayout {
  id: string
  amount: number
  method: string
  status: string
  transactionId: string | null
  notes: string | null
  paidAt: string | null
  createdAt: string
  affiliateProgram: {
    id: string
    affiliateCode: string
    fullName: string | null
    phone: string | null
    paymentMethod: string
    payoutDetails: any
    user: {
      name: string | null
      email: string
    }
  }
}

interface AffiliateReferral {
  id: string
  status: string
  conversionDate: string | null
  createdAt: string
  affiliateProgram: {
    affiliateCode: string
  }
  referredUser: {
    name: string | null
    email: string
  }
}

export default function AffiliatesAdminPage() {
  const [affiliates, setAffiliates] = useState<AffiliateProgram[]>([])
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateProgram | null>(null)
  const [payoutForm, setPayoutForm] = useState({
    affiliateId: '',
    amount: 0,
    method: 'BANK_TRANSFER',
    notes: ''
  })
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedAffiliateDetails, setSelectedAffiliateDetails] = useState<AffiliateProgram | null>(null)
  const [showPayoutDetailsDialog, setShowPayoutDetailsDialog] = useState(false)
  const [selectedPayoutDetails, setSelectedPayoutDetails] = useState<AffiliatePayout | null>(null)
  const [showReferralDetailsDialog, setShowReferralDetailsDialog] = useState(false)
  const [selectedReferralDetails, setSelectedReferralDetails] = useState<AffiliateReferral | null>(null)
  const [affiliateCommissions, setAffiliateCommissions] = useState<any[]>([])
  const [commissionFilter, setCommissionFilter] = useState('all')
  const [commissionStatusFilter, setCommissionStatusFilter] = useState('all')

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [referralStatusFilter, setReferralStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'earnings' | 'referrals' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchAffiliates()
    fetchPayouts()
    fetchReferrals()
  }, [])

  const fetchAffiliates = async () => {
    try {
      const response = await fetch('/api/admin/affiliates')
      if (response.ok) {
        const data = await response.json()
        setAffiliates(data.affiliates || [])
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error)
      toast.error('Failed to load affiliates')
    } finally {
      setLoading(false)
    }
  }

  const fetchPayouts = async () => {
    try {
      const response = await fetch('/api/admin/affiliates/payouts')
      if (response.ok) {
        const data = await response.json()
        setPayouts(data.payouts || [])
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
    }
  }

  const fetchReferrals = async () => {
    try {
      const response = await fetch('/api/admin/affiliates/referrals')
      if (response.ok) {
        const data = await response.json()
        setReferrals(data.referrals || [])
      }
    } catch (error) {
      console.error('Error fetching referrals:', error)
    }
  }

  const fetchAffiliateCommissions = async (affiliateId: string) => {
    try {
      console.log('[Frontend] Fetching commissions for affiliate:', affiliateId)
      const response = await fetch(`/api/admin/affiliates/${affiliateId}/commissions`)
      console.log('[Frontend] Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[Frontend] Received commissions:', data.commissions?.length || 0)
        setAffiliateCommissions(data.commissions || [])
      } else {
        console.error('[Frontend] Failed to fetch commissions:', response.statusText)
        setAffiliateCommissions([])
      }
    } catch (error) {
      console.error('[Frontend] Error fetching commissions:', error)
      setAffiliateCommissions([])
    }
  }

  const updateAffiliateTier = async (id: string, tier: string, commissionRate: number) => {
    try {
      const response = await fetch(`/api/admin/affiliates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, commissionRate })
      })

      if (response.ok) {
        toast.success('Affiliate tier updated successfully')
        fetchAffiliates()
      } else {
        throw new Error('Failed to update tier')
      }
    } catch (error) {
      toast.error('Failed to update tier')
    }
  }

  const toggleAffiliateStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/affiliates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        toast.success(`Affiliate ${isActive ? 'activated' : 'deactivated'} successfully`)
        fetchAffiliates()
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleCreatePayout = (affiliate: AffiliateProgram) => {
    setPayoutForm({
      affiliateId: affiliate.id,
      amount: affiliate.pendingEarnings,
      method: 'BANK_TRANSFER',
      notes: ''
    })
    setShowPayoutDialog(true)
  }

  const submitPayout = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin/affiliates/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payoutForm)
      })

      if (response.ok) {
        toast.success('Payout created successfully')
        setShowPayoutDialog(false)
        fetchAffiliates()
        fetchPayouts()
      } else {
        throw new Error('Failed to create payout')
      }
    } catch (error) {
      toast.error('Failed to create payout')
    }
  }

  const updatePayoutStatus = async (id: string, status: string, transactionId?: string) => {
    try {
      console.log('Updating payout status:', { id, status, transactionId })
      
      const response = await fetch(`/api/admin/affiliates/payouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          transactionId,
          paidAt: status === 'COMPLETED' ? new Date().toISOString() : undefined
        })
      })

      const data = await response.json()
      console.log('Payout update response:', data)

      if (response.ok) {
        toast.success('Payout status updated successfully')
        fetchPayouts()
        fetchAffiliates()
      } else {
        const errorMessage = data.error || data.details || 'Failed to update payout'
        console.error('Payout update failed:', errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error updating payout:', error)
      toast.error('Failed to update payout. Please check the console for details.')
    }
  }

  // Filter and Sort Functions
  const filterByDate = (dateString: string) => {
    if (dateFilter === 'all') return true
    
    const itemDate = new Date(dateString)
    const now = new Date()
    
    switch (dateFilter) {
      case 'today':
        return itemDate.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return itemDate >= weekAgo
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return itemDate >= monthAgo
      case 'custom':
        if (!startDate || !endDate) return true
        const start = new Date(startDate)
        const end = new Date(endDate)
        return itemDate >= start && itemDate <= end
      default:
        return true
    }
  }

  const filteredAffiliates = affiliates
    .filter(affiliate => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        affiliate.user.name?.toLowerCase().includes(searchLower) ||
        affiliate.user.email.toLowerCase().includes(searchLower) ||
        affiliate.affiliateCode.toLowerCase().includes(searchLower) ||
        affiliate.fullName?.toLowerCase().includes(searchLower)
      
      // Tier filter
      const matchesTier = tierFilter === 'all' || affiliate.tier === tierFilter
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && affiliate.isActive) ||
        (statusFilter === 'inactive' && !affiliate.isActive)
      
      // Date filter
      const matchesDate = filterByDate(affiliate.createdAt)
      
      return matchesSearch && matchesTier && matchesStatus && matchesDate
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = (a.user.name || a.user.email).localeCompare(b.user.name || b.user.email)
          break
        case 'earnings':
          comparison = a.totalEarnings - b.totalEarnings
          break
        case 'referrals':
          comparison = a.totalReferrals - b.totalReferrals
          break
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const filteredPayouts = payouts
    .filter(payout => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        payout.affiliateProgram.user.name?.toLowerCase().includes(searchLower) ||
        payout.affiliateProgram.user.email.toLowerCase().includes(searchLower) ||
        payout.affiliateProgram.affiliateCode.toLowerCase().includes(searchLower) ||
        payout.transactionId?.toLowerCase().includes(searchLower)
      
      // Status filter
      const matchesStatus = payoutStatusFilter === 'all' || payout.status === payoutStatusFilter
      
      // Payment method filter
      const matchesMethod = paymentMethodFilter === 'all' || payout.method === paymentMethodFilter
      
      // Date filter
      const matchesDate = filterByDate(payout.createdAt)
      
      return matchesSearch && matchesStatus && matchesMethod && matchesDate
    })

  const filteredReferrals = referrals
    .filter(referral => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        referral.referredUser.name?.toLowerCase().includes(searchLower) ||
        referral.referredUser.email.toLowerCase().includes(searchLower) ||
        referral.affiliateProgram.affiliateCode.toLowerCase().includes(searchLower)
      
      // Status filter
      const matchesStatus = referralStatusFilter === 'all' || referral.status === referralStatusFilter
      
      // Date filter
      const matchesDate = filterByDate(referral.createdAt)
      
      return matchesSearch && matchesStatus && matchesDate
    })

  const clearFilters = () => {
    setSearchTerm('')
    setTierFilter('all')
    setStatusFilter('all')
    setPayoutStatusFilter('all')
    setPaymentMethodFilter('all')
    setReferralStatusFilter('all')
    setDateFilter('all')
    setStartDate('')
    setEndDate('')
    setSortBy('date')
    setSortOrder('desc')
  }

  const exportData = async (exportType: 'affiliates' | 'payouts' | 'referrals' | 'all') => {
    setIsExporting(true)
    try {
      console.log('📊 Exporting:', exportType)
      
      const filters = {
        searchTerm,
        tierFilter,
        statusFilter,
        payoutStatusFilter,
        paymentMethodFilter,
        referralStatusFilter,
        dateFilter,
        startDate,
        endDate
      }

      const response = await fetch('/api/admin/affiliates/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exportType, filters })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success(`${exportType.charAt(0).toUpperCase() + exportType.slice(1)} exported successfully`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'BRONZE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'SILVER': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'GOLD': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'PLATINUM': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const totalPendingPayouts = affiliates.reduce((sum, a) => sum + a.pendingEarnings, 0)
  const totalPaidOut = affiliates.reduce((sum, a) => sum + a.paidEarnings, 0)
  const totalReferrals = affiliates.reduce((sum, a) => sum + a.totalReferrals, 0)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Affiliate Management</h1>
          <p className="text-muted-foreground">Manage affiliate programs, commissions, and payouts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchAffiliates}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export Excel'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => exportData('affiliates')}>
                <Users className="mr-2 h-4 w-4" />
                Export Affiliates ({filteredAffiliates.length})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('payouts')}>
                <DollarSign className="mr-2 h-4 w-4" />
                Export Payouts ({filteredPayouts.length})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('referrals')}>
                <UserCheck className="mr-2 h-4 w-4" />
                Export Referrals ({filteredReferrals.length})
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportData('all')}>
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliates.length}</div>
            <p className="text-xs text-muted-foreground">{affiliates.filter(a => a.isActive).length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPendingPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaidOut.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Collapsible
        title="Search & Filters"
        description="Find and filter affiliates, payouts, and referrals"
        icon={<Filter className="h-5 w-5" />}
        defaultOpen={false}
      >
        <div className="space-y-4 pt-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, affiliate code, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tier Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tier</Label>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Affiliate Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Affiliate Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payout Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Payout Status</Label>
              <Select value={payoutStatusFilter} onValueChange={setPayoutStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Payment Method</Label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="CRYPTO">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Referral Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Referral Status</Label>
              <Select value={referralStatusFilter} onValueChange={setReferralStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONVERTED">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Date Range</Label>
              <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="earnings">Earnings</SelectItem>
                  <SelectItem value="referrals">Referrals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Sort Order</Label>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? (
                  <>
                    <SortAsc className="mr-2 h-4 w-4" />
                    Ascending
                  </>
                ) : (
                  <>
                    <SortDesc className="mr-2 h-4 w-4" />
                    Descending
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Results Count and Clear Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Showing {filteredAffiliates.length} of {affiliates.length} affiliates</span>
              <span>•</span>
              <span>{filteredPayouts.length} of {payouts.length} payouts</span>
              <span>•</span>
              <span>{filteredReferrals.length} of {referrals.length} referrals</span>
            </div>
            {(searchTerm || tierFilter !== 'all' || statusFilter !== 'all' || payoutStatusFilter !== 'all' || 
              paymentMethodFilter !== 'all' || referralStatusFilter !== 'all' || dateFilter !== 'all') && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      </Collapsible>

      {/* Tabs */}
      <Tabs defaultValue="affiliates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="affiliates">
            <Users className="mr-2 h-4 w-4" />
            Affiliates ({filteredAffiliates.length})
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <DollarSign className="mr-2 h-4 w-4" />
            Payouts ({filteredPayouts.length})
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <UserCheck className="mr-2 h-4 w-4" />
            Referrals ({filteredReferrals.length})
          </TabsTrigger>
        </TabsList>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          {/* Desktop View - Table */}
          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Payouts</CardTitle>
                <CardDescription>Manage commission payouts to affiliates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Affiliate</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{payout.affiliateProgram.fullName || payout.affiliateProgram.user.name || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{payout.affiliateProgram.user.email}</p>
                              <code className="text-xs bg-muted px-2 py-0.5 rounded">{payout.affiliateProgram.affiliateCode}</code>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">${payout.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{payout.method.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              payout.status === 'COMPLETED' ? 'secondary' :
                              payout.status === 'PENDING' ? 'destructive' : 'destructive'
                            }>
                              {payout.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedPayoutDetails(payout)
                                  setShowPayoutDetailsDialog(true)
                                }}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                Details
                              </Button>
                              {payout.status === 'PENDING' && (
                                <>
                                  <Button className="bg-theme-primary hover:bg-theme-primary-700 text-white"
                                    size="sm" 
                                    onClick={() => {
                                      const txId = prompt('Enter transaction ID:')
                                      if (txId) updatePayoutStatus(payout.id, 'COMPLETED', txId)
                                    }}
                                  >
                                    Mark Paid
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => updatePayoutStatus(payout.id, 'FAILED')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
            {filteredPayouts.map((payout) => (
              <Card key={payout.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{payout.affiliateProgram.fullName || payout.affiliateProgram.user.name || 'N/A'}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{payout.affiliateProgram.user.email}</p>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded inline-block">{payout.affiliateProgram.affiliateCode}</code>
                    </div>
                    <Badge variant={
                      payout.status === 'COMPLETED' ? 'secondary' :
                      payout.status === 'PENDING' ? 'destructive' : 'destructive'
                    } className="shrink-0">
                      {payout.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-lg font-bold">${payout.amount.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Method</p>
                      <Badge variant="outline">{payout.method.replace('_', ' ')}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{new Date(payout.createdAt).toLocaleDateString()}</p>
                    </div>
                    {payout.transactionId && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Transaction ID</p>
                        <code className="text-xs bg-muted px-2 py-0.5 rounded inline-block">{payout.transactionId}</code>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPayoutDetails(payout)
                        setShowPayoutDetailsDialog(true)
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View Details
                    </Button>
                    {payout.status === 'PENDING' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          const txId = prompt('Enter transaction ID:')
                          if (txId) updatePayoutStatus(payout.id, 'COMPLETED', txId)
                        }}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-4">
          {/* Desktop View - Table */}
          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Referrals</CardTitle>
                <CardDescription>Track all referrals from affiliates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Affiliate Code</TableHead>
                        <TableHead>Referred User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Conversion Date</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-mono">{referral.affiliateProgram.affiliateCode}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{referral.referredUser.name || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{referral.referredUser.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              referral.status === 'CONVERTED' ? 'secondary' :
                              referral.status === 'PENDING' ? 'destructive' : 'outline'
                            }>
                              {referral.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {referral.conversionDate ? new Date(referral.conversionDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{new Date(referral.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedReferralDetails(referral)
                                  setShowReferralDetailsDialog(true)
                                }}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
            {filteredReferrals.map((referral) => (
              <Card key={referral.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{referral.referredUser.name || 'N/A'}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{referral.referredUser.email}</p>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded inline-block">{referral.affiliateProgram.affiliateCode}</code>
                    </div>
                    <Badge variant={
                      referral.status === 'CONVERTED' ? 'default' :
                      referral.status === 'PENDING' ? 'secondary' : 'outline'
                    } className="shrink-0">
                      {referral.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Registered</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm font-medium">{new Date(referral.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Conversion Date</p>
                      <p className="text-sm font-medium">
                        {referral.conversionDate ? new Date(referral.conversionDate).toLocaleDateString() : 'Not converted'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedReferralDetails(referral)
                        setShowReferralDetailsDialog(true)
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Affiliates Tab */}
        <TabsContent value="affiliates" className="space-y-4">
          {/* Desktop View - Table */}
          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Programs</CardTitle>
                <CardDescription>Manage affiliate accounts and commissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Affiliate</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Referrals</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAffiliates.map((affiliate) => (
                        <TableRow key={affiliate.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{affiliate.fullName || affiliate.user.name || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{affiliate.user.email}</p>
                              <code className="text-xs bg-muted px-2 py-0.5 rounded">{affiliate.affiliateCode}</code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTierColor(affiliate.tier)}>
                              {affiliate.tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{affiliate.commissionRate}%</TableCell>
                          <TableCell className="font-medium">{affiliate.totalReferrals}</TableCell>
                          <TableCell className="font-semibold text-yellow-600">${affiliate.pendingEarnings.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold text-green-600">${affiliate.paidEarnings.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={affiliate.isActive ? 'secondary' : 'destructive'}>
                              {affiliate.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAffiliateDetails(affiliate)
                                  fetchAffiliateCommissions(affiliate.id)
                                  setCommissionFilter('all')
                                  setCommissionStatusFilter('all')
                                  setShowDetailsDialog(true)
                                }}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                Details
                              </Button>
                              {affiliate.pendingEarnings > 0 && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleCreatePayout(affiliate)}
                                  className="bg-theme-primary hover:bg-theme-primary-700 text-white"
                                >
                                  Pay Out
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
            {filteredAffiliates.map((affiliate) => (
              <Card key={affiliate.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{affiliate.fullName || affiliate.user.name || 'N/A'}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{affiliate.user.email}</p>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded inline-block">{affiliate.affiliateCode}</code>
                    </div>
                    <Badge variant={affiliate.isActive ? 'default' : 'secondary'} className="shrink-0">
                      {affiliate.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tier</p>
                      <Badge className={getTierColor(affiliate.tier)}>
                        {affiliate.tier}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Commission</p>
                      <p className="text-sm font-semibold">{affiliate.commissionRate}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Referrals</p>
                      <p className="text-sm font-semibold">{affiliate.totalReferrals}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Total Earnings</p>
                      <p className="text-sm font-semibold">${affiliate.totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-yellow-600">Pending</p>
                      <p className="text-sm font-semibold text-yellow-600">${affiliate.pendingEarnings.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-green-600">Paid Out</p>
                      <p className="text-sm font-semibold text-green-600">${affiliate.paidEarnings.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedAffiliateDetails(affiliate)
                        fetchAffiliateCommissions(affiliate.id)
                        setCommissionFilter('all')
                        setCommissionStatusFilter('all')
                        setShowDetailsDialog(true)
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View Details
                    </Button>
                    {affiliate.pendingEarnings > 0 && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleCreatePayout(affiliate)}
                      >
                        <DollarSign className="mr-1 h-4 w-4" />
                        Pay Out
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </TabsContent>
      </Tabs>

      {/* Affiliate Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Affiliate Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this affiliate partner
            </DialogDescription>
          </DialogHeader>
          
          {selectedAffiliateDetails && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedAffiliateDetails.fullName || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-sm">{selectedAffiliateDetails.user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedAffiliateDetails.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Affiliate Code</p>
                    <code className="text-sm bg-background px-2 py-1 rounded border font-mono">
                      {selectedAffiliateDetails.affiliateCode}
                    </code>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Member Since</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{new Date(selectedAffiliateDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Account Status</p>
                    <Badge variant={selectedAffiliateDetails.isActive ? 'secondary' : 'destructive'} className="w-fit">
                      {selectedAffiliateDetails.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Tier & Commission */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tier & Commission</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Current Tier</p>
                    <Badge className={getTierColor(selectedAffiliateDetails.tier)}>
                      {selectedAffiliateDetails.tier}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Commission Rate</p>
                    <p className="text-2xl font-bold">{selectedAffiliateDetails.commissionRate}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{selectedAffiliateDetails.totalReferrals}</p>
                  </div>
                </div>
              </div>

              {/* Earnings Summary */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Earnings Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Total Earnings</p>
                        <p className="text-2xl font-bold">${selectedAffiliateDetails.totalEarnings.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-xs text-yellow-600">Pending Earnings</p>
                        <p className="text-2xl font-bold text-yellow-600">${selectedAffiliateDetails.pendingEarnings.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-xs text-green-600">Paid Out</p>
                        <p className="text-2xl font-bold text-green-600">${selectedAffiliateDetails.paidEarnings.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Payment Details</h3>
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedAffiliateDetails.paymentMethod?.replace('_', ' ') || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  {selectedAffiliateDetails.payoutDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                      {selectedAffiliateDetails.payoutDetails.accountName && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Account Name</p>
                          <p className="font-medium">{selectedAffiliateDetails.payoutDetails.accountName}</p>
                        </div>
                      )}
                      {selectedAffiliateDetails.payoutDetails.accountNumber && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Account Number</p>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <code className="font-mono text-sm">{selectedAffiliateDetails.payoutDetails.accountNumber}</code>
                          </div>
                        </div>
                      )}
                      {selectedAffiliateDetails.payoutDetails.bankName && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Bank Name</p>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{selectedAffiliateDetails.payoutDetails.bankName}</p>
                          </div>
                        </div>
                      )}
                      {selectedAffiliateDetails.payoutDetails.provider && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Provider</p>
                          <p className="font-medium">{selectedAffiliateDetails.payoutDetails.provider}</p>
                        </div>
                      )}
                      {selectedAffiliateDetails.payoutDetails.walletAddress && (
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-xs text-muted-foreground">Wallet Address</p>
                          <code className="text-xs bg-background px-2 py-1 rounded border font-mono break-all">
                            {selectedAffiliateDetails.payoutDetails.walletAddress}
                          </code>
                        </div>
                      )}
                      {selectedAffiliateDetails.payoutDetails.email && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">PayPal Email</p>
                          <p className="font-medium">{selectedAffiliateDetails.payoutDetails.email}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!selectedAffiliateDetails.payoutDetails && (
                    <p className="text-sm text-muted-foreground italic">No payment details provided</p>
                  )}
                </div>
              </div>

              {/* Commission Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Commission Breakdown ({affiliateCommissions.length} total)
                </h3>
                
                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <Select value={commissionFilter} onValueChange={setCommissionFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ACADEMY">Academy</SelectItem>
                      <SelectItem value="COPY_TRADING">Copy Trading</SelectItem>
                      <SelectItem value="BROKER_ACCOUNT">Broker Account</SelectItem>
                      <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={commissionStatusFilter} onValueChange={setCommissionStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Commission Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affiliateCommissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No commissions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        affiliateCommissions
                          .filter(comm => commissionFilter === 'all' || comm.type === commissionFilter)
                          .filter(comm => commissionStatusFilter === 'all' || comm.status === commissionStatusFilter)
                          .map((commission) => (
                            <TableRow key={commission.id}>
                              <TableCell className="text-sm">
                                {new Date(commission.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {commission.type.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm max-w-[200px] truncate">
                                {commission.description || '-'}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                ${commission.amount.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    commission.status === 'APPROVED' ? 'secondary' :
                                    commission.status === 'PENDING' ? 'destructive' : 'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {commission.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary */}
                {affiliateCommissions.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Commissions</p>
                      <p className="font-bold">{affiliateCommissions.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Approved Amount</p>
                      <p className="font-bold text-green-600">
                        ${affiliateCommissions
                          .filter(c => c.status === 'APPROVED')
                          .reduce((sum, c) => sum + c.amount, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pending Amount</p>
                      <p className="font-bold text-yellow-600">
                        ${affiliateCommissions
                          .filter(c => c.status === 'PENDING')
                          .reduce((sum, c) => sum + c.amount, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedAffiliateDetails && (
              <>
                <Select
                  value={selectedAffiliateDetails.tier}
                  onValueChange={(tier) => {
                    const rates = { BRONZE: 10, SILVER: 12, GOLD: 15, PLATINUM: 20 }
                    updateAffiliateTier(selectedAffiliateDetails.id, tier, rates[tier as keyof typeof rates])
                    setShowDetailsDialog(false)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Change Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRONZE">Bronze (10%)</SelectItem>
                    <SelectItem value="SILVER">Silver (12%)</SelectItem>
                    <SelectItem value="GOLD">Gold (15%)</SelectItem>
                    <SelectItem value="PLATINUM">Platinum (20%)</SelectItem>
                  </SelectContent>
                </Select>
                
                {selectedAffiliateDetails.pendingEarnings > 0 && (
                  <Button className="bg-theme-primary hover:bg-theme-primary-700 text-white"
                    onClick={() => {
                      handleCreatePayout(selectedAffiliateDetails)
                      setShowDetailsDialog(false)
                    }}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Pay Out ${selectedAffiliateDetails.pendingEarnings.toFixed(2)}
                  </Button>
                )}
                
                <Button 
                  variant={selectedAffiliateDetails.isActive ? 'destructive' : 'default'}
                  onClick={() => {
                    toggleAffiliateStatus(selectedAffiliateDetails.id, !selectedAffiliateDetails.isActive)
                    setShowDetailsDialog(false)
                  }}
                >
                  {selectedAffiliateDetails.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Details Dialog */}
      <Dialog open={showPayoutDetailsDialog} onOpenChange={setShowPayoutDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payout Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this payout transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayoutDetails && (
            <div className="space-y-6">
              {/* Affiliate Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Affiliate Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedPayoutDetails.affiliateProgram.fullName || selectedPayoutDetails.affiliateProgram.user.name || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-sm">{selectedPayoutDetails.affiliateProgram.user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedPayoutDetails.affiliateProgram.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Affiliate Code</p>
                    <code className="text-sm bg-background px-2 py-1 rounded border font-mono">
                      {selectedPayoutDetails.affiliateProgram.affiliateCode}
                    </code>
                  </div>
                </div>
              </div>

              {/* Payout Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Payout Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="text-3xl font-bold">${selectedPayoutDetails.amount.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge variant={
                          selectedPayoutDetails.status === 'COMPLETED' ? 'secondary' :
                          selectedPayoutDetails.status === 'PENDING' ? 'destructive' : 'destructive'
                        } className="text-base px-3 py-1">
                          {selectedPayoutDetails.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedPayoutDetails.method.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Created Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{new Date(selectedPayoutDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  {selectedPayoutDetails.paidAt && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Paid Date</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="font-medium">{new Date(selectedPayoutDetails.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                  {selectedPayoutDetails.transactionId && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Transaction ID</p>
                      <code className="text-sm bg-background px-2 py-1 rounded border font-mono">
                        {selectedPayoutDetails.transactionId}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Payment Details</h3>
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedPayoutDetails.affiliateProgram.paymentMethod?.replace('_', ' ') || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  {selectedPayoutDetails.affiliateProgram.payoutDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                      {selectedPayoutDetails.affiliateProgram.payoutDetails.accountName && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Account Name</p>
                          <p className="font-medium">{selectedPayoutDetails.affiliateProgram.payoutDetails.accountName}</p>
                        </div>
                      )}
                      {selectedPayoutDetails.affiliateProgram.payoutDetails.accountNumber && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Account Number</p>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <code className="font-mono text-sm">{selectedPayoutDetails.affiliateProgram.payoutDetails.accountNumber}</code>
                          </div>
                        </div>
                      )}
                      {selectedPayoutDetails.affiliateProgram.payoutDetails.bankName && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Bank Name</p>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{selectedPayoutDetails.affiliateProgram.payoutDetails.bankName}</p>
                          </div>
                        </div>
                      )}
                      {selectedPayoutDetails.affiliateProgram.payoutDetails.provider && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Provider</p>
                          <p className="font-medium">{selectedPayoutDetails.affiliateProgram.payoutDetails.provider}</p>
                        </div>
                      )}
                      {selectedPayoutDetails.affiliateProgram.payoutDetails.walletAddress && (
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-xs text-muted-foreground">Wallet Address</p>
                          <code className="text-xs bg-background px-2 py-1 rounded border font-mono break-all">
                            {selectedPayoutDetails.affiliateProgram.payoutDetails.walletAddress}
                          </code>
                        </div>
                      )}
                      {selectedPayoutDetails.affiliateProgram.payoutDetails.email && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">PayPal Email</p>
                          <p className="font-medium">{selectedPayoutDetails.affiliateProgram.payoutDetails.email}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!selectedPayoutDetails.affiliateProgram.payoutDetails && (
                    <p className="text-sm text-muted-foreground italic">No payment details provided</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedPayoutDetails.notes && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes</h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">{selectedPayoutDetails.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedPayoutDetails && selectedPayoutDetails.status === 'PENDING' && (
              <>
                <Button className="bg-theme-primary hover:bg-theme-primary-700 text-white"
                  onClick={() => {
                    const txId = prompt('Enter transaction ID:')
                    if (txId) {
                      updatePayoutStatus(selectedPayoutDetails.id, 'COMPLETED', txId)
                      setShowPayoutDetailsDialog(false)
                    }
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    updatePayoutStatus(selectedPayoutDetails.id, 'FAILED')
                    setShowPayoutDetailsDialog(false)
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Payout
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Details Dialog */}
      <Dialog open={showReferralDetailsDialog} onOpenChange={setShowReferralDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Referral Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this referral
            </DialogDescription>
          </DialogHeader>
          
          {selectedReferralDetails && (
            <div className="space-y-6">
              {/* Referred User Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Referred User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedReferralDetails.referredUser.name || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-sm">{selectedReferralDetails.referredUser.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Referral Status</p>
                    <Badge variant={
                      selectedReferralDetails.status === 'CONVERTED' ? 'secondary' :
                      selectedReferralDetails.status === 'PENDING' ? 'destructive' : 'outline'
                    } className="w-fit">
                      {selectedReferralDetails.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Affiliate Code Used</p>
                    <code className="text-sm bg-background px-2 py-1 rounded border font-mono">
                      {selectedReferralDetails.affiliateProgram.affiliateCode}
                    </code>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Registration Date</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <p className="text-lg font-semibold">{new Date(selectedReferralDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Conversion Date</p>
                        {selectedReferralDetails.conversionDate ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-lg font-semibold">{new Date(selectedReferralDetails.conversionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <p className="text-lg font-semibold text-muted-foreground">Not converted yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Status Explanation */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Status Information</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  {selectedReferralDetails.status === 'CONVERTED' ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-600">Converted</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          This referral has been converted and commission has been awarded to the affiliate.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-600">Pending</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          This referral is pending. Commission will be awarded once the referred user completes a qualifying action (e.g., makes a deposit, purchases a course).
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReferralDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payout</DialogTitle>
            <DialogDescription>Process a commission payout to affiliate</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitPayout} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm({ ...payoutForm, amount: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <Select value={payoutForm.method} onValueChange={(value) => setPayoutForm({ ...payoutForm, method: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={payoutForm.notes}
                onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPayoutDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-theme-primary hover:bg-theme-primary-700 text-white">Create Payout</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
