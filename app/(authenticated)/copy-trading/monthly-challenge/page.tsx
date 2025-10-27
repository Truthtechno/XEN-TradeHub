'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trophy, Users, DollarSign, Copy, Share2, CheckCircle2, Clock, Gift, BarChart3 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ChallengeProgress {
  id: string
  month: string
  referralCount: number
  qualifiedReferrals: Array<{
    id: string
    name: string
    email: string
    joinedAt: string
  }>
  rewardClaimed: boolean
  rewardAmount: number
  claimedAt: string | null
}

interface AffiliateInfo {
  code: string
  link: string
}

export default function MonthlyChallengePagePage() {
  const [progress, setProgress] = useState<ChallengeProgress | null>(null)
  const [affiliate, setAffiliate] = useState<AffiliateInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchChallengeProgress()
    fetchAffiliateInfo()
  }, [])

  const fetchChallengeProgress = async () => {
    try {
      const response = await fetch('/api/monthly-challenge/progress')
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Error fetching challenge progress:', error)
      toast.error('Failed to load challenge progress')
    } finally {
      setLoading(false)
    }
  }

  const fetchAffiliateInfo = async () => {
    try {
      const response = await fetch('/api/affiliates/program')
      if (response.ok) {
        const data = await response.json()
        if (data.program) {
          const baseUrl = window.location.origin
          setAffiliate({
            code: data.program.referralCode,
            link: `${baseUrl}/auth/signup?ref=${data.program.referralCode}`
          })
        }
      }
    } catch (error) {
      console.error('Error fetching affiliate info:', error)
    }
  }

  const handleClaimReward = async () => {
    if (!progress || progress.referralCount < 3) return

    setClaiming(true)
    try {
      const response = await fetch('/api/monthly-challenge/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Congratulations! Your $1,000 reward has been added to pending payouts!')
        fetchChallengeProgress()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to claim reward')
      }
    } catch (error) {
      toast.error('Failed to claim reward')
    } finally {
      setClaiming(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnWhatsApp = () => {
    if (!affiliate) return
    const message = encodeURIComponent(
      `🎉 Join XEN TradeHub and start copy trading! Use my referral link: ${affiliate.link}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const shareOnTwitter = () => {
    if (!affiliate) return
    const message = encodeURIComponent(
      `🎉 Join XEN TradeHub and start copy trading! ${affiliate.link}`
    )
    window.open(`https://twitter.com/intent/tweet?text=${message}`, '_blank')
  }

  const progressPercentage = progress ? Math.min((progress.referralCount / 3) * 100, 100) : 0
  const isCompleted = progress && progress.referralCount >= 3
  const canClaim = isCompleted && !progress.rewardClaimed

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading challenge...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Monthly Challenge</h1>
        </div>
        <p className="text-muted-foreground">
          Refer 3 friends to join copy trading and earn $1,000!
        </p>
      </div>

      {/* Challenge Promo Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl">$1,000 Monthly Reward</CardTitle>
                <CardDescription className="text-base">
                  Help 3 friends start their copy trading journey
                </CardDescription>
              </div>
            </div>
            {canClaim && (
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleClaimReward}
                disabled={claiming}
              >
                <Trophy className="mr-2 h-5 w-5" />
                {claiming ? 'Claiming...' : 'Claim $1,000'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold">Step 1</p>
                <p className="text-sm text-muted-foreground">Share your link</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold">Step 2</p>
                <p className="text-sm text-muted-foreground">Friends sign up</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Copy className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold">Step 3</p>
                <p className="text-sm text-muted-foreground">They join copy trading</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Your Progress
          </CardTitle>
          <CardDescription>
            Track your referrals and see how close you are to earning $1,000
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {progress?.referralCount || 0} of 3 qualified referrals
              </span>
              <span className="text-muted-foreground">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            {progress?.rewardClaimed ? (
              <Badge className="text-lg px-6 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Reward Claimed on {new Date(progress.claimedAt!).toLocaleDateString()}
              </Badge>
            ) : isCompleted ? (
              <Badge className="text-lg px-6 py-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <Trophy className="mr-2 h-5 w-5" />
                Challenge Completed! Claim Your Reward
              </Badge>
            ) : (
              <Badge className="text-lg px-6 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Clock className="mr-2 h-5 w-5" />
                {3 - (progress?.referralCount || 0)} more referral{3 - (progress?.referralCount || 0) !== 1 ? 's' : ''} needed
              </Badge>
            )}
          </div>

          {/* Qualified Referrals List */}
          {progress && progress.qualifiedReferrals.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Qualified Referrals</h3>
              <div className="space-y-2">
                {progress.qualifiedReferrals.map((referral, index) => (
                  <div 
                    key={referral.id} 
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                        {index + 1}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{referral.name || referral.email}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        Joined {new Date(referral.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Link Card */}
      {!affiliate && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Users className="h-5 w-5" />
              Affiliate Account Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              To participate in the Monthly Challenge and claim the $1,000 reward, you need to have an active affiliate account.
            </p>
            <Button 
              onClick={() => window.location.href = '/affiliates'}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              Register as Affiliate
            </Button>
          </CardContent>
        </Card>
      )}
      
      {affiliate && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link with friends to track your referrals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referral-link">Referral Link</Label>
              <div className="flex gap-2">
                <Input 
                  id="referral-link"
                  value={affiliate.link} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={() => copyToClipboard(affiliate.link)}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Share On</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={shareOnWhatsApp}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button 
                  onClick={shareOnTwitter}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
                <Button 
                  onClick={() => copyToClipboard(affiliate.link)}
                  variant="outline"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-600 dark:text-purple-400">1</span>
              </div>
              <div>
                <p className="font-semibold">Get Your Affiliate Link</p>
                <p className="text-sm text-muted-foreground">
                  If you don't have an affiliate account, register one first at the Earn With Us page
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <div>
                <p className="font-semibold">Share With Friends</p>
                <p className="text-sm text-muted-foreground">
                  Share your referral link via WhatsApp, Twitter, or any social media
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <div>
                <p className="font-semibold">They Join Copy Trading</p>
                <p className="text-sm text-muted-foreground">
                  Your referrals must sign up using your link AND subscribe to any copy trading platform
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-yellow-600 dark:text-yellow-400">4</span>
              </div>
              <div>
                <p className="font-semibold">Claim Your $1,000</p>
                <p className="text-sm text-muted-foreground">
                  Once 3 qualified referrals are confirmed, claim your $1,000 reward!
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              Important Notes:
            </p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>Challenge resets every month</li>
              <li>Referrals must sign up using your unique link</li>
              <li>Referrals must subscribe to copy trading to count</li>
              <li>Reward is paid once per month per user</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
