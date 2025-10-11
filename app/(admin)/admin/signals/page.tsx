'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Edit, Eye, Heart, MessageCircle, Plus, Search, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import CreateSignalModal from '@/components/admin/create-signal-modal'
import EditSignalModal from '@/components/admin/edit-signal-modal'
import SignalCommentsModal from '@/components/admin/signal-comments-modal'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

interface Signal {
  id: string
  title: string
  description: string
  symbol: string
  action: 'BUY' | 'SELL'
  entryPrice: number | null
  stopLoss: number | null
  takeProfit: number | null
  notes: string
  visibility: string
  status: string
  isActive: boolean
  likes: number
  comments: number
  createdAt: string
  imageUrl?: string
}

export default function AdminSignalsPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [signals, setSignals] = useState<Signal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null)
  const [deletingSignalId, setDeletingSignalId] = useState<string | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)

  const fetchSignals = async () => {
    try {
      const response = await fetch(`/api/admin/signals?limit=50&t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setSignals(data.signals || [])
      }
    } catch (error) {
      console.error('Failed to fetch signals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSignals()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSignals()
    setIsRefreshing(false)
  }

  const handleCreateSuccess = () => {
    fetchSignals() // Refresh the signals list
  }

  const handleEditSignal = (signal: Signal) => {
    setEditingSignal(signal)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    fetchSignals() // Refresh the signals list
    setEditingSignal(null)
  }

  const handleDeleteSignal = async (signalId: string) => {
    if (!confirm('Are you sure you want to delete this signal? This action cannot be undone.')) {
      return
    }

    setDeletingSignalId(signalId)
    try {
      const response = await fetch(`/api/admin/signals/${signalId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSignals() // Refresh the signals list
        alert('Signal deleted successfully!')
      } else {
        const error = await response.json()
        console.error('Error deleting signal:', error)
        alert('Failed to delete signal. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting signal:', error)
      alert('Failed to delete signal. Please try again.')
    } finally {
      setDeletingSignalId(null)
    }
  }

  const handleViewComments = (signal: Signal) => {
    console.log('Admin clicking view comments for signal:', signal.title, signal.id)
    setSelectedSignal(signal)
    setIsCommentsModalOpen(true)
  }

  const filteredSignals = signals.filter(signal => {
    const matchesSearch = signal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && signal.isActive) ||
                         (statusFilter === 'inactive' && !signal.isActive)
    
    return matchesSearch && matchesStatus
  })

  const totalSignals = signals.length
  const activeSignals = signals.filter(s => s.isActive).length
  const buySignals = signals.filter(s => s.action === 'BUY').length
  const sellSignals = signals.filter(s => s.action === 'SELL').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className={textHierarchy.metaText(isDarkMode)}>Loading signals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme tracking-tight truncate">
            Signals Management
          </h1>
          <p className="text-theme-secondary text-sm sm:text-base lg:text-lg max-w-2xl">
            Manage and monitor all trading signals
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 flex-shrink-0">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            variant="theme-primary"
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">+ Create Signal</span>
            <span className="xs:hidden">Create</span>
          </Button>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing} 
            variant="outline" 
            className="border-theme-border hover:bg-theme-bg-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
          >
            {isRefreshing ? (
              <div className="w-4 h-4 border-2 border-theme-border border-t-theme-primary rounded-full animate-spin mr-1 sm:mr-2" />
            ) : (
              <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
            )}
            <span className="hidden xs:inline">Q Refresh</span>
            <span className="xs:hidden">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Signals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSignals}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Signals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeSignals}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Buy Signals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{buySignals}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sell Signals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sellSignals}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Q Search signals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm sm:text-base"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full xs:w-auto"
            >
              <option value="all">All Signals</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Signals List */}
      <div className="grid gap-3 sm:gap-4">
        {filteredSignals.map((signal) => (
          <Card key={signal.id} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              {/* Header with title, badges, and actions */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{signal.title}</h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge className={signal.action === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-1' : 'bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1'}>
                        {signal.action}
                      </Badge>
                      {signal.isActive ? (
                        <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs px-2 py-1">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{signal.description}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0 self-start">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log('Comments button clicked for signal:', signal.title)
                      handleViewComments(signal)
                    }}
                    className="h-8 w-8 p-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    title="View Comments"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditSignal(signal)}
                    className="h-8 w-8 p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    title="Edit Signal"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteSignal(signal.id)}
                    disabled={deletingSignalId === signal.id}
                    className="h-8 w-8 p-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400"
                    title="Delete Signal"
                  >
                    {deletingSignalId === signal.id ? (
                      <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Signal details in a more compact layout */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">Symbol</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{signal.symbol}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">Entry Price</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{signal.entryPrice || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">Stop Loss</p>
                  <p className="font-semibold text-red-600 dark:text-red-400 text-sm truncate">{signal.stopLoss || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">Take Profit</p>
                  <p className="font-semibold text-green-600 dark:text-green-400 text-sm truncate">{signal.takeProfit || 'N/A'}</p>
                </div>
              </div>
              
              {/* Engagement stats and date in a single compact row */}
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{signal.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{signal.comments || 0}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {new Date(signal.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSignals.length === 0 && (
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="py-8">
            <p className={`text-center ${textHierarchy.metaText(isDarkMode)}`}>No signals found</p>
          </CardContent>
        </Card>
      )}

      {/* Create Signal Modal */}
      <CreateSignalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Signal Modal */}
      <EditSignalModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingSignal(null)
        }}
        onSuccess={handleEditSuccess}
        signal={editingSignal}
      />

      {/* Signal Comments Modal */}
      <SignalCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => {
          setIsCommentsModalOpen(false)
          setSelectedSignal(null)
        }}
        signal={selectedSignal}
      />
    </div>
  )
}