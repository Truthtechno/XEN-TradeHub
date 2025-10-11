'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/lib/settings-context'
import { AlertCircle, CheckCircle, CreditCard, ExternalLink, Settings, TestTube, XCircle } from 'lucide-react'

const PaymentGatewayStatus = () => {
  const { settings } = useSettings()

  const getGatewayStatus = () => {
    if (settings.useMockPayment) {
      return {
        status: 'mock',
        title: 'Mock Payment Gateway',
        description: 'Using test payment system for development',
        icon: TestTube,
        color: 'orange',
        badge: 'Testing Mode',
        details: [
          `Success Rate: ${settings.mockPaymentSuccessRate}%`,
          'No real transactions',
          'Webhook simulation enabled',
          'Professional UI included'
        ]
      }
    } else if (settings.stripePublishableKey && settings.stripeSecretKey) {
      return {
        status: 'stripe',
        title: 'Stripe Payment Gateway',
        description: 'Live payment processing enabled',
        icon: CreditCard,
        color: 'green',
        badge: 'Live Mode',
        details: [
          'Real money transactions',
          'PCI compliant',
          'Webhook integration',
          'Production ready'
        ]
      }
    } else {
      return {
        status: 'none',
        title: 'No Payment Gateway',
        description: 'Payment processing not configured',
        icon: AlertCircle,
        color: 'red',
        badge: 'Not Configured',
        details: [
          'No API keys configured',
          'Payments will fail',
          'Configure in settings',
          'Test with mock gateway'
        ]
      }
    }
  }

  const gatewayInfo = getGatewayStatus()
  const Icon = gatewayInfo.icon

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'orange':
        return 'bg-orange-50 text-orange-800 border-orange-200'
      case 'red':
        return 'bg-red-50 text-red-800 border-red-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 text-${gatewayInfo.color}-600`} />
            <CardTitle className="text-lg">{gatewayInfo.title}</CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={getStatusColor(gatewayInfo.color)}
          >
            {gatewayInfo.badge}
          </Badge>
        </div>
        <CardDescription>
          {gatewayInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {gatewayInfo.details.map((detail, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-sm text-gray-600">{detail}</span>
            </div>
          ))}
        </div>

        {settings.useMockPayment && (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
              Test Card Numbers
            </h4>
            <div className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
              <p><strong>Success:</strong> 4242 4242 4242 4242</p>
              <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
              <p><strong>Insufficient Funds:</strong> 4000 0000 0000 9995</p>
            </div>
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/admin/settings', '_blank')}
            className="flex items-center space-x-1"
          >
            <Settings className="h-3 w-3" />
            <span>Configure</span>
          </Button>
          
          {settings.useMockPayment && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Toggle to real Stripe (if configured)
                if (settings.stripePublishableKey) {
                  // This would update settings to disable mock payment
                  console.log('Switch to real Stripe')
                }
              }}
              className="flex items-center space-x-1"
            >
              <CreditCard className="h-3 w-3" />
              <span>Switch to Live</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PaymentGatewayStatus
