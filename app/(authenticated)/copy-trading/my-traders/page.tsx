'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Pause, Play, X, BarChart3 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Trader {
  id: string
  name: string
  username: string
  slug: string
  avatarUrl: string | null
  profitPercentage: number
  profitShareRate: number
  riskLevel: string
  broker: string | null
  roi: number
  winRate: number
  maxDrawdown: number
}

interface Trade {
  id: string
  symbol: string
  action: string
  entryPrice: number
  exitPrice: number | null
  lotSize: number
  profitLoss: number
  status: string
  openedAt: string
  closedAt: string | null
}

interface ProfitShare {
  id: string
  amount: number
  percentage: number
  tradeProfit: number
  status: string
  createdAt: string
  paidAt: string | null
}

interface Subscription {
  id: string
  investmentUSD: number
  copyRatio: number
  stopLossPercent: number
  currentProfit: number
  totalProfit: number
  totalLoss: number
  tradesCount: number
  winningTrades: number
  losingTrades: number
  brokerAccountId: string | null
  status: string
  startDate: string
  pausedAt: string | null
  trader: Trader
  trades: Trade[]
  profitShares: ProfitShare[]
}

interface Stats {
  totalInvestment: number
  totalProfit: number
  totalTrades: number
  activeSubscriptions: number
  profitPercentage: number
}

export default function MyTradersPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/copy-trading/my-subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to load your traders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/copy-trading/my-subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success(`Subscription ${newStatus.toLowerCase()} successfully`)
        fetchSubscriptions()
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update subscription')
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'LOW': return 'text-green-600 bg-green-100 dark:bg-green-900'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900'
      case 'HIGH': return 'text-red-600 bg-red-100 dark:bg-red-900'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your traders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Traders</h1>
        <p className="text-muted-foreground">
          Monitor and manage your copy trading subscriptions
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalInvestment.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.profitPercentage >= 0 ? '+' : ''}{stats.profitPercentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrades}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscriptions List */}
      {subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={sub.trader.avatarUrl || undefined} alt={sub.trader.name} />
                      <AvatarFallback className="text-lg font-bold">
                        {sub.trader.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{sub.trader.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRiskColor(sub.trader.riskLevel)}>
                          {sub.trader.riskLevel} Risk
                        </Badge>
                        <Badge className={getStatusColor(sub.status)}>
                          {sub.status}
                        </Badge>
                        {sub.trader.broker && (
                          <Badge variant="outline">{sub.trader.broker}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSubscription(sub)
                        setShowDetails(true)
                      }}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    {sub.status === 'ACTIVE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(sub.id, 'PAUSED')}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    {sub.status === 'PAUSED' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(sub.id, 'ACTIVE')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    {sub.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(sub.id, 'CANCELLED')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Investment</p>
                    <p className="text-lg font-bold">${sub.investmentUSD.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current P/L</p>
                    <p className={`text-lg font-bold ${sub.currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {sub.currentProfit >= 0 ? '+' : ''}${sub.currentProfit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Copy Ratio</p>
                    <p className="text-lg font-bold">{sub.copyRatio}x</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Trades</p>
                    <p className="text-lg font-bold">{sub.tradesCount}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.winningTrades}W / {sub.losingTrades}L
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                    <p className="text-lg font-bold">
                      {sub.tradesCount > 0 ? ((sub.winningTrades / sub.tradesCount) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Subscriptions</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't subscribed to any traders yet. Start copy trading to see your performance here!
            </p>
            <Button onClick={() => window.location.href = '/copy-trading'}>
              Browse Traders
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              Detailed performance and trade history
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-6">
              {/* Trader Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedSubscription.trader.avatarUrl || undefined} />
                  <AvatarFallback>
                    {selectedSubscription.trader.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedSubscription.trader.name}</h3>
                  <p className="text-sm text-muted-foreground">@{selectedSubscription.trader.username}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getRiskColor(selectedSubscription.trader.riskLevel)}>
                      {selectedSubscription.trader.riskLevel}
                    </Badge>
                    <Badge variant="outline">
                      ROI: {selectedSubscription.trader.roi}%
                    </Badge>
                    <Badge variant="outline">
                      Win Rate: {selectedSubscription.trader.winRate}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      ${selectedSubscription.totalProfit.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Loss</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600">
                      ${selectedSubscription.totalLoss.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Net P/L</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${selectedSubscription.currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedSubscription.currentProfit >= 0 ? '+' : ''}${selectedSubscription.currentProfit.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Trades */}
              <div>
                <h3 className="font-semibold mb-3">Recent Trades</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>Exit</TableHead>
                      <TableHead>Lot Size</TableHead>
                      <TableHead>P/L</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSubscription.trades.slice(0, 10).map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={trade.action === 'BUY' ? 'default' : 'secondary'}>
                            {trade.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{trade.entryPrice.toFixed(5)}</TableCell>
                        <TableCell>{trade.exitPrice?.toFixed(5) || '-'}</TableCell>
                        <TableCell>{trade.lotSize}</TableCell>
                        <TableCell>
                          <span className={trade.profitLoss >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={trade.status === 'OPEN' ? 'default' : 'secondary'}>
                            {trade.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Profit Shares */}
              {selectedSubscription.profitShares.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Profit Shares</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Trade Profit</TableHead>
                        <TableHead>Share %</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSubscription.profitShares.map((ps) => (
                        <TableRow key={ps.id}>
                          <TableCell>{new Date(ps.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-green-600 font-semibold">
                            ${ps.tradeProfit.toFixed(2)}
                          </TableCell>
                          <TableCell>{ps.percentage}%</TableCell>
                          <TableCell className="font-semibold">${ps.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={ps.status === 'PAID' ? 'default' : 'secondary'}>
                              {ps.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
