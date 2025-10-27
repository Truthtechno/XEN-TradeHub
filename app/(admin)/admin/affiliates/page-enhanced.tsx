'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, Users, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AffiliateProgram {
  id: string
  affiliateCode: string
  tier: string
  commissionRate: number
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
  totalReferrals: number
  isActive: boolean
  createdAt: string
  user: {
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
    affiliateCode: string
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
  const [showPayouts, setShowPayouts] = useState(false)
  const [showReferrals, setShowReferrals] = useState(false)
  const [payoutForm, setPayoutForm] = useState({
    affiliateId: '',
    amount: 0,
    method: 'BANK_TRANSFER',
    notes: ''
  })
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)

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
      const response = await fetch(`/api/admin/affiliates/payouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          transactionId,
          paidAt: status === 'COMPLETED' ? new Date().toISOString() : undefined
        })
      })

      if (response.ok) {
        toast.success('Payout status updated successfully')
        fetchPayouts()
        fetchAffiliates()
      } else {
        throw new Error('Failed to update payout')
      }
    } catch (error) {
      toast.error('Failed to update payout')
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Management</h1>
          <p className="text-muted-foreground">Manage affiliate programs, commissions, and payouts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowReferrals(!showReferrals)}>
            <Users className="mr-2 h-4 w-4" />
            Referrals ({referrals.length})
          </Button>
          <Button variant="outline" onClick={() => setShowPayouts(!showPayouts)}>
            <DollarSign className="mr-2 h-4 w-4" />
            Payouts ({payouts.length})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Payouts Panel */}
      {showPayouts && (
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Payouts</CardTitle>
            <CardDescription>Manage commission payouts to affiliates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payout.affiliateProgram.user.name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{payout.affiliateProgram.affiliateCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>{payout.method.replace('_', ' ')}</TableCell>
                    <TableCell>{payout.transactionId || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        payout.status === 'COMPLETED' ? 'default' :
                        payout.status === 'PENDING' ? 'secondary' : 'destructive'
                      }>
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {payout.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button 
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
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Referrals Panel */}
      {showReferrals && (
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Referrals</CardTitle>
            <CardDescription>Track all referrals from affiliates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate Code</TableHead>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conversion Date</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
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
                        referral.status === 'CONVERTED' ? 'default' :
                        referral.status === 'PENDING' ? 'secondary' : 'outline'
                      }>
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {referral.conversionDate ? new Date(referral.conversionDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>{new Date(referral.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Affiliates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Programs</CardTitle>
          <CardDescription>Manage affiliate accounts and commissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{affiliate.user.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{affiliate.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{affiliate.affiliateCode}</TableCell>
                  <TableCell>
                    <Badge className={getTierColor(affiliate.tier)}>
                      {affiliate.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>{affiliate.commissionRate}%</TableCell>
                  <TableCell>{affiliate.totalReferrals}</TableCell>
                  <TableCell className="font-semibold text-yellow-600">${affiliate.pendingEarnings.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold text-green-600">${affiliate.paidEarnings.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={affiliate.isActive ? 'default' : 'secondary'}>
                      {affiliate.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={affiliate.tier}
                        onValueChange={(tier) => {
                          const rates = { BRONZE: 10, SILVER: 12, GOLD: 15, PLATINUM: 20 }
                          updateAffiliateTier(affiliate.id, tier, rates[tier as keyof typeof rates])
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRONZE">Bronze</SelectItem>
                          <SelectItem value="SILVER">Silver</SelectItem>
                          <SelectItem value="GOLD">Gold</SelectItem>
                          <SelectItem value="PLATINUM">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                      {affiliate.pendingEarnings > 0 && (
                        <Button size="sm" onClick={() => handleCreatePayout(affiliate)}>
                          Pay Out
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant={affiliate.isActive ? 'destructive' : 'default'}
                        onClick={() => toggleAffiliateStatus(affiliate.id, !affiliate.isActive)}
                      >
                        {affiliate.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
              <Button type="submit">Create Payout</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
