import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




export async function GET(request: NextRequest) {


  try {
    const settings = await prisma.settings.findMany()
    
    // Convert settings array to object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)
    
    // Return settings with defaults
    const response = {
      siteName: settingsObj.siteName || 'CoreFX',
      siteDescription: settingsObj.siteDescription || 'Professional Trading Education Platform',
      siteUrl: settingsObj.siteUrl || 'https://corefx.com',
      supportEmail: settingsObj.supportEmail || 'support@corefx.com',
      supportPhone: settingsObj.supportPhone || '+1-555-0123',
      supportAddress: settingsObj.supportAddress || '123 Trading Street, New York, NY 10001',
      defaultBrokerLink: settingsObj.defaultBrokerLink || 'https://exness.com/register?ref=corefx',
      timezone: settingsObj.timezone || 'UTC',
      currency: settingsObj.currency || 'USD',
      primaryColor: settingsObj.primaryColor || '#1E40AF',
      secondaryColor: settingsObj.secondaryColor || '#DC2626',
      logoUrl: settingsObj.logoUrl || '/logo.png',
      faviconUrl: settingsObj.faviconUrl || '/favicon.ico',
      theme: settingsObj.theme || 'light',
      stripePublishableKey: settingsObj.stripePublishableKey || '',
      stripeSecretKey: settingsObj.stripeSecretKey || '',
      stripeWebhookSecret: settingsObj.stripeWebhookSecret || '',
      useMockPayment: settingsObj.useMockPayment !== undefined ? settingsObj.useMockPayment === 'true' : true,
      mockPaymentSuccessRate: parseInt(settingsObj.mockPaymentSuccessRate || '85'),
      // Enhanced theme settings
      accentColor: settingsObj.accentColor || '#10B981',
      neutralColor: settingsObj.neutralColor || '#6B7280',
      successColor: settingsObj.successColor || '#10B981',
      warningColor: settingsObj.warningColor || '#F59E0B',
      errorColor: settingsObj.errorColor || '#EF4444',
      infoColor: settingsObj.infoColor || '#3B82F6',
      headingFont: settingsObj.headingFont || 'Poppins',
      bodyFont: settingsObj.bodyFont || 'Inter',
      monoFont: settingsObj.monoFont || 'JetBrains Mono',
      useGradientAccent: settingsObj.useGradientAccent === 'true',
      cardElevation: settingsObj.cardElevation || 'medium',
      // Light/Dark mode specific colors
      lightModeColors: settingsObj.lightModeColors ? JSON.parse(settingsObj.lightModeColors) : {
        primaryColor: '#1E40AF',
        secondaryColor: '#DC2626',
        accentColor: '#10B981',
        neutralColor: '#6B7280',
        successColor: '#10B981',
        warningColor: '#F59E0B',
        errorColor: '#EF4444',
        infoColor: '#3B82F6',
      },
      darkModeColors: settingsObj.darkModeColors ? JSON.parse(settingsObj.darkModeColors) : {
        primaryColor: '#3B82F6',
        secondaryColor: '#F87171',
        accentColor: '#34D399',
        neutralColor: '#9CA3AF',
        successColor: '#34D399',
        warningColor: '#FBBF24',
        errorColor: '#F87171',
        infoColor: '#60A5FA',
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const settingsData = await request.json()
    console.log('Received settings data:', settingsData)
    
    // Prepare settings for database storage
    const settingsToStore: Array<{ key: string; value: string; category: string }> = []
    
    // Handle regular settings
    Object.entries(settingsData).forEach(([key, value]) => {
      if (key === 'lightModeColors' || key === 'darkModeColors') {
        // Store nested objects as JSON strings
        settingsToStore.push({
          key,
          value: JSON.stringify(value),
          category: 'theme'
        })
      } else if (key === 'useMockPayment' || key === 'useGradientAccent') {
        // Handle boolean values
        settingsToStore.push({
          key,
          value: String(value),
          category: key.includes('Mock') ? 'payment' : 'theme'
        })
      } else if (key === 'mockPaymentSuccessRate') {
        // Handle numeric values
        settingsToStore.push({
          key,
          value: String(value),
          category: 'payment'
        })
      } else if (key.includes('Color') || key.includes('Font') || key === 'theme' || key === 'cardElevation') {
        // Handle theme-related settings
        settingsToStore.push({
          key,
          value: String(value),
          category: 'theme'
        })
      } else {
        // Handle general settings
        settingsToStore.push({
          key,
          value: String(value),
          category: 'general'
        })
      }
    })
    
    // Update all settings
    const updatePromises = settingsToStore.map(({ key, value, category }) => {
      return prisma.settings.upsert({
        where: { key },
        update: { value, category },
        create: { key, value, category }
      })
    })
    
    await Promise.all(updatePromises)
    
    console.log('Settings updated successfully:', settingsToStore.length, 'settings')
    return NextResponse.json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Settings bulk update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { key, value } = await request.json()
    
    await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value, category: 'general' }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    )
  }
}
