'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import StripePaymentForm from '@/components/ui/stripe-payment-form'
import PaymentGatewayStatus from '@/components/ui/payment-gateway-status'
import PaymentStatusIndicator from '@/components/ui/payment-status-indicator'
import { useSettings } from '@/lib/settings-context'
import { 
  CreditCard, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'

export default function TestPaymentPage() {
  const { settings } = useSettings()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testAmount, setTestAmount] = useState(99.99)
  const [testCurrency, setTestCurrency] = useState('USD')
  const [testCourseTitle, setTestCourseTitle] = useState('Advanced Trading Course')

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentResult({
      status: 'succeeded',
      paymentIntent,
      timestamp: new Date().toISOString()
    })
    setShowPaymentForm(false)
  }

  const handlePaymentError = (error: string) => {
    setPaymentResult({
      status: 'failed',
      error,
      timestamp: new Date().toISOString()
    })
    setShowPaymentForm(false)
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
  }

  const resetTest = () => {
    setPaymentResult(null)
    setShowPaymentForm(false)
  }

  const testMentorshipPayment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/mentorship/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: `test-${Date.now()}`,
          amount: 1500,
          currency: 'USD'
        }),
      })

      const data = await response.json()
      
      setPaymentResult({
        status: data.success ? 'succeeded' : 'failed',
        data,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setPaymentResult({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment failed',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testPaymentFlow = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/mock-payment/test-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: testAmount,
          currency: testCurrency,
          courseId: 'test-course-123',
          courseTitle: testCourseTitle
        }),
      })

      const data = await response.json()
      
      setPaymentResult({
        status: data.success ? 'succeeded' : 'failed',
        data,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setPaymentResult({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment failed',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testSpecificCard = async (cardNumber: string, cardName: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/mock-payment/test-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: cardNumber,
          testName: cardName
        }),
      })

      const data = await response.json()
      
      setPaymentResult({
        status: data.result.status === 'succeeded' ? 'succeeded' : 'failed',
        data: data.result,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setPaymentResult({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment failed',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment System Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the mock payment gateway and payment flows
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Gateway Status */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Payment Gateway Status
            </h2>
            <PaymentGatewayStatus />
          </div>

          {/* Test Configuration */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test Configuration
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Test Settings</CardTitle>
                <CardDescription>
                  Configure test parameters for payment testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Amount
                  </label>
                  <Input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={testCurrency}
                    onChange={(e) => setTestCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Title
                  </label>
                  <Input
                    value={testCourseTitle}
                    onChange={(e) => setTestCourseTitle(e.target.value)}
                    placeholder="Course title for testing"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button
                    onClick={() => setShowPaymentForm(true)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Test Course Payment
                  </Button>
                  
                  <Button
                    onClick={testMentorshipPayment}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Mentorship
                  </Button>

                  <Button
                    onClick={testPaymentFlow}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Flow (Direct)
                  </Button>
                </div>

                <Button
                  onClick={resetTest}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Card Scenarios */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Card Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Success Card
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Test card that should always succeed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm font-mono">4242 4242 4242 4242</p>
                    <p className="text-xs text-gray-500">Exp: 12/25 | CVC: 123</p>
                  </div>
                  <Button
                    onClick={() => testSpecificCard('4242424242424242', 'Success Card')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Test Success
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Declined Card
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Test card that should be declined
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm font-mono">4000 0000 0000 0002</p>
                    <p className="text-xs text-gray-500">Exp: 12/25 | CVC: 123</p>
                  </div>
                  <Button
                    onClick={() => testSpecificCard('4000000000000002', 'Declined Card')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Test Declined
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-orange-600 dark:text-orange-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Insufficient Funds
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Test card with insufficient funds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm font-mono">4000 0000 0000 9995</p>
                    <p className="text-xs text-gray-500">Exp: 12/25 | CVC: 123</p>
                  </div>
                  <Button
                    onClick={() => testSpecificCard('4000000000009995', 'Insufficient Funds')}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={isLoading}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Test Insufficient
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Test Payment</h3>
                  <Button
                    onClick={handlePaymentCancel}
                    variant="outline"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <StripePaymentForm
                  amount={testAmount}
                  currency={testCurrency}
                  courseId={123}
                  courseTitle={testCourseTitle}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Results */}
        {paymentResult && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Payment Results
            </h2>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Test Result</CardTitle>
                  <PaymentStatusIndicator 
                    status={paymentResult.status}
                    paymentMethod={paymentResult.data?.paymentMethod || 'mock_card'}
                  />
                </div>
                <CardDescription>
                  {new Date(paymentResult.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Payment Details</h4>
                    <pre className="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
                      {JSON.stringify(paymentResult, null, 2)}
                    </pre>
                  </div>

                  {paymentResult.status === 'succeeded' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Payment completed successfully!</span>
                    </div>
                  )}

                  {paymentResult.status === 'failed' && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">
                        Payment failed: {paymentResult.error || 'Unknown error'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Debug Tools */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Debug Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/mock-payment/test')
                  const data = await response.json()
                  console.log('Mock Payment Test:', data)
                  alert(`Mock Payment Test: ${data.status}\n${data.message}`)
                } catch (error) {
                  console.error('Test error:', error)
                  alert('Test failed: ' + error)
                }
              }}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <TestTube className="h-6 w-6" />
              <span>Test Mock API</span>
            </Button>

            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/test-db')
                  const data = await response.json()
                  console.log('Database Test:', data)
                  alert(`Database Test: ${data.status}\nSettings: ${data.settingsCount}`)
                } catch (error) {
                  console.error('DB test error:', error)
                  alert('DB test failed: ' + error)
                }
              }}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Settings className="h-6 w-6" />
              <span>Test Database</span>
            </Button>

            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/init-settings', { method: 'POST' })
                  const data = await response.json()
                  console.log('Init Settings:', data)
                  alert(`Settings Init: ${data.status}\n${data.message}`)
                } catch (error) {
                  console.error('Init error:', error)
                  alert('Init failed: ' + error)
                }
              }}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <RefreshCw className="h-6 w-6" />
              <span>Init Settings</span>
            </Button>
            
            <Button
              onClick={() => window.open('/admin/settings', '_blank')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Settings className="h-6 w-6" />
              <span>Admin Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
