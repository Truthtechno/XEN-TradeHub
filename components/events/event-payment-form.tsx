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
import { useTheme } from '@/lib/optimized-theme-context'
import { CreditCard, Loader2, CheckCircle, X } from 'lucide-react'

interface EventPaymentFormProps {
  eventId: string
  eventTitle: string
  amount: number
  currency: string
  paymentIntentId: string
  onSuccess: () => void
  onError: (error: string) => void
  onCancel: () => void
}

const PaymentForm = ({ 
  eventId,
  eventTitle,
  amount, 
  currency, 
  paymentIntentId,
  onSuccess, 
  onError, 
  onCancel
}: EventPaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const { isDarkMode } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentIntentId, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (error) {
        onError(error.message || 'Payment failed')
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess()
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Card Details
                </label>
                <div className={`p-4 border rounded-lg transition-colors duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                  <CardElement options={cardElementOptions} />
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
                  className="flex-1 bg-xen-orange hover:bg-xen-orange/90"
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EventPaymentForm(props: EventPaymentFormProps) {
  const [stripePromise, setStripePromise] = useState<any>(null)

  useEffect(() => {
    // Load Stripe with publishable key
    const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (stripeKey) {
      setStripePromise(loadStripe(stripeKey))
    }
  }, [])

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
