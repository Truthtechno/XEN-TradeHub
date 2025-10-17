'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/lib/settings-context'
import MockPaymentForm from './mock-payment-form'
import { useTheme } from '@/lib/optimized-theme-context'
import { CreditCard, Loader2, CheckCircle, X } from 'lucide-react'

interface StripePaymentFormProps {
  amount: number
  currency: string
  courseId: string | number // Allow both string and number IDs
  courseTitle: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  onCancel: () => void
  paymentIntentEndpoint?: string // Optional custom endpoint
}

const PaymentForm = ({ 
  amount, 
  currency, 
  courseId, 
  courseTitle, 
  onSuccess, 
  onError, 
  onCancel,
  paymentIntentEndpoint = '/api/stripe/create-payment-intent'
}: StripePaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const { isDarkMode } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent()
  }, [])

  const createPaymentIntent = async () => {
    try {
      const response = await fetch(paymentIntentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          courseId,
          courseTitle,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent')
      }

      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      onError(error instanceof Error ? error.message : 'Failed to create payment intent')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (error) {
        onError(error.message || 'Payment failed')
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent)
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: isDarkMode ? '#ffffff' : '#424770',
        '::placeholder': {
          color: isDarkMode ? '#aab7c4' : '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Card Details
          </label>
          <div className={`p-4 border rounded-lg transition-colors duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className={`p-4 rounded-lg transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Total Amount:
            </span>
            <span className={`font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currency} {amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
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
          disabled={!stripe || !elements || isLoading}
          className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
        >
          {isLoading ? (
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
    </form>
  )
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  const { settings, loading } = useSettings()
  const [stripePromise, setStripePromise] = useState<any>(null)

  useEffect(() => {
    if (!settings.useMockPayment && settings.stripePublishableKey) {
      setStripePromise(loadStripe(settings.stripePublishableKey))
    }
  }, [settings.stripePublishableKey, settings.useMockPayment])

  // Use mock payment form if enabled in settings
  if (settings.useMockPayment) {
    console.log('Using mock payment form')
    return <MockPaymentForm {...props} />
  }

  // Show loading while Stripe is being initialized
  if (!stripePromise) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading payment form...</p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}
