'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, CheckCircle, Crown, GraduationCap, Lock, MessageCircle, Mic, Shield, Smartphone, Star, Target, TrendingUp, Users } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { usePageViewTracking } from '@/lib/use-page-view-tracking'
import SignalsSubscriptionPopup from '@/components/ui/signals-subscription-popup'
import SubscriptionStatusCard from '@/components/ui/subscription-status-card'
import BannerDisplay from '@/components/banner-display'
import { useState, useEffect } from 'react'

interface Forecast {
  id: string
  title: string
  description: string
  pair?: string
  chartImage?: string
  author: {
    id: string
    name: string
    email: string
  }
  isPublic: boolean
  views: number
  likes: number
  comments: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

const features = [
  {
    icon: Target,
    title: 'Daily Verified Signals',
    description: 'Entries, stop loss, targets, and breakdown for every trade (gold, majors, indices)',
    color: 'text-green-500'
  },
  {
    icon: Shield,
    title: 'Institutional-Level Risk Guidance',
    description: 'All signals come with R:R logic and lot size guidance',
    color: 'text-green-500'
  },
  {
    icon: Mic,
    title: 'Weekly Market Outlook',
    description: 'Voice memo from CoreFX team — stay ahead of the curve',
    color: 'text-purple-500'
  },
  {
    icon: Lock,
    title: 'Signals Vault Access',
    description: 'Go back and learn from hundreds of previous setups (educational gold)',
    color: 'text-orange-500'
  },
  {
    icon: MessageCircle,
    title: 'Private Telegram Access',
    description: 'Instant alerts. No delay. No missed opportunity.',
    color: 'text-teal-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Delivery',
    description: 'You get alerts fast — no need to stay glued to MT4',
    color: 'text-red-500'
  }
]

const highlights = [
  {
    value: '90%+',
    label: 'Backtested Accuracy',
    color: 'text-xen-blue'
  },
  {
    value: 'Daily',
    label: 'Verified Signals',
    color: 'text-green-500'
  },
  {
    value: 'Instant',
    label: 'Telegram Alerts',
    color: 'text-purple-500'
  }
]

const whyJoin = [
  {
    icon: BarChart3,
    title: '90%+ Backtested Accuracy',
    description: 'Many signals hitting full TP in volatile markets',
    color: 'text-green-500'
  },
  {
    icon: GraduationCap,
    title: 'Educational Focus',
    description: 'Each trade is explained, not just posted. You learn WHILE you earn.',
    color: 'text-teal-500'
  },
  {
    icon: Users,
    title: 'Shadow Trading',
    description: 'Trade with CoreFX without needing to decode the charts yourself',
    color: 'text-orange-500'
  }
]

const differences = [
  {
    icon: Star,
    title: 'Education-First',
    description: 'Every signal comes with detailed explanation, not just entry/exit points.'
  },
  {
    icon: Star,
    title: 'Proven Track Record',
    description: 'Consistently profitable with transparent performance history.'
  },
  {
    icon: Star,
    title: 'Risk Management',
    description: 'Every signal includes proper position sizing and risk management guidance.'
  }
]

interface SubscriptionData {
  hasActiveSubscription: boolean
  subscription?: {
    id: string
    plan: string
    status: string
    currentPeriodStart?: string
    currentPeriodEnd?: string
    createdAt?: string
    isPremium?: boolean
    isInfinite?: boolean
  }
  nextBillingDate?: string
  isTrial?: boolean
  trialEndsAt?: string
}

export default function SignalsPage() {
  const { isDarkMode } = useTheme()
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  
  // Track page view to remove NEW badge
  usePageViewTracking('/signals')

  const checkSubscription = async () => {
    try {
      setIsCheckingSubscription(true)
      
      // Check user access to determine subscription type
      const accessResponse = await fetch('/api/user/access', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (accessResponse.ok) {
        const accessData = await accessResponse.json()
        const userAccess = accessData.data
        
        // Check if user has premium access (mentorship) or signal subscription
        if (userAccess.subscriptionType === 'PREMIUM') {
          // Premium user - has infinite access
          setHasSubscription(true)
          setSubscriptionData({
            hasActiveSubscription: true,
            subscription: {
              id: 'premium-user',
              plan: 'PREMIUM',
              status: 'ACTIVE',
              isPremium: true,
              isInfinite: true
            }
          })
        } else if (userAccess.subscriptionType === 'SIGNALS') {
          // Signal subscriber - check signal subscription details
          const signalsResponse = await fetch('/api/payments/signals', {
            method: 'GET',
            credentials: 'include'
          })
          
          if (signalsResponse.ok) {
            const signalsData = await signalsResponse.json()
            setHasSubscription(signalsData.subscription?.hasActiveSubscription || false)
            setSubscriptionData(signalsData.subscription || null)
          } else {
            setHasSubscription(false)
            setSubscriptionData(null)
          }
        } else {
          // No subscription
          setHasSubscription(false)
          setSubscriptionData(null)
        }
      } else {
        setHasSubscription(false)
        setSubscriptionData(null)
      }
    } catch (error) {
      console.error('Failed to check subscription:', error)
      setHasSubscription(false)
    } finally {
      setIsCheckingSubscription(false)
    }
  }

  useEffect(() => {
    // Always check subscription on component mount
    checkSubscription()
  }, [])
  
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Banners */}
      <BannerDisplay pagePath="/signals" className="mb-4 sm:mb-6" />
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-lg bg-blue-500 flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme tracking-tight">
              Signal Service
            </h1>
            <p className="text-theme-secondary text-sm sm:text-base lg:text-lg mt-2 max-w-2xl">
              Professional trading signals and market analysis
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="mb-6 sm:mb-8">
        <SubscriptionStatusCard
          subscription={subscriptionData || { hasActiveSubscription: false }}
          onRenew={() => setIsSubscriptionOpen(true)}
          onRefresh={checkSubscription}
        />
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Who this is for */}
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Who this is for:</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Busy or part-time traders who want to skip analysis, trust the process, and trade high-probability setups that are actually explained — not just dumped.
            </p>
          </CardContent>
        </Card>

        {/* What You Get */}
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">What You Get:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg flex-shrink-0">
                          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">{feature.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Why You Should Join */}
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Why You Should Join:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {whyJoin.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                    <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Key Highlights */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
              {highlights.map((highlight, index) => (
                <div key={index} className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {highlight.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{highlight.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ready to Start */}
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Ready to Start Trading Like a Pro?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Join hundreds of traders who are already profiting from our verified signals. No guesswork, no analysis paralysis — just profitable trades delivered to your phone.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {isCheckingSubscription ? (
                <>
                  <span className="text-lg sm:text-2xl font-bold text-gray-500">Checking subscription...</span>
                  <Button disabled className="bg-gray-400 text-white text-sm sm:text-base py-2">
                    Loading...
                  </Button>
                </>
              ) : hasSubscription ? (
                <>
                  <span className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">Premium Member</span>
                  <Button 
                    onClick={() => {
                      // This will be handled by the parent component to open the right panel
                      const event = new CustomEvent('openForecastPanel')
                      window.dispatchEvent(event)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base py-2"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    SUBSCRIBED
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">$50/month</span>
                  <Button 
                    onClick={() => setIsSubscriptionOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2"
                  >
                    Subscribe Now →
                  </Button>
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs sm:text-sm text-gray-900 dark:text-white">Instant Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs sm:text-sm text-gray-900 dark:text-white">Quality Signals</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs sm:text-sm text-gray-900 dark:text-white">Monthly Signals</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What makes our signals different */}
        <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">What makes our signals different?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {differences.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex-shrink-0">
                  <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Popup */}
      <SignalsSubscriptionPopup
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        onSuccess={(subscriptionData) => {
          console.log('Subscription successful:', subscriptionData)
          setIsSubscriptionOpen(false)
          // You can add additional success handling here
        }}
      />
    </div>
  )
}
