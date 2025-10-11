'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/lib/optimized-theme-context'
import { AlertCircle, CheckCircle, CreditCard, Lock, XCircle } from 'lucide-react'

interface MockPaymentFormProps {
  amount: number
  currency: string
  courseId: string | number // Allow both string and number IDs
  courseTitle: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  onCancel: () => void
  paymentIntentEndpoint?: string // Optional custom endpoint
}

const MockPaymentForm = ({ 
  amount, 
  currency, 
  courseId, 
  courseTitle, 
  onSuccess, 
  onError, 
  onCancel,
  paymentIntentEndpoint = '/api/mock-payment/create-payment-intent'
}: MockPaymentFormProps) => {
  const { isDarkMode } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent()
  }, [])

  const createPaymentIntent = async () => {
    try {
      console.log('🔍 MockPaymentForm: Creating payment intent with:', { 
        amount, 
        currency, 
        courseId, 
        courseTitle, 
        paymentIntentEndpoint 
      })
      
      const requestBody = {
        // For /api/resources/purchase endpoint
        resourceId: courseId,
        amountUSD: amount,
        provider: 'mock',
        // For /api/mock-payment/create-payment-intent endpoint
        ...(paymentIntentEndpoint.includes('mock-payment') && {
          amount,
          currency,
          courseId,
          courseTitle,
        })
      }
      
      console.log('🔍 MockPaymentForm: Request body:', requestBody)
      
      const response = await fetch(paymentIntentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(requestBody),
      })

      console.log('🔍 MockPaymentForm: Response status:', response.status)
      console.log('🔍 MockPaymentForm: Response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('🔍 MockPaymentForm: Response data:', data)

      if (!response.ok) {
        console.error('❌ MockPaymentForm: Payment intent creation failed:', data)
        throw new Error(data.error || 'Failed to create payment intent')
      }

      if (!data.clientSecret || !data.paymentIntentId) {
        console.error('❌ MockPaymentForm: Invalid payment intent response:', data)
        throw new Error('Invalid payment intent response')
      }

      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
      console.log('✅ MockPaymentForm: Payment intent created successfully:', data.paymentIntentId)
    } catch (error) {
      console.error('❌ MockPaymentForm: Error creating payment intent:', error)
      onError(error instanceof Error ? error.message : 'Failed to create payment intent')
    }
  }

  const validateCardDetails = () => {
    const newErrors: Record<string, string> = {}

    // Validate card number (simple validation for demo)
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 13) {
      newErrors.number = 'Please enter a valid card number'
    }

    // Validate expiry date
    if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      newErrors.expiry = 'Please enter expiry date in MM/YY format'
    } else {
      // Check if expiry is in the future
      const expiryParts = cardDetails.expiry.split('/')
      const expMonth = parseInt(expiryParts[0])
      const expYear = parseInt('20' + expiryParts[1])
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
      
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiry = 'Card has expired'
      }
    }

    // Validate CVC
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      newErrors.cvc = 'Please enter a valid CVC'
    }

    // Validate name
    if (!cardDetails.name.trim()) {
      newErrors.name = 'Please enter cardholder name'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    console.log('Payment form submitted, paymentIntentId:', paymentIntentId)

    if (!paymentIntentId) {
      console.error('No payment intent ID available')
      onError('Payment intent not available')
      return
    }

    if (!validateCardDetails()) {
      console.log('Card validation failed')
      return
    }

    console.log('Starting payment processing...')
    setIsLoading(true)

    try {
      console.log('Confirming payment with:', { paymentIntentId, cardDetails })
      
      // Parse expiry date more carefully
      const expiryParts = cardDetails.expiry.split('/')
      const expMonth = parseInt(expiryParts[0])
      const expYear = parseInt('20' + expiryParts[1])
      
      console.log('Parsed expiry:', { expMonth, expYear })
      
      // Clean card number for API
      const cleanCardNumber = cardDetails.number.replace(/\s/g, '')
      console.log('Clean card number:', cleanCardNumber)
      
      const response = await fetch('/api/mock-payment/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethod: {
            type: 'card',
            card: {
              number: cleanCardNumber,
              exp_month: expMonth,
              exp_year: expYear,
              cvc: cardDetails.cvc,
            }
          }
        }),
      })

      console.log('Confirm payment response status:', response.status)
      const data = await response.json()
      console.log('Confirm payment response data:', data)

      // Handle different response statuses
      if (response.status === 200) {
        // Success
        if (data.status === 'succeeded') {
          onSuccess(data)
        } else if (data.status === 'requires_action') {
          // Handle 3D Secure or other required actions
          onError('Additional authentication required. Please try again.')
        } else {
          onError(`Payment processing failed: ${data.status}`)
        }
      } else if (response.status === 402) {
        // Payment failed - this is expected for declined cards
        if (data.status === 'payment_failed') {
          onError(data.last_payment_error?.message || 'Payment failed')
        } else {
          onError('Payment was declined')
        }
      } else {
        // Other errors
        throw new Error(data.error || `HTTP ${response.status}: ${data.message || 'Payment failed'}`)
      }
    } catch (error) {
      console.error('Payment confirmation error:', error)
      onError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '')
    }
    return v
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Mock Payment Gateway</span>
            </div>
          </div>
          <CardDescription>
            Test payment system - No real money will be charged
          </CardDescription>
          <Badge variant="outline" className="mt-2">
            <Lock className="h-3 w-3 mr-1" />
            Secure Test Environment
          </Badge>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Amount</span>
              <span className="font-semibold">
                {currency.toUpperCase()} {amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-600 dark:text-gray-300">Course</span>
              <span className="text-sm font-medium">{courseTitle}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cardholder Name
              </label>
              <Input
                value={cardDetails.name}
                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Number
              </label>
              <Input
                value={cardDetails.number}
                onChange={(e) => setCardDetails(prev => ({ 
                  ...prev, 
                  number: formatCardNumber(e.target.value) 
                }))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={errors.number ? 'border-red-500' : ''}
              />
              {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date
                </label>
                <Input
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails(prev => ({ 
                    ...prev, 
                    expiry: formatExpiry(e.target.value) 
                  }))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={errors.expiry ? 'border-red-500' : ''}
                />
                {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVC
                </label>
                <Input
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails(prev => ({ 
                    ...prev, 
                    cvc: e.target.value.replace(/\D/g, '').substring(0, 4) 
                  }))}
                  placeholder="123"
                  maxLength={4}
                  className={errors.cvc ? 'border-red-500' : ''}
                />
                {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium">Test Card Numbers:</p>
                  <p className="mt-1">• 4242 4242 4242 4242 (Success) - Use Exp: 12/25</p>
                  <p>• 4000 0000 0000 0002 (Declined) - Use Exp: 12/25</p>
                  <p>• 4000 0000 0000 9995 (Insufficient funds) - Use Exp: 12/25</p>
                  <p className="text-xs mt-2 text-blue-600">Use any future expiry date (MM/YY format)</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Pay {currency.toUpperCase()} {amount.toFixed(2)}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default MockPaymentForm
