'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, CreditCard, Download, Loader2, Lock, Shield, X } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'

interface PaymentPortalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  resourceTitle: string
  resourceType: string
  priceUSD: number
  resourceUrl?: string
  resourceId?: string
}

export function PaymentPortal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  resourceTitle, 
  resourceType,
  priceUSD,
  resourceUrl,
  resourceId
}: PaymentPortalProps) {
  const { isDarkMode } = useTheme()
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment')
  const [isProcessing, setIsProcessing] = useState(false)

  console.log('PaymentPortal rendered', { isOpen, resourceTitle, priceUSD, resourceId })
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: ''
  })

  const handlePayment = async () => {
    setIsProcessing(true)
    setStep('processing')
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Call the purchase API
      const response = await fetch('/api/resources/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          resourceId: resourceId,
          amountUSD: priceUSD,
          provider: 'stripe'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setStep('success')
        
        // Auto-download after successful payment
        if (resourceUrl) {
          setTimeout(() => {
            window.open(resourceUrl, '_blank')
          }, 1000)
        }
        
        // Call success callback after a delay
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 3000)
      } else {
        throw new Error(data.message || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setStep('payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(.{2})/, '$1/')
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {step === 'success' ? 'Payment Successful!' : 'Complete Your Purchase'}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  {step === 'success' ? 'Your resource is being downloaded...' : 'Secure payment processing'}
                </DialogDescription>
              </div>
            </div>
            {step !== 'processing' && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resource Summary */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getTypeIcon(resourceType)}</span>
                <div className="flex-1">
                  <CardTitle className="text-lg">{resourceTitle}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {resourceType}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${priceUSD.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    One-time payment
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Payment Steps */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({
                    ...paymentData,
                    cardNumber: formatCardNumber(e.target.value)
                  })}
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      expiryDate: formatExpiryDate(e.target.value)
                    })}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                    })}
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={paymentData.cardholderName}
                  onChange={(e) => setPaymentData({
                    ...paymentData,
                    cardholderName: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={paymentData.email}
                  onChange={(e) => setPaymentData({
                    ...paymentData,
                    email: e.target.value
                  })}
                />
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Processing Payment...
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Please don't close this window
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your resource is being downloaded...
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {step === 'payment' && (
            <div className="space-y-3">
              <Button
                onClick={handlePayment}
                disabled={!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName || !paymentData.email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Lock className="h-4 w-4 mr-2" />
                Pay ${priceUSD.toFixed(2)}
              </Button>
              
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="h-3 w-3" />
                <span>Secure payment processing</span>
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          {step === 'payment' && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>🔒 256-bit SSL encryption • 💳 All major cards accepted</p>
              <p>🔄 Instant access • 📧 Receipt sent to email</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
