'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/lib/optimized-theme-context'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Calendar,
  CreditCard,
  RefreshCw,
  Crown
} from 'lucide-react'

interface SubscriptionStatusCardProps {
  subscription: {
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
    status?: string
  }
  onRenew?: () => void
  onRefresh?: () => void
}

export default function SubscriptionStatusCard({ 
  subscription, 
  onRenew, 
  onRefresh 
}: SubscriptionStatusCardProps) {
  const { isDarkMode } = useTheme()
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (subscription.subscription?.currentPeriodEnd) {
      const updateTimeUntilExpiry = () => {
        const now = new Date()
        const expiryDate = new Date(subscription.subscription!.currentPeriodEnd!)
        const diff = expiryDate.getTime() - now.getTime()
        
        if (diff <= 0) {
          setTimeUntilExpiry('Expired')
          return
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        
        if (days > 0) {
          setTimeUntilExpiry(`${days}d ${hours}h ${minutes}m`)
        } else if (hours > 0) {
          setTimeUntilExpiry(`${hours}h ${minutes}m`)
        } else {
          setTimeUntilExpiry(`${minutes}m`)
        }
      }
      
      updateTimeUntilExpiry()
      const interval = setInterval(updateTimeUntilExpiry, 60000) // Update every minute
      
      return () => clearInterval(interval)
    }
  }, [subscription.subscription?.currentPeriodEnd])

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
  }

  const getStatusInfo = () => {
    if (!subscription.hasActiveSubscription) {
      return {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        status: 'No Active Subscription',
        description: 'Subscribe to access premium signals and forecasts'
      }
    }

    // Check if this is a premium user with infinite access
    if (subscription.subscription?.isPremium && subscription.subscription?.isInfinite) {
      return {
        icon: Crown,
        color: 'text-white',
        bgColor: 'bg-purple-500',
        borderColor: 'border-purple-500/20',
        status: 'Premium Access',
        description: 'Infinite access to all premium signals and forecasts'
      }
    }

    const status = subscription.subscription?.status || 'UNKNOWN'
    const expiryDate = subscription.subscription?.currentPeriodEnd
    const now = new Date()
    const isExpired = expiryDate ? new Date(expiryDate) < now : false
    const isExpiringSoon = expiryDate ? 
      (new Date(expiryDate).getTime() - now.getTime()) < (3 * 24 * 60 * 60 * 1000) : false

    if (isExpired) {
      return {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        status: 'Subscription Expired',
        description: 'Your subscription has expired. Renew to continue accessing premium content.'
      }
    }

    if (isExpiringSoon) {
      return {
        icon: AlertTriangle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        status: 'Expiring Soon',
        description: `Your subscription expires in ${timeUntilExpiry}. Renew now to avoid interruption.`
      }
    }

    return {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      status: 'Active',
      description: `Your subscription is active and expires in ${timeUntilExpiry}`
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const getPriceDisplay = () => {
    const plan = subscription.subscription?.plan
    if (plan === 'PREMIUM') return 'Premium Access'
    if (plan === 'MONTHLY') return '$50/month'
    if (plan === 'YEARLY') return '$500/year'
    return 'N/A'
  }

  return (
    <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${statusInfo.borderColor}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
              <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
            </div>
            <div>
              <CardTitle className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ color: isDarkMode ? 'white' : '#1f2937' }}>
                {statusInfo.status}
              </CardTitle>
              <CardDescription className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
                {statusInfo.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline"
              className={`text-xs ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
            >
              {subscription.hasActiveSubscription ? getPriceDisplay() : 'No Subscription'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {subscription.hasActiveSubscription && subscription.subscription && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Subscription Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Subscription Details
              </h4>
              {subscription.subscription?.isPremium && subscription.subscription?.isInfinite ? (
                // Premium user display
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      STATUS
                    </span>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      ACTIVE
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      PLAN
                    </span>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      PREMIUM
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ACCESS
                    </span>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      INFINITE
                    </p>
                  </div>
                </div>
              ) : (
                // Signal subscriber display
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      STATUS
                    </span>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {subscription.subscription?.status || 'UNKNOWN'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      PLAN
                    </span>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getPriceDisplay()}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      NEXT BILLING
                    </span>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(subscription.subscription?.currentPeriodEnd || '')}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    CURRENT PERIOD
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(subscription.subscription?.currentPeriodStart || '')} - {formatDate(subscription.subscription?.currentPeriodEnd || '')}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Until Expiry - Only show for signal subscribers, not premium users */}
            {timeUntilExpiry && timeUntilExpiry !== 'Expired' && !(subscription.subscription?.isPremium && subscription.subscription?.isInfinite) && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Time Remaining
                  </span>
                  <span className={`text-lg font-bold ${statusInfo.color}`}>
                    {timeUntilExpiry}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {onRenew && !(subscription.subscription?.isPremium && subscription.subscription?.isInfinite) && (
                <Button
                  onClick={onRenew}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {subscription.hasActiveSubscription ? 'Renew Subscription' : 'Subscribe Now'}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => {
                  // First open the forecast panel
                  const openEvent = new CustomEvent('openForecastPanel')
                  window.dispatchEvent(openEvent)
                  
                  // Then switch to premium tab after a short delay
                  setTimeout(() => {
                    const premiumEvent = new CustomEvent('openPremiumForecasts')
                    window.dispatchEvent(premiumEvent)
                  }, 100)
                }}
                className="flex-1"
              >
                <Crown className="h-4 w-4 mr-2" />
                {subscription.subscription?.isPremium && subscription.subscription?.isInfinite ? 'View Premium Signals' : 'View Premium Signals'}
              </Button>
            </div>
          </div>
        </CardContent>
      )}

      {!subscription.hasActiveSubscription && (
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Get access to premium trading signals, forecasts, and exclusive content
            </p>
            {onRenew && (
              <Button
                onClick={onRenew}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Subscribe Now - $50/month
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
