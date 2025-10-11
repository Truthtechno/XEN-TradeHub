'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle, CreditCard, Crown, Lock, Star, Zap } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'

interface PremiumAccessModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscribe: () => void
  onPurchase?: () => void
  resourceTitle: string
  resourceType: string
  priceUSD?: number | null
  isIndividualPricing?: boolean
  isPurchasing?: boolean
}

export function PremiumAccessModal({ 
  isOpen, 
  onClose, 
  onSubscribe, 
  onPurchase,
  resourceTitle, 
  resourceType,
  priceUSD,
  isIndividualPricing = false,
  isPurchasing = false
}: PremiumAccessModalProps) {
  const { isDarkMode } = useTheme()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubscribe = async () => {
    setIsProcessing(true)
    try {
      await onSubscribe()
    } finally {
      setIsProcessing(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PODCAST': return '🎧'
      case 'EBOOK': return '📚'
      case 'VIDEO': return '🎥'
      case 'ARTICLE': return '📄'
      default: return '📄'
    }
  }

  const benefits = [
    'Access to all premium resources',
    'Exclusive trading signals',
    'Advanced market analysis',
    'Priority customer support',
    'Monthly webinars',
    'Trading strategies library'
  ]

  const mentorshipBenefits = [
    'Access to ALL premium resources',
    'Access to ALL premium signals',
    'One-on-One Mentorship sessions',
    'Custom trading strategy development',
    'Trading psychology coaching',
    'Lifetime VIP access'
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scroll-smooth mx-4 sm:mx-0">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Premium Content Access
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                This resource requires a premium subscription
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pb-4 relative">
          {/* Scroll indicator */}
          <div className="absolute top-0 right-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-transparent rounded-full opacity-50"></div>
          {/* Resource Preview */}
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getTypeIcon(resourceType)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{resourceTitle}</h3>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Premium {resourceType}
                </Badge>
              </div>
            </div>
          </div>

          {/* Lock Icon */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
              <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Premium Subscription Required
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Unlock access to this premium resource and our entire library of exclusive content.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              What you'll get with Premium:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
            
            {/* Mentorship Option */}
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-purple-800 dark:text-purple-200">One-on-One Mentorship - $1,500</span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-300 mb-2">
                Get access to ALL premium resources + signals + personalized coaching
              </p>
              <div className="grid grid-cols-1 gap-1">
                {mentorshipBenefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-purple-600 dark:text-purple-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className={`p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-800 ${isDarkMode ? 'bg-yellow-900/10' : 'bg-yellow-50'}`}>
            <div className="text-center">
              {isIndividualPricing && priceUSD ? (
                <>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Individual Resource Price
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${priceUSD.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    One-time payment for this resource
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Special Launch Price
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    $50<span className="text-lg text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Signals subscription only
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {isIndividualPricing && priceUSD && onPurchase ? (
              <>
                <Button
                  onClick={onPurchase}
                  disabled={isPurchasing || isProcessing}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3"
                >
                  {isPurchasing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Buy Now - ${priceUSD}</span>
                    </div>
                  )}
                </Button>
                <Button
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1"
                >
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4" />
                    <span>Subscribe Instead</span>
                  </div>
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Subscribe Now</span>
                  </div>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p>🔒 Secure payment processing • 💳 All major cards accepted</p>
            <p>🔄 Cancel anytime • 📧 24/7 customer support</p>
          </div>
          
          {/* Bottom fade indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
