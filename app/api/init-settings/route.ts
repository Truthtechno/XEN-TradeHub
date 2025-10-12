import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




export async function POST() {


  try {
    // Initialize default settings if they don't exist
    const defaultSettings = {
      useMockPayment: 'true',
      mockPaymentSuccessRate: '85',
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
      siteName: 'CoreFX',
      siteDescription: 'Professional Trading Education Platform',
      siteUrl: 'https://corefx.com',
      supportEmail: 'support@corefx.com',
      supportPhone: '+1-555-0123',
      supportAddress: '123 Trading Street, New York, NY 10001',
      defaultBrokerLink: 'https://exness.com/register?ref=corefx',
      timezone: 'UTC',
      currency: 'USD',
      primaryColor: '#dc2626',
      secondaryColor: '#1e40af',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      theme: 'light'
    }

    const results: Array<{ key: string; value: string; status: string; error?: string }> = []
    
    for (const [key, value] of Object.entries(defaultSettings)) {
      try {
        const setting = await prisma.settings.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
        results.push({ key, value, status: 'success' })
      } catch (error) {
        results.push({ key, value, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Settings initialized',
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Settings initialization error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Settings initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
