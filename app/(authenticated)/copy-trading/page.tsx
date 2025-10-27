'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, DollarSign, Copy as CopyIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'

interface CopyTradingPlatform {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  profitPercentage: number
  riskLevel: string
  totalFollowers: number
  minInvestment: number
  copyTradingLink: string | null
  strategy: string | null
  isActive: boolean
}

export default function CopyTradingPage() {
  const [platforms, setPlatforms] = useState<CopyTradingPlatform[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<CopyTradingPlatform | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/copy-trading/platforms')
      console.log('Fetch response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched platforms:', data)
        setPlatforms(data.platforms || [])
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData)
        toast.error(errorData.error || 'Failed to load platforms')
      }
    } catch (error) {
      console.error('Error fetching platforms:', error)
      toast.error('Failed to load platforms')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCopy = async () => {
    if (!selectedPlatform || !investmentAmount) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/copy-trading/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: selectedPlatform.id,
          investmentUSD: parseFloat(investmentAmount)
        })
      })

      if (response.ok) {
        toast.success(`Successfully subscribed! Redirecting to ${selectedPlatform.name}...`)
        
        // Open copy trading link if available
        if (selectedPlatform.copyTradingLink) {
          window.open(selectedPlatform.copyTradingLink, '_blank')
        }
        
        setSelectedPlatform(null)
        setInvestmentAmount('')
      } else {
        throw new Error('Failed to subscribe')
      }
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const calculatePotentialEarnings = (investment: number, profitPercentage: number) => {
    return (investment * (profitPercentage / 100)).toFixed(2)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading platforms...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Copy Trading</h1>
        <p className="text-muted-foreground">
          Follow and automatically copy trades from our top-performing master platforms. Earn while you learn!
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">How It Works</CardTitle>
            <CopyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Select a master platform, set your investment amount, and their trades will be automatically copied to your account.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flexible Control</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              You can stop copying at any time and maintain full control over your account.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Master Traders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <Card key={platform.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={platform.logoUrl || undefined} alt={platform.name} />
                  <AvatarFallback className="text-lg font-bold">
                    {platform.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{platform.name}</CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Trusted Partner
                  </Badge>
                </div>
              </div>
              <CardDescription>{platform.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Strategy */}
              {platform.strategy && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold">Strategy:</p>
                  <p className="text-sm text-muted-foreground">{platform.strategy}</p>
                </div>
              )}

              {/* Min Investment */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Minimum Investment</p>
                <p className="text-xl font-bold">${platform.minInvestment.toLocaleString()}</p>
              </div>

              {/* CTA Button */}
              <Dialog open={selectedPlatform?.id === platform.id} onOpenChange={(open) => !open && setSelectedPlatform(null)}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-theme-primary hover:bg-theme-primary-700 text-white" onClick={() => setSelectedPlatform(platform)}>
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Join Copy Trading
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Copy {platform.name}'s Trades</DialogTitle>
                    <DialogDescription>
                      Set your investment amount to start copying this trader's strategy.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Trader Summary */}
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={platform.logoUrl || undefined} />
                        <AvatarFallback>{platform.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{platform.name}</p>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mt-1">
                          Trusted Partner
                        </Badge>
                      </div>
                    </div>

                    {/* Investment Input */}
                    <div className="space-y-2">
                      <Label htmlFor="investment">Investment Amount (USD)</Label>
                      <Input
                        id="investment"
                        type="number"
                        min={platform.minInvestment}
                        step="100"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        placeholder={`Min: $${platform.minInvestment}`}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum investment: ${platform.minInvestment.toLocaleString()}
                      </p>
                    </div>

                    <Button 
                      onClick={handleJoinCopy} 
                      className="w-full bg-theme-primary hover:bg-theme-primary-700 text-white" 
                      disabled={submitting || !investmentAmount || parseFloat(investmentAmount) < platform.minInvestment}
                    >
                      {submitting ? 'Processing...' : 'Start Copying'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {platforms.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Master Traders Available</h3>
            <p className="text-muted-foreground text-center">
              We're currently onboarding top platforms. Check back soon to start copy trading!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
