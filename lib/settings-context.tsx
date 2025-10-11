'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  supportEmail: string
  supportPhone: string
  supportAddress: string
  defaultBrokerLink: string
  timezone: string
  currency: string
  primaryColor: string
  secondaryColor: string
  logoUrl: string
  faviconUrl: string
  theme: 'light' | 'dark' | 'auto'
  stripePublishableKey: string
  stripeSecretKey: string
  stripeWebhookSecret: string
  useMockPayment: boolean
  mockPaymentSuccessRate: number
  // Enhanced theme settings
  accentColor: string
  neutralColor: string
  successColor: string
  warningColor: string
  errorColor: string
  infoColor: string
  headingFont: string
  bodyFont: string
  monoFont: string
  useGradientAccent: boolean
  cardElevation: 'none' | 'low' | 'medium' | 'high'
  // Light/Dark mode specific colors
  lightModeColors: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    neutralColor: string
    successColor: string
    warningColor: string
    errorColor: string
    infoColor: string
  }
  darkModeColors: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    neutralColor: string
    successColor: string
    warningColor: string
    errorColor: string
    infoColor: string
  }
}

interface SettingsContextType {
  settings: SiteSettings
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
  updateSetting: (key: keyof SiteSettings, value: string) => Promise<void>
}

const defaultSettings: SiteSettings = {
  siteName: 'CoreFX',
  siteDescription: 'Professional Trading Education Platform',
  siteUrl: 'https://corefx.com',
  supportEmail: 'support@corefx.com',
  supportPhone: '+1-555-0123',
  supportAddress: '123 Trading Street, New York, NY 10001',
  defaultBrokerLink: 'https://exness.com/register?ref=corefx',
  timezone: 'UTC',
  currency: 'USD',
  primaryColor: '#1E40AF', // Deep Royal Blue
  secondaryColor: '#DC2626', // Signal Red
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  theme: 'light',
  stripePublishableKey: '',
  stripeSecretKey: '',
  stripeWebhookSecret: '',
  useMockPayment: true, // Enable mock payment to match other pages
  mockPaymentSuccessRate: 85, // 85% success rate for testing
  // Enhanced theme settings
  accentColor: '#10B981', // Green for profit
  neutralColor: '#6B7280', // Neutral gray
  successColor: '#10B981', // Green
  warningColor: '#F59E0B', // Amber
  errorColor: '#EF4444', // Red
  infoColor: '#3B82F6', // Blue
  headingFont: 'Poppins',
  bodyFont: 'Inter',
  monoFont: 'JetBrains Mono',
  useGradientAccent: false,
  cardElevation: 'medium',
  // Light mode colors
  lightModeColors: {
    primaryColor: '#1E40AF', // Deep Royal Blue
    secondaryColor: '#DC2626', // Signal Red
    accentColor: '#10B981', // Green for profit
    neutralColor: '#6B7280', // Neutral gray
    successColor: '#10B981', // Green
    warningColor: '#F59E0B', // Amber
    errorColor: '#EF4444', // Red
    infoColor: '#3B82F6', // Blue
  },
  // Dark mode colors
  darkModeColors: {
    primaryColor: '#3B82F6', // Lighter blue for dark mode
    secondaryColor: '#F87171', // Lighter red for dark mode
    accentColor: '#34D399', // Lighter green for dark mode
    neutralColor: '#9CA3AF', // Lighter gray for dark mode
    successColor: '#34D399', // Lighter green for dark mode
    warningColor: '#FBBF24', // Lighter amber for dark mode
    errorColor: '#F87171', // Lighter red for dark mode
    infoColor: '#60A5FA', // Lighter blue for dark mode
  },
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(false) // Start with false to prevent infinite loading
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      console.log('Starting to fetch settings...')
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/settings', {
        credentials: 'include'
      })
      
      console.log('Settings API response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Settings fetched successfully:', data)
      
      // Merge with defaults to ensure all properties are present
      const mergedSettings = {
        ...defaultSettings,
        ...data,
        lightModeColors: data.lightModeColors || defaultSettings.lightModeColors,
        darkModeColors: data.darkModeColors || defaultSettings.darkModeColors,
      }
      
      console.log('Merged settings:', mergedSettings)
      setSettings(mergedSettings)
      console.log('Settings state updated')
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      // Fallback to default settings on error
      setSettings(defaultSettings)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const updateSetting = async (key: keyof SiteSettings, value: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ key, value }),
      })

      if (!response.ok) {
        throw new Error('Failed to update setting')
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: value
      }))
    } catch (err) {
      console.error('Error updating setting:', err)
      setError(err instanceof Error ? err.message : 'Failed to update setting')
    }
  }

  const refreshSettings = async () => {
    console.log('Refreshing settings...')
    try {
      await fetchSettings()
      console.log('Settings refreshed successfully')
    } catch (error) {
      console.error('Error refreshing settings:', error)
    }
  }

  useEffect(() => {
    console.log('SettingsProvider useEffect triggered')
    fetchSettings()
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Settings loading timeout - using default settings')
        setLoading(false)
      }
    }, 5000) // 5 second timeout
    
    return () => clearTimeout(timeout)
  }, [])

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      error,
      refreshSettings,
      updateSetting
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Helper hook for getting a specific setting
export function useSetting<K extends keyof SiteSettings>(key: K): SiteSettings[K] {
  const { settings } = useSettings()
  return settings[key]
}
