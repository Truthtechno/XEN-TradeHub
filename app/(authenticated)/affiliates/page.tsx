'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { DollarSign, Users, TrendingUp, Copy, Check, ExternalLink, Gift } from 'lucide-react'
import { useSession } from 'next-auth/react'

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

export default function AffiliatesPage() {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [registrationForm, setRegistrationForm] = useState({
    fullName: '',
    phone: '',
    paymentMethod: 'MOBILE_MONEY',
    accountNumber: '',
    accountName: '',
    bankName: '',
    provider: ''
  })
  const { data: session, status } = useSession()

  useEffect(() => {
    fetchAffiliateData()
  }, [])

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
  }, [session, status])

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch('/api/affiliates/program')
      if (response.ok) {
        const data = await response.json()
        setAffiliateData(data.affiliate)
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🎯 Form submitted!', registrationForm)
    
    // Validate required fields
    if (!registrationForm.fullName || !registrationForm.phone || !registrationForm.accountNumber || !registrationForm.accountName) {
      console.error('❌ Validation failed: Missing required fields')
      toast.error('Please fill in all required fields')
      return
    }

    if (registrationForm.paymentMethod === 'BANK_TRANSFER' && !registrationForm.bankName) {
      console.error('❌ Validation failed: Missing bank name')
      toast.error('Please enter bank name')
      return
    }

    if (registrationForm.paymentMethod === 'MOBILE_MONEY' && !registrationForm.provider) {
      console.error('❌ Validation failed: Missing provider')
      toast.error('Please enter mobile money provider')
      return
    }

    console.log('✅ Validation passed')
    setRegistering(true)
    
    try {
      const payoutDetails: any = {
        accountNumber: registrationForm.accountNumber,
        accountName: registrationForm.accountName
      }

      if (registrationForm.paymentMethod === 'BANK_TRANSFER') {
        payoutDetails.bankName = registrationForm.bankName
      } else if (registrationForm.paymentMethod === 'MOBILE_MONEY') {
        payoutDetails.provider = registrationForm.provider
      }

      const requestBody = {
        fullName: registrationForm.fullName,
        phone: registrationForm.phone,
        paymentMethod: registrationForm.paymentMethod,
        payoutDetails
      }

      console.log('📤 Sending registration request to /api/affiliates/register')
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch('/api/affiliates/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies for session
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response status:', response.status, response.statusText)

      const data = await response.json()
      console.log('📥 Response data:', data)

      if (response.ok) {
        console.log('✅ Registration successful!')
        setAffiliateData(data.affiliate)
        setShowRegistrationForm(false)
        toast.success('🎉 Successfully registered as an affiliate! Your referral link is ready!')
        // Refresh the page data
        await fetchAffiliateData()
      } else {
        console.error('❌ Registration failed:', data.error)
        if (response.status === 401) {
          toast.error('Session expired. Please refresh the page and try again.')
        } else {
          toast.error(data.error || 'Failed to register. Please try again.')
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error)
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setRegistering(false)
      console.log('🏁 Registration process completed')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Affiliate link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const getAffiliateLink = () => {
    if (!affiliateData) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/signup?ref=${affiliateData.affiliateCode}`
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

  if (loading || status === 'loading') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not registered yet
  if (!affiliateData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Earn With Us</h1>
          <p className="text-muted-foreground">
            Join our affiliate program and earn commissions by referring new traders to XEN TradeHub.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Earn Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get up to 20% commission on every referral's trading activity and purchases.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Tier System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Progress through Bronze, Silver, Gold, and Platinum tiers with increasing commission rates.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Track Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real-time dashboard to monitor your referrals, earnings, and commission status.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commission Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Structure</CardTitle>
            <CardDescription>Earn more as you grow your network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <Badge className="mb-2 bg-orange-100 text-orange-800">Bronze</Badge>
                <p className="text-2xl font-bold">10%</p>
                <p className="text-xs text-muted-foreground">0-10 referrals</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge className="mb-2 bg-gray-100 text-gray-800">Silver</Badge>
                <p className="text-2xl font-bold">12%</p>
                <p className="text-xs text-muted-foreground">11-25 referrals</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge className="mb-2 bg-yellow-100 text-yellow-800">Gold</Badge>
                <p className="text-2xl font-bold">15%</p>
                <p className="text-xs text-muted-foreground">26-50 referrals</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge className="mb-2 bg-purple-100 text-purple-800">Platinum</Badge>
                <p className="text-2xl font-bold">20%</p>
                <p className="text-xs text-muted-foreground">51+ referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="h-16 w-16 text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Ready to Start Earning?</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Register now to get your unique affiliate link and start earning commissions from your referrals.
            </p>
            <Button size="lg" onClick={() => setShowRegistrationForm(true)}>
              Register as Affiliate
            </Button>
          </CardContent>
        </Card>

        {/* Registration Dialog */}
        <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Affiliate Registration</DialogTitle>
              <DialogDescription>
                Complete your registration to start earning commissions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4" id="affiliate-registration-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={registrationForm.fullName}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={registrationForm.phone}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={registrationForm.paymentMethod}
                  onValueChange={(value) => setRegistrationForm({ ...registrationForm, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="PAYPAL">PayPal</SelectItem>
                    <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={registrationForm.accountNumber}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, accountNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name *</Label>
                  <Input
                    id="accountName"
                    value={registrationForm.accountName}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, accountName: e.target.value })}
                    required
                  />
                </div>
              </div>

              {registrationForm.paymentMethod === 'BANK_TRANSFER' && (
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={registrationForm.bankName}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, bankName: e.target.value })}
                    required
                  />
                </div>
              )}

              {registrationForm.paymentMethod === 'MOBILE_MONEY' && (
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider *</Label>
                  <Input
                    id="provider"
                    placeholder="e.g., M-Pesa, Airtel Money"
                    value={registrationForm.provider}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, provider: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    console.log('Cancel clicked')
                    setShowRegistrationForm(false)
                  }}
                  disabled={registering}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  disabled={registering}
                  onClick={(e) => handleRegister(e as any)}
                >
                  {registering ? 'Processing...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Already registered - show dashboard
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
          <Badge className={getTierColor(affiliateData.tier)}>
            {affiliateData.tier} Tier
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Track your referrals and earnings in real-time.
        </p>
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${affiliateData.pendingEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
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
            <p className="text-xs text-muted-foreground">Total referred users</p>
          </CardContent>
        </Card>
      </div>

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <p>Affiliate Code:</p>
            <code className="px-2 py-1 bg-muted rounded">{affiliateData.affiliateCode}</code>
          </div>
        </CardContent>
      </Card>

      {/* Commission Info */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Tier</span>
              <Badge className={getTierColor(affiliateData.tier)}>{affiliateData.tier}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Commission Rate</span>
              <span className="text-lg font-bold">{affiliateData.commissionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={affiliateData.isActive ? 'secondary' : 'warning'}>
                {affiliateData.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Promote */}
      {/* 
      <Card>
        <CardHeader>
          <CardTitle>How to Promote</CardTitle>
          <CardDescription>Tips to maximize your earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Share your link on social media platforms</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Create content about trading and include your affiliate link</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Join trading communities and share your experiences</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Email your network about XEN TradeHub's benefits</span>
            </li>
          </ul>
        </CardContent>
      </Card>*/}
    </div>
  )
}
