'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/lib/optimized-theme-context'
import StripePaymentForm from './stripe-payment-form'
import { BarChart3, CheckCircle, CreditCard, Loader2, Shield, Smartphone, TrendingUp, XCircle } from 'lucide-react'

interface SignalsSubscriptionPopupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (subscriptionData: any) => void
}

export default function SignalsSubscriptionPopup({ isOpen, onClose, onSuccess }: SignalsSubscriptionPopupProps) {
  const { isDarkMode } = useTheme()
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: 'BRIAN',
    lastName: 'AMOOTI',
    email: 'brayamooti@gmail.com',
    phone: '',
    countryCode: '+256',
    tradingExperience: 'Beginner'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStep('payment')
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent)
    
    try {
      // Wait a moment for the webhook to process the payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check if subscription was created by webhook
      const statusResponse = await fetch('/api/payments/signals', {
        method: 'GET',
        credentials: 'include'
      })
      
      const statusResult = await statusResponse.json()
      console.log('Subscription status check:', statusResult)
      
      if (statusResult.success && statusResult.subscription.hasActiveSubscription) {
        // Subscription was created by webhook
        console.log('Subscription found, proceeding to success step')
        setStep('success')
        
        // Call success callback with subscription data
        if (onSuccess) {
          onSuccess({
            ...formData,
            subscriptionDate: new Date().toISOString(),
            paymentStatus: 'completed',
            transactionId: paymentIntent.id,
            subscriptionType: 'Signals Service',
            price: 50,
            currency: 'USD',
            billingCycle: 'monthly',
            subscriptionId: statusResult.subscription.subscription?.id,
            nextBillingDate: statusResult.subscription.nextBillingDate
          })
        }
      } else {
        console.log('No subscription found, creating manually')
        // Webhook didn't create subscription, try to create it manually
        const response = await fetch('/api/payments/signals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            amountUSD: 50,
            plan: 'MONTHLY',
            provider: 'stripe',
            providerRef: paymentIntent.id,
            paymentMethodId: paymentIntent.payment_method?.id
          }),
        })

        const result = await response.json()
        console.log('Manual subscription creation result:', result)

        if (result.success) {
          setStep('success')
          
          // Call success callback with subscription data
          if (onSuccess) {
            onSuccess({
              ...formData,
              subscriptionDate: new Date().toISOString(),
              paymentStatus: 'completed',
              transactionId: paymentIntent.id,
              subscriptionType: 'Signals Service',
              price: 50,
              currency: 'USD',
              billingCycle: 'monthly',
              subscriptionId: result.subscription.id,
              nextBillingDate: result.subscription.nextBillingDate
            })
          }
        } else {
          console.error('Subscription creation failed:', result.message)
          alert(`Subscription creation failed: ${result.message}`)
        }
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Error creating subscription. Please try again.')
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    alert(`Payment failed: ${error}`)
  }

  const handleClose = () => {
    setStep('form')
    setFormData({
      firstName: 'BRIAN',
      lastName: 'AMOOTI',
      email: 'brayamooti@gmail.com',
      phone: '',
      countryCode: '+256',
      tradingExperience: 'Beginner'
    })
    onClose()
  }

  const features = [
    { icon: TrendingUp, title: 'Daily Verified Signals', description: 'Entries, stop loss, targets for every trade' },
    { icon: Shield, title: 'Risk Management', description: 'R:R logic and lot size guidance' },
    { icon: Smartphone, title: 'Mobile Access', description: 'Signals delivered to your phone' },
    { icon: BarChart3, title: 'Market Analysis', description: 'Weekly market outlook and insights' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Subscribe to Signals Service
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-6">
            {/* Subscription Details */}
            <Card className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Signals Service
                </CardTitle>
                <CardDescription>
                  Professional trading signals delivered daily
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-xen-blue">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Monthly Subscription
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        $50/month • Cancel anytime
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      $50
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      per month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Icon className="h-5 w-5 text-xen-blue flex-shrink-0" />
                    <div>
                      <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {feature.title}
                      </h4>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    First Name
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    Last Name
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <div className="flex space-x-2">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => handleInputChange('countryCode', e.target.value)}
                    className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-xen-blue ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+256">🇺🇬 +256</option>
                    <option value="+233">🇬🇭 +233</option>
                    <option value="+234">🇳🇬 +234</option>
                  </select>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Phone number"
                    required
                    className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Trading Experience
                </label>
                <select
                  value={formData.tradingExperience}
                  onChange={(e) => handleInputChange('tradingExperience', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-xen-blue ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="Beginner">Beginner (0-1 years)</option>
                  <option value="Intermediate">Intermediate (1-3 years)</option>
                  <option value="Advanced">Advanced (3+ years)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-xen-blue hover:bg-xen-blue/90 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Continue to Payment</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            {/* Subscription Summary */}
            <Card className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Subscription Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Signals Service (Monthly)
                    </span>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      $50.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Billing Cycle
                    </span>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Monthly
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Total
                      </span>
                      <span className={`text-lg font-bold text-xen-blue`}>
                        $50.00
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <StripePaymentForm
              amount={50}
              currency="USD"
              courseId={999}
              courseTitle="Signals Service Monthly Subscription"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={() => setStep('form')}
              paymentIntentEndpoint="/api/mock-payment/create-signals-payment-intent"
            />
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Subscription Successful!
              </h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Welcome to the Signals Service. You'll receive your first signals within 24 hours.
              </p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                What's Next?
              </h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Check your email for confirmation</li>
                <li>• Join our private Telegram group</li>
                <li>• Download the mobile app for instant notifications</li>
                <li>• Your first signals will arrive tomorrow</li>
              </ul>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-xen-blue hover:bg-xen-blue/90 text-white"
            >
              Start Trading
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
