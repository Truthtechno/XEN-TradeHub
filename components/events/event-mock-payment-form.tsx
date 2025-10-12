'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Loader2, CheckCircle, X } from 'lucide-react'

interface EventMockPaymentFormProps {
  eventId: string
  eventTitle: string
  amount: number
  currency: string
  paymentIntentId: string
  onSuccess: () => void
  onError: (error: string) => void
  onCancel: () => void
}

export default function EventMockPaymentForm({
  eventId,
  eventTitle,
  amount,
  currency,
  paymentIntentId,
  onSuccess,
  onError,
  onCancel
}: EventMockPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: ''
  })

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // Call the mock payment confirmation API
      const response = await fetch('/api/mock-payment/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
          paymentMethod: {
            card: {
              number: paymentData.cardNumber.replace(/\s/g, ''),
              exp_month: parseInt(paymentData.expiryDate.split('/')[0]),
              exp_year: parseInt('20' + paymentData.expiryDate.split('/')[1]),
              cvc: paymentData.cvv
            }
          }
        })
      })

      const data = await response.json()
      
      if (data.status === 'succeeded') {
        onSuccess()
      } else if (data.status === 'requires_action') {
        // Handle 3D Secure or other required actions
        alert('Additional authentication required. Please try again.')
        onError('Payment requires additional authentication')
      } else if (data.status === 'payment_failed') {
        onError(data.last_payment_error?.message || 'Payment failed')
      } else {
        onError('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      onError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts: string[] = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4)
    }
    
    setPaymentData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const isFormValid = () => {
    return (
      paymentData.cardNumber.replace(/\s/g, '').length === 16 &&
      paymentData.expiryDate.length === 5 &&
      paymentData.cvv.length >= 3 &&
      paymentData.cardholderName.trim().length > 0 &&
      paymentData.email.trim().length > 0
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Event: {eventTitle}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currency} {amount.toFixed(2)}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cardholderName">Cardholder Name *</Label>
                <Input
                  id="cardholderName"
                  value={paymentData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={paymentData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Test card: 4242 4242 4242 4242
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!isFormValid() || isProcessing}
                className="flex-1 bg-xen-orange hover:bg-xen-orange/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {currency} {amount.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
