import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




export async function GET(request: NextRequest) {


  try {
    // Get payment settings from database
    const settings = await prisma.settings.findMany()
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    const useMockPayment = settingsObject.useMockPayment === 'true'
    const mockPaymentSuccessRate = parseInt(settingsObject.mockPaymentSuccessRate || '85')
    const stripePublishableKey = settingsObject.stripePublishableKey || ''
    const stripeSecretKey = settingsObject.stripeSecretKey || ''
    const stripeWebhookSecret = settingsObject.stripeWebhookSecret || ''

    // Determine gateway status
    let gatewayStatus = 'inactive'
    let gatewayType = 'none'
    let details: string[] = []

    if (useMockPayment) {
      gatewayStatus = 'active'
      gatewayType = 'mock'
      details = [
        'Mock payment gateway is active',
        `Success rate: ${mockPaymentSuccessRate}%`,
        'Safe for testing and development',
        'No real transactions processed'
      ]
    } else if (stripePublishableKey && stripeSecretKey) {
      gatewayStatus = 'active'
      gatewayType = 'stripe'
      details = [
        'Stripe payment gateway is active',
        'Production-ready payment processing',
        'PCI compliant',
        'Real transactions enabled'
      ]
    } else {
      gatewayStatus = 'inactive'
      gatewayType = 'none'
      details = [
        'No payment gateway configured',
        'Mock payment is disabled',
        'Stripe credentials not provided',
        'Payment processing unavailable'
      ]
    }

    return NextResponse.json({
      success: true,
      status: gatewayStatus,
      type: gatewayType,
      details,
      configuration: {
        useMockPayment,
        mockPaymentSuccessRate,
        stripeConfigured: !!(stripePublishableKey && stripeSecretKey),
        webhookConfigured: !!stripeWebhookSecret
      },
      testCards: useMockPayment ? {
        success: '4242 4242 4242 4242',
        declined: '4000 0000 0000 0002',
        insufficientFunds: '4000 0000 0000 9995',
        requires3DSecure: '4000 0000 0000 3220'
      } : null
    })

  } catch (error) {
    console.error('Error fetching payment gateway status:', error)
    return NextResponse.json(
      { 
        success: false,
        status: 'error',
        type: 'none',
        details: ['Error fetching payment gateway status'],
        error: 'Failed to fetch payment gateway status'
      },
      { status: 500 }
    )
  }
}
