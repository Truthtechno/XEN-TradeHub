'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/lib/optimized-theme-context'
import { AlertTriangle, Calendar, CheckCircle, CreditCard, DollarSign, Loader2, Settings, XCircle } from 'lucide-react'

interface SubscriptionData {
  id: string
  status: string
  plan: string
  amountUSD: number
  currency: string
  nextBillingDate: string
  currentPeriodStart: string
  currentPeriodEnd: string
  failedPaymentCount: number
  gracePeriodEndsAt?: string
}

interface SubscriptionManagementProps {
  subscription?: SubscriptionData
  onCancel?: () => void
  onUpdate?: () => void
}

export default function SubscriptionManagement({ 
  subscription, 
  onCancel, 
  onUpdate 
}: SubscriptionManagementProps) {
  const { isDarkMode } = useTheme()
  const [isCanceling, setIsCanceling] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'PAST_DUE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'GRACE_PERIOD':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'CANCELED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'SUSPENDED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4" />
      case 'PAST_DUE':
      case 'GRACE_PERIOD':
        return <AlertTriangle className="h-4 w-4" />
      case 'CANCELED':
      case 'SUSPENDED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to signals at the end of your current billing period.'
    )

    if (!confirmed) return

    try {
      setIsCanceling(true)
      
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          reason: 'USER_REQUEST'
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Subscription canceled successfully')
        if (onCancel) onCancel()
        if (onUpdate) onUpdate()
      } else {
        alert(`Failed to cancel subscription: ${result.message}`)
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Error canceling subscription. Please try again.')
    } finally {
      setIsCanceling(false)
    }
  }

  const refreshSubscription = async () => {
    try {
      setIsLoading(true)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error refreshing subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscription) {
    return (
      <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No Active Subscription
          </CardTitle>
          <CardDescription>
            Subscribe to access premium signals and trading insights
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isInGracePeriod = subscription.status === 'GRACE_PERIOD' || subscription.status === 'PAST_DUE'
  const isActive = subscription.status === 'ACTIVE'
  const isCanceled = subscription.status === 'CANCELED'

  return (
    <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Subscription Details
            </CardTitle>
            <CardDescription>
              Manage your signals subscription
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSubscription}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(subscription.status)}
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Status
            </span>
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Plan and Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Plan
            </span>
          </div>
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {subscription.plan} - ${subscription.amountUSD}/{subscription.plan === 'MONTHLY' ? 'month' : 'year'}
          </span>
        </div>

        {/* Next Billing Date */}
        {isActive && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Next Billing
              </span>
            </div>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {formatDate(subscription.nextBillingDate)}
            </span>
          </div>
        )}

        {/* Current Period */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Current Period
            </span>
          </div>
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
          </span>
        </div>

        {/* Grace Period Warning */}
        {isInGracePeriod && subscription.gracePeriodEndsAt && (
          <div className={`p-4 rounded-lg border-l-4 border-orange-400 ${isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-800'}`}>
                  Payment Required
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                  Your subscription is past due. Please update your payment method to continue receiving signals.
                  Grace period ends: {formatDate(subscription.gracePeriodEndsAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Failed Payment Count */}
        {subscription.failedPaymentCount > 0 && (
          <div className={`p-4 rounded-lg border-l-4 border-red-400 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  Payment Issues
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                  {subscription.failedPaymentCount} failed payment{subscription.failedPaymentCount > 1 ? 's' : ''} detected.
                  Please update your payment method.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          {!isCanceled && (
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCanceling}
              className="flex-1"
            >
              {isCanceling ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Canceling...</span>
                </div>
              ) : (
                'Cancel Subscription'
              )}
            </Button>
          )}
          
          {isInGracePeriod && (
            <Button
              onClick={() => {
                // This would open a payment method update dialog
                alert('Payment method update feature coming soon!')
              }}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Update Payment Method
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
