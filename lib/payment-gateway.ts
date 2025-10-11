import { prisma } from '@/lib/prisma'

export interface PaymentGatewayConfig {
  useMockPayment: boolean
  mockPaymentSuccessRate: number
  stripePublishableKey: string
  stripeSecretKey: string
  stripeWebhookSecret: string
}

export interface PaymentResult {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  error?: string
  status?: string
  paymentMethod?: any
  lastPaymentError?: any
}

export class PaymentGatewayService {
  private config: PaymentGatewayConfig | null = null

  async getConfig(): Promise<PaymentGatewayConfig> {
    if (this.config) {
      return this.config
    }

    try {
      const settings = await prisma.settings.findMany()
      const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)

      this.config = {
        useMockPayment: settingsObject.useMockPayment === 'true',
        mockPaymentSuccessRate: parseInt(settingsObject.mockPaymentSuccessRate || '85'),
        stripePublishableKey: settingsObject.stripePublishableKey || '',
        stripeSecretKey: settingsObject.stripeSecretKey || '',
        stripeWebhookSecret: settingsObject.stripeWebhookSecret || ''
      }

      return this.config
    } catch (error) {
      console.error('Error fetching payment config:', error)
      // Return default config
      return {
        useMockPayment: true,
        mockPaymentSuccessRate: 85,
        stripePublishableKey: '',
        stripeSecretKey: '',
        stripeWebhookSecret: ''
      }
    }
  }

  async createPaymentIntent(amount: number, currency: string, metadata: any): Promise<PaymentResult> {
    const config = await this.getConfig()

    if (config.useMockPayment) {
      return this.createMockPaymentIntent(amount, currency, metadata, config)
    } else {
      return this.createStripePaymentIntent(amount, currency, metadata, config)
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethod: any): Promise<PaymentResult> {
    const config = await this.getConfig()

    if (config.useMockPayment) {
      return this.confirmMockPayment(paymentIntentId, paymentMethod, config)
    } else {
      return this.confirmStripePayment(paymentIntentId, paymentMethod, config)
    }
  }

  private async createMockPaymentIntent(amount: number, currency: string, metadata: any, config: PaymentGatewayConfig): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/mock-payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          ...metadata
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create payment intent'
        }
      }

      return {
        success: true,
        paymentIntentId: data.paymentIntentId,
        clientSecret: data.clientSecret
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent'
      }
    }
  }

  private async createStripePaymentIntent(amount: number, currency: string, metadata: any, config: PaymentGatewayConfig): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          ...metadata
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create payment intent'
        }
      }

      return {
        success: true,
        paymentIntentId: data.paymentIntentId,
        clientSecret: data.clientSecret
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent'
      }
    }
  }

  private async confirmMockPayment(paymentIntentId: string, paymentMethod: any, config: PaymentGatewayConfig): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/mock-payment/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethod
        }),
      })

      const data = await response.json()

      return {
        success: data.status === 'succeeded',
        paymentIntentId: data.id,
        status: data.status,
        paymentMethod: data.payment_method,
        lastPaymentError: data.last_payment_error,
        error: data.status === 'payment_failed' ? data.last_payment_error?.message : undefined
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed'
      }
    }
  }

  private async confirmStripePayment(paymentIntentId: string, paymentMethod: any, config: PaymentGatewayConfig): Promise<PaymentResult> {
    // This would integrate with actual Stripe confirmation
    // For now, return a placeholder
    return {
      success: false,
      error: 'Stripe integration not implemented yet'
    }
  }

  async processMentorshipPayment(registrationId: string, amount: number, currency: string): Promise<PaymentResult> {
    const config = await this.getConfig()

    // Simulate payment processing
    const randomOutcome = Math.random()
    const paymentSucceeded = config.useMockPayment ? randomOutcome < (config.mockPaymentSuccessRate / 100) : true

    if (!paymentSucceeded) {
      return {
        success: false,
        error: 'Payment failed. Please try again.',
        status: 'payment_failed'
      }
    }

    return {
      success: true,
      status: 'succeeded',
      paymentIntentId: `mentorship_${Date.now()}`
    }
  }
}

// Export singleton instance
export const paymentGateway = new PaymentGatewayService()
