'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { DollarSign, Users, TrendingUp, Clock, CheckCircle, Copy, Check, AlertCircle, BarChart3 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AffiliateData {
  id: string
  affiliateCode: string
  tier: string
  commissionRate: number
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
  totalReferrals: number
  isActive: boolean
}

interface Commission {
  id: string
  amount: number
  type: string
  description: string
  status: string
  requiresVerification: boolean
  verifiedAt: string | null
  rejectionReason: string | null
  createdAt: string
}

interface Payout {
  id: string
  amount: number
  method: string
  status: string
  transactionId: string | null
  paidAt: string | null
  createdAt: string
}

interface Referral {
  id: string
  status: string
  conversionDate: string | null
  createdAt: string
  referredUser: {
    name: string | null
    email: string
  }
}

export default function AffiliateDashboardPage() {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showPayoutRequest, setShowPayoutRequest] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState(0)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [affiliateRes, commissionsRes, payoutsRes, referralsRes] = await Promise.all([
        fetch('/api/affiliates/program'),
        fetch('/api/affiliates/commissions'),
        fetch('/api/affiliates/payouts'),
        fetch('/api/affiliates/referrals')
      ])

      if (affiliateRes.ok) {
        const data = await affiliateRes.json()
        setAffiliateData(data.affiliate)
        setPayoutAmount(data.affiliate?.pendingEarnings || 0)
      }

      if (commissionsRes.ok) {
        const data = await commissionsRes.json()
        setCommissions(data.commissions || [])
      }

      if (payoutsRes.ok) {
        const data = await payoutsRes.json()
        setPayouts(data.payouts || [])
      }

      if (referralsRes.ok) {
        const data = await referralsRes.json()
        setReferrals(data.referrals || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async () => {
    try {
      const response = await fetch('/api/affiliates/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payoutAmount })
      })

      if (response.ok) {
        toast.success('Payout request submitted successfully')
        setShowPayoutRequest(false)
        fetchData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to request payout')
      }
    } catch (error) {
      toast.error('Failed to request payout')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const getAffiliateLink = () => {
    if (!affiliateData) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/?ref=${affiliateData.affiliateCode}`
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

  const getStatusBadge = (status: string) => {
    const variants: any = {
      PENDING: 'secondary',
      APPROVED: 'default',
      REJECTED: 'destructive',
      COMPLETED: 'default',
      CONVERTED: 'default'
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
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

  if (!affiliateData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Not Registered as Affiliate</h3>
            <p className="text-muted-foreground text-center mb-6">
              You need to register as an affiliate to access this dashboard.
            </p>
            <Button onClick={() => router.push('/affiliates')}>
              Go to Affiliate Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nextTierInfo = () => {
    const tiers = [
      { name: 'BRONZE', min: 0, max: 10, rate: 10 },
      { name: 'SILVER', min: 11, max: 25, rate: 12 },
      { name: 'GOLD', min: 26, max: 50, rate: 15 },
      { name: 'PLATINUM', min: 51, max: Infinity, rate: 20 }
    ]
    
    const currentIndex = tiers.findIndex(t => t.name === affiliateData.tier)
    if (currentIndex < tiers.length - 1) {
      const nextTier = tiers[currentIndex + 1]
      const remaining = nextTier.min - affiliateData.totalReferrals
      return { tier: nextTier, remaining }
    }
    return null
  }

  const tierProgress = nextTierInfo()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">Track your performance and earnings</p>
        </div>
        <Badge className={getTierColor(affiliateData.tier)} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
          {affiliateData.tier} Tier - {affiliateData.commissionRate}%
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${affiliateData.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${affiliateData.pendingEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${affiliateData.paidEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Already paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateData.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">Total referred</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      {tierProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Tier Progress</CardTitle>
            <CardDescription>
              {tierProgress.remaining} more referrals to reach {tierProgress.tier.name} tier ({tierProgress.tier.rate}% commission)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (affiliateData.totalReferrals / tierProgress.tier.min) * 100)}%`
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affiliate Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Affiliate Link</CardTitle>
          <CardDescription>Share this link to earn commissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={getAffiliateLink()}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={() => copyToClipboard(getAffiliateLink())}
              variant="outline"
              className="flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <p>Code:</p>
              <code className="px-2 py-1 bg-muted rounded">{affiliateData.affiliateCode}</code>
            </div>
            {affiliateData.pendingEarnings >= 50 && (
              <Button onClick={() => setShowPayoutRequest(true)}>
                Request Payout
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="commissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>Track all your earned commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No commissions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell>{new Date(commission.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{commission.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{commission.description}</p>
                            {commission.requiresVerification && commission.status === 'PENDING' && (
                              <p className="text-xs text-yellow-600">Awaiting verification</p>
                            )}
                            {commission.rejectionReason && (
                              <p className="text-xs text-red-600">{commission.rejectionReason}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">${commission.amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
              <CardDescription>People who signed up using your link</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Conversion Date</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No referrals yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{referral.referredUser.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{referral.referredUser.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                        <TableCell>
                          {referral.conversionDate
                            ? new Date(referral.conversionDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>{new Date(referral.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Track your commission payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No payouts yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold">${payout.amount.toFixed(2)}</TableCell>
                        <TableCell>{payout.method.replace('_', ' ')}</TableCell>
                        <TableCell className="font-mono text-sm">{payout.transactionId || '-'}</TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout Request Dialog */}
      <Dialog open={showPayoutRequest} onOpenChange={setShowPayoutRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Request a payout of your pending commissions (minimum $50)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Available Balance</Label>
              <div className="text-2xl font-bold">${affiliateData.pendingEarnings.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payoutAmount">Payout Amount</Label>
              <Input
                id="payoutAmount"
                type="number"
                step="0.01"
                min="50"
                max={affiliateData.pendingEarnings}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(parseFloat(e.target.value))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPayoutRequest(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRequestPayout}
                disabled={payoutAmount < 50 || payoutAmount > affiliateData.pendingEarnings}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
