'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, CreditCard, Eye, EyeOff, Globe, Mail, MapPin, Phone, RefreshCw, Save, Settings, TestTube, ToggleLeft, ToggleRight, Zap } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettings } from '@/lib/settings-context'
import { FileUpload } from '@/components/ui/file-upload'
import { ThemePreview } from '@/components/theme-preview'
import { ThemeShowcase } from '@/components/theme-showcase'
import { Collapsible } from '@/components/ui/collapsible'
import { Tooltip } from '@/components/ui/tooltip'
import { validateColorContrast, themePresets } from '@/lib/theme-config'
import { 
  Palette, 
  Type, 
  Moon, 
  Sun, 
  Monitor, 
  Image, 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  RotateCcw,
  CheckCircle as CheckCircleIcon,
  AlertTriangle,
  Info,
  BarChart3
} from 'lucide-react'

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, factor: number): string {
  // Remove # if present
  hex = hex.replace('#', '')
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Adjust brightness
  const newR = Math.max(0, Math.min(255, Math.round(r + (255 - r) * factor)))
  const newG = Math.max(0, Math.min(255, Math.round(g + (255 - g) * factor)))
  const newB = Math.max(0, Math.min(255, Math.round(b + (255 - b) * factor)))
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

export default function SettingsPage() {
  const { settings, loading, error, refreshSettings, updateSetting } = useSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Update local settings when context settings change
  React.useEffect(() => {
    // Ensure lightModeColors and darkModeColors are properly initialized
    const settingsWithDefaults = {
      ...settings,
      lightModeColors: settings.lightModeColors || {
        primaryColor: '#1E40AF',
        secondaryColor: '#DC2626',
        accentColor: '#10B981',
        neutralColor: '#6B7280',
        successColor: '#10B981',
        warningColor: '#F59E0B',
        errorColor: '#EF4444',
        infoColor: '#3B82F6',
      },
      darkModeColors: settings.darkModeColors || {
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
    setLocalSettings(settingsWithDefaults)
  }, [settings])

  const handleInputChange = (key: keyof typeof settings, value: string | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }))
    
    // Immediately apply theme changes
    if (key === 'theme') {
      const newTheme = value as string
      localStorage.setItem('theme', newTheme)
      
      // Apply theme immediately to DOM
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
        // Set dark mode CSS variables immediately
        document.documentElement.style.setProperty('--color-bg', '#0F172A')
        document.documentElement.style.setProperty('--color-text', '#F8FAFC')
        document.documentElement.style.setProperty('--color-bg-secondary', '#1E293B')
        document.documentElement.style.setProperty('--color-text-secondary', '#CBD5E1')
      } else if (newTheme === 'light') {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
        // Set light mode CSS variables immediately
        document.documentElement.style.setProperty('--color-bg', '#FFFFFF')
        document.documentElement.style.setProperty('--color-text', '#0F172A')
        document.documentElement.style.setProperty('--color-bg-secondary', '#F8FAFC')
        document.documentElement.style.setProperty('--color-text-secondary', '#475569')
      } else if (newTheme === 'auto') {
        // Auto theme - follow system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
          document.body.classList.add('dark')
          document.documentElement.style.setProperty('--color-bg', '#0F172A')
          document.documentElement.style.setProperty('--color-text', '#F8FAFC')
          document.documentElement.style.setProperty('--color-bg-secondary', '#1E293B')
          document.documentElement.style.setProperty('--color-text-secondary', '#CBD5E1')
        } else {
          document.documentElement.classList.remove('dark')
          document.body.classList.remove('dark')
          document.documentElement.style.setProperty('--color-bg', '#FFFFFF')
          document.documentElement.style.setProperty('--color-text', '#0F172A')
          document.documentElement.style.setProperty('--color-bg-secondary', '#F8FAFC')
          document.documentElement.style.setProperty('--color-text-secondary', '#475569')
        }
      }
      
      // Simplified - let CSS handle text colors to prevent conflicts
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      console.log('Saving settings:', localSettings)
      console.log('Light mode colors:', localSettings.lightModeColors)
      console.log('Dark mode colors:', localSettings.darkModeColors)
      
      // Update all settings at once
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(localSettings),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${responseData.error || 'Unknown error'}`)
      }

      // Wait a moment before refreshing to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refresh settings from context
      console.log('Refreshing settings after save...')
      await refreshSettings()
      
      // Show success message
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
      console.log('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      console.error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestoreDefaults = () => {
    setLocalSettings({
      ...localSettings,
      primaryColor: '#1E40AF',
      secondaryColor: '#DC2626',
      accentColor: '#10B981',
      neutralColor: '#6B7280',
      successColor: '#10B981',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',
      infoColor: '#3B82F6',
      headingFont: 'Poppins',
      bodyFont: 'Inter',
      monoFont: 'JetBrains Mono',
      useGradientAccent: false,
      cardElevation: 'medium',
      lightModeColors: {
        primaryColor: '#1E40AF',
        secondaryColor: '#DC2626',
        accentColor: '#10B981',
        neutralColor: '#6B7280',
        successColor: '#10B981',
        warningColor: '#F59E0B',
        errorColor: '#EF4444',
        infoColor: '#3B82F6',
      },
      darkModeColors: {
        primaryColor: '#3B82F6',
        secondaryColor: '#F87171',
        accentColor: '#34D399',
        neutralColor: '#9CA3AF',
        successColor: '#34D399',
        warningColor: '#FBBF24',
        errorColor: '#F87171',
        infoColor: '#60A5FA',
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-theme mb-2">Error Loading Settings</h3>
          <p className="text-theme-secondary mb-4">{error}</p>
          <Button onClick={refreshSettings} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-theme tracking-tight">Settings</h1>
          <p className="text-theme-secondary text-base sm:text-lg max-w-2xl">Manage your platform configuration and appearance</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {saveStatus === 'success' && (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Settings saved!
            </Badge>
          )}
          {saveStatus === 'error' && (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Save failed
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6 sm:space-y-8">
        <TabsList className="grid w-full grid-cols-1 lg:grid-cols-3 gap-1 lg:gap-0 h-auto lg:h-10">
          <TabsTrigger value="general" className="text-sm lg:text-base py-3 lg:py-2">General</TabsTrigger>
          <TabsTrigger value="appearance" className="text-sm lg:text-base py-3 lg:py-2">Appearance</TabsTrigger>
          <TabsTrigger value="payment" className="text-sm lg:text-base py-3 lg:py-2">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 sm:space-y-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Site Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Site Information
                </CardTitle>
                <CardDescription>
                  Basic information about your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site Name
                    </label>
                    <Input
                      value={localSettings.siteName}
                      onChange={(e) => handleInputChange('siteName', e.target.value)}
                      placeholder="CoreFX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site URL
                    </label>
                    <Input
                      value={localSettings.siteUrl}
                      onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                      placeholder="https://corefx.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={localSettings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Professional Trading Education Platform"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Support and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Support Email
                    </label>
                    <Input
                      value={localSettings.supportEmail}
                      onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                      placeholder="support@corefx.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Support Phone
                    </label>
                    <Input
                      value={localSettings.supportPhone}
                      onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                      placeholder="+1-555-0123"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Support Address
                  </label>
                  <Input
                    value={localSettings.supportAddress}
                    onChange={(e) => handleInputChange('supportAddress', e.target.value)}
                    placeholder="123 Trading Street, Financial District, NY 10001"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Platform Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform Settings
                </CardTitle>
                <CardDescription>
                  General platform configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={localSettings.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={localSettings.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Broker Link
                  </label>
                  <Input
                    value={localSettings.defaultBrokerLink}
                    onChange={(e) => handleInputChange('defaultBrokerLink', e.target.value)}
                    placeholder="https://exness.com/register"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Brand Assets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Brand Assets
                </CardTitle>
                <CardDescription>
                  Upload your logo and favicon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo
                    </label>
                    <FileUpload
                      value={localSettings.logoUrl}
                      onChange={(value) => handleInputChange('logoUrl', value)}
                      accept="image/*"
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Favicon
                    </label>
                    <FileUpload
                      value={localSettings.faviconUrl}
                      onChange={(value) => handleInputChange('faviconUrl', value)}
                      accept="image/*"
                      maxSize={1 * 1024 * 1024} // 1MB
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-0">
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6 sm:space-y-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Stripe Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Stripe Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Stripe payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Publishable Key
                    </label>
                    <div className="relative">
                      <Input
                        type={showSecrets ? "text" : "password"}
                        value={localSettings.stripePublishableKey}
                        onChange={(e) => handleInputChange('stripePublishableKey', e.target.value)}
                        placeholder="pk_test_..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Secret Key
                    </label>
                    <div className="relative">
                      <Input
                        type={showSecrets ? "text" : "password"}
                        value={localSettings.stripeSecretKey}
                        onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)}
                        placeholder="sk_test_..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Webhook Secret
                  </label>
                  <div className="relative">
                    <Input
                      type={showSecrets ? "text" : "password"}
                      value={localSettings.stripeWebhookSecret}
                      onChange={(e) => handleInputChange('stripeWebhookSecret', e.target.value)}
                      placeholder="whsec_..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Payment Testing
                </CardTitle>
                <CardDescription>
                  Configure payment testing options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use Mock Payment
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable mock payment processing for testing
                    </p>
                  </div>
                  <button
                    onClick={() => handleInputChange('useMockPayment', !localSettings.useMockPayment)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.useMockPayment ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.useMockPayment ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {localSettings.useMockPayment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mock Payment Success Rate (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={localSettings.mockPaymentSuccessRate}
                      onChange={(e) => handleInputChange('mockPaymentSuccessRate', (parseInt(e.target.value) || 0).toString())}
                      placeholder="95"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-0">
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>


        <TabsContent value="appearance" className="space-y-6 sm:space-y-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Theme Mode Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Theme Mode
                </CardTitle>
                <CardDescription>
                  Choose between light mode, dark mode, or automatic system preference
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleInputChange('theme', 'light')}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 font-medium ${
                      localSettings.theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Sun className="h-5 w-5" />
                    <span>Light Mode</span>
                  </button>
                  <button
                    onClick={() => handleInputChange('theme', 'dark')}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 font-medium ${
                      localSettings.theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Moon className="h-5 w-5" />
                    <span>Dark Mode</span>
                  </button>
                  <button
                    onClick={() => handleInputChange('theme', 'auto')}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 font-medium ${
                      localSettings.theme === 'auto'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Monitor className="h-5 w-5" />
                    <span>Auto</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Theme Presets */}
            <Collapsible
              title="Theme Presets"
              description="Quickly apply professional theme presets"
              icon={<Palette className="w-5 h-5" />}
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {themePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      if (preset.config.colors) {
                        const colors = preset.config.colors
                        
                        // Use preset-specific colors if available, otherwise fallback to generated colors
                        const lightModeColors = preset.config.lightModeColors || {
                          primaryColor: colors.primary,
                          secondaryColor: colors.secondary,
                          accentColor: colors.accent,
                          neutralColor: colors.neutral,
                          successColor: colors.success,
                          warningColor: colors.warning,
                          errorColor: colors.error,
                          infoColor: colors.info,
                        }
                        
                        const darkModeColors = preset.config.darkModeColors || {
                          primaryColor: adjustColorBrightness(colors.primary, 0.3),
                          secondaryColor: adjustColorBrightness(colors.secondary, 0.3),
                          accentColor: adjustColorBrightness(colors.accent, 0.3),
                          neutralColor: adjustColorBrightness(colors.neutral, 0.3),
                          successColor: adjustColorBrightness(colors.success, 0.3),
                          warningColor: adjustColorBrightness(colors.warning, 0.3),
                          errorColor: adjustColorBrightness(colors.error, 0.3),
                          infoColor: adjustColorBrightness(colors.info, 0.3),
                        }
                        
                        setLocalSettings({
                          ...localSettings,
                          ...lightModeColors,
                          lightModeColors,
                          darkModeColors,
                          ...preset.config.typography,
                          theme: preset.config.mode || 'light',
                          useGradientAccent: preset.config.useGradientAccent || false,
                          cardElevation: preset.config.cardElevation || 'medium',
                        })
                      }
                    }}
                    className="group p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 text-left bg-white dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.config.colors?.primary || '#1E40AF' }} />
                      <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.config.colors?.secondary || '#DC2626' }} />
                      <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.config.colors?.accent || '#10B981' }} />
                    </div>
                    <h4 className="font-semibold text-theme text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{preset.name}</h4>
                    <p className="text-sm text-theme-secondary leading-relaxed">{preset.description}</p>
                  </button>
                ))}
              </div>
            </Collapsible>

            {/* Theme Colors */}
            <Collapsible
              title="Theme Colors"
              description="Customize your site's color palette for light and dark modes with contrast validation"
              icon={<Palette className="w-5 h-5" />}
              defaultOpen={true}
            >
              <div className="space-y-6">
                {/* Mode Toggle */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Light Mode Colors</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode Colors</span>
                  </div>
                </div>

                {/* Light Mode Colors */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    Light Mode Colors
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { key: 'primaryColor', label: 'Primary', description: 'Main brand color' },
                      { key: 'secondaryColor', label: 'Secondary', description: 'Secondary actions' },
                      { key: 'accentColor', label: 'Accent', description: 'Success states' },
                      { key: 'neutralColor', label: 'Neutral', description: 'Text elements' },
                      { key: 'successColor', label: 'Success', description: 'Success messages' },
                      { key: 'warningColor', label: 'Warning', description: 'Warning messages' },
                      { key: 'errorColor', label: 'Error', description: 'Error messages' },
                      { key: 'infoColor', label: 'Info', description: 'Info messages' },
                    ].map(({ key, label, description }) => {
                      const lightValue = localSettings.lightModeColors?.[key as keyof typeof localSettings.lightModeColors] || localSettings[key as keyof typeof localSettings] as string || '#000000'
                      const contrastResult = validateColorContrast('#FFFFFF', lightValue)
                      
                      return (
                        <div key={`light-${key}`} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {label}
                            </label>
                            <Tooltip content={description}>
                              <Info className="w-3 h-3 text-gray-400" />
                            </Tooltip>
                            <div className="flex items-center gap-1">
                              {contrastResult.passed ? (
                                <CheckCircleIcon className="w-3 h-3 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              )}
                              <span className={`text-xs ${contrastResult.passed ? 'text-green-600' : 'text-yellow-600'}`}>
                                {contrastResult.level}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={lightValue}
                              onChange={(e) => {
                                const newLightColors = { ...localSettings.lightModeColors, [key]: e.target.value }
                                setLocalSettings(prev => ({ ...prev, lightModeColors: newLightColors }))
                              }}
                              className="w-10 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={lightValue}
                              onChange={(e) => {
                                const newLightColors = { ...localSettings.lightModeColors, [key]: e.target.value }
                                setLocalSettings(prev => ({ ...prev, lightModeColors: newLightColors }))
                              }}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Dark Mode Colors */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Moon className="h-5 w-5 text-blue-500" />
                    Dark Mode Colors
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { key: 'primaryColor', label: 'Primary', description: 'Main brand color' },
                      { key: 'secondaryColor', label: 'Secondary', description: 'Secondary actions' },
                      { key: 'accentColor', label: 'Accent', description: 'Success states' },
                      { key: 'neutralColor', label: 'Neutral', description: 'Text elements' },
                      { key: 'successColor', label: 'Success', description: 'Success messages' },
                      { key: 'warningColor', label: 'Warning', description: 'Warning messages' },
                      { key: 'errorColor', label: 'Error', description: 'Error messages' },
                      { key: 'infoColor', label: 'Info', description: 'Info messages' },
                    ].map(({ key, label, description }) => {
                      const darkValue = localSettings.darkModeColors?.[key as keyof typeof localSettings.darkModeColors] || localSettings[key as keyof typeof localSettings] as string || '#000000'
                      const contrastResult = validateColorContrast('#1F2937', darkValue)
                      
                      return (
                        <div key={`dark-${key}`} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {label}
                            </label>
                            <Tooltip content={description}>
                              <Info className="w-3 h-3 text-gray-400" />
                            </Tooltip>
                            <div className="flex items-center gap-1">
                              {contrastResult.passed ? (
                                <CheckCircleIcon className="w-3 h-3 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              )}
                              <span className={`text-xs ${contrastResult.passed ? 'text-green-600' : 'text-yellow-600'}`}>
                                {contrastResult.level}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={darkValue}
                              onChange={(e) => {
                                const newDarkColors = { ...localSettings.darkModeColors, [key]: e.target.value }
                                setLocalSettings(prev => ({ ...prev, darkModeColors: newDarkColors }))
                              }}
                              className="w-10 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={darkValue}
                              onChange={(e) => {
                                const newDarkColors = { ...localSettings.darkModeColors, [key]: e.target.value }
                                setLocalSettings(prev => ({ ...prev, darkModeColors: newDarkColors }))
                              }}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Color Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Color Preview</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Light Mode Preview */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white">
                      <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        Light Mode
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'primaryColor', label: 'Primary' },
                          { key: 'secondaryColor', label: 'Secondary' },
                          { key: 'accentColor', label: 'Accent' },
                          { key: 'successColor', label: 'Success' },
                          { key: 'warningColor', label: 'Warning' },
                          { key: 'errorColor', label: 'Error' },
                        ].map(({ key, label }) => {
                          const color = localSettings.lightModeColors?.[key as keyof typeof localSettings.lightModeColors] || localSettings[key as keyof typeof localSettings] as string || '#000000'
                          return (
                            <div
                              key={`light-preview-${key}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-medium"
                              style={{ backgroundColor: color }}
                            >
                              {label}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Dark Mode Preview */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-800">
                      <h5 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <Moon className="h-4 w-4 text-blue-400" />
                        Dark Mode
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'primaryColor', label: 'Primary' },
                          { key: 'secondaryColor', label: 'Secondary' },
                          { key: 'accentColor', label: 'Accent' },
                          { key: 'successColor', label: 'Success' },
                          { key: 'warningColor', label: 'Warning' },
                          { key: 'errorColor', label: 'Error' },
                        ].map(({ key, label }) => {
                          const color = localSettings.darkModeColors?.[key as keyof typeof localSettings.darkModeColors] || localSettings[key as keyof typeof localSettings] as string || '#000000'
                          return (
                            <div
                              key={`dark-preview-${key}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-medium"
                              style={{ backgroundColor: color }}
                            >
                              {label}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Collapsible>

            {/* Typography */}
            <Collapsible
              title="Typography"
              description="Choose fonts for headings, body text, and code"
              icon={<Type className="w-5 h-5" />}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                    <label className="block text-sm font-medium text-theme mb-2">
                      Heading Font
                </label>
                    <select
                      value={localSettings.headingFont}
                      onChange={(e) => handleInputChange('headingFont', e.target.value)}
                      className="w-full px-3 py-2 border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary input-professional"
                    >
                      <option value="Poppins">Poppins</option>
                      <option value="Inter">Inter</option>
                      <option value="DM Sans">DM Sans</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Work Sans">Work Sans</option>
                    </select>
              </div>

                <div>
                    <label className="block text-sm font-medium text-theme mb-2">
                      Body Font
                  </label>
                    <select
                      value={localSettings.bodyFont}
                      onChange={(e) => handleInputChange('bodyFont', e.target.value)}
                      className="w-full px-3 py-2 border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary input-professional"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="DM Sans">DM Sans</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Work Sans">Work Sans</option>
                    </select>
                  </div>

                <div>
                    <label className="block text-sm font-medium text-theme mb-2">
                      Monospace Font
                  </label>
                  <select
                      value={localSettings.monoFont}
                      onChange={(e) => handleInputChange('monoFont', e.target.value)}
                      className="w-full px-3 py-2 border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary input-professional"
                    >
                      <option value="JetBrains Mono">JetBrains Mono</option>
                      <option value="Fira Code">Fira Code</option>
                      <option value="Source Code Pro">Source Code Pro</option>
                      <option value="Monaco">Monaco</option>
                      <option value="Consolas">Consolas</option>
                      <option value="Courier New">Courier New</option>
                  </select>
                  </div>
                </div>

                {/* Typography Preview */}
                <div className="border border-theme rounded-lg p-4 bg-theme-secondary">
                  <h4 className="text-sm font-medium text-theme mb-3">Typography Preview</h4>
                  <div className="space-y-3">
                    <h1 className="text-2xl font-bold" style={{ fontFamily: localSettings.headingFont }}>
                      Heading 1 - {localSettings.headingFont}
                    </h1>
                    <h2 className="text-xl font-semibold" style={{ fontFamily: localSettings.headingFont }}>
                      Heading 2 - {localSettings.headingFont}
                    </h2>
                    <p className="text-base" style={{ fontFamily: localSettings.bodyFont }}>
                      Body text - {localSettings.bodyFont}. This is how your content will look with the selected font.
                    </p>
                    <p className="text-sm text-theme-secondary" style={{ fontFamily: localSettings.bodyFont }}>
                      Small text - {localSettings.bodyFont}. Used for captions and secondary information.
                    </p>
                    <code className="text-sm bg-theme-tertiary px-2 py-1 rounded" style={{ fontFamily: localSettings.monoFont }}>
                      Code text - {localSettings.monoFont}
                    </code>
                  </div>
                </div>
              </div>
            </Collapsible>

            {/* Mode & Preview */}
            <Collapsible
              title="Mode & Preview"
              description="Choose theme mode and preview your changes"
              icon={<Moon className="w-5 h-5" />}
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-theme mb-3">Theme Mode</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleInputChange('theme', 'light')}
                      className={`px-6 py-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-3 font-medium ${
                        localSettings.theme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </button>
                    <button
                      onClick={() => handleInputChange('theme', 'dark')}
                      className={`px-6 py-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-3 font-medium ${
                        localSettings.theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </button>
                    <button
                      onClick={() => handleInputChange('theme', 'auto')}
                      className={`px-6 py-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-3 font-medium ${
                        localSettings.theme === 'auto'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <Monitor className="w-5 h-5" />
                      <span>Auto</span>
                    </button>
                        </div>
                      </div>
                      
                      <div>
                  <h4 className="text-sm font-medium text-theme mb-3">Live Preview</h4>
                  <div className="border border-theme rounded-lg p-6 bg-theme-secondary">
                    <ThemePreview theme={localSettings} isDark={localSettings.theme === 'dark'} />
                  </div>
                </div>
              </div>
            </Collapsible>

            {/* Theme Showcase */}
            <Collapsible
              title="Theme Showcase"
              description="Comprehensive preview of your theme across all components"
              icon={<BarChart3 className="w-5 h-5" />}
            >
              <ThemeShowcase theme={localSettings} isDark={localSettings.theme === 'dark'} />
            </Collapsible>

            {/* Theme Actions */}
            <Collapsible
              title="Theme Actions"
              description="Save, restore, or export your theme settings"
              icon={<SettingsIcon className="w-5 h-5" />}
            >
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="button-professional"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Theme
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleRestoreDefaults}
                  variant="outline"
                  className="border-theme hover:border-theme-primary"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore Defaults
                </Button>

                <Button
                  onClick={() => {
                    const cssVars = Object.entries(localSettings)
                      .filter(([key]) => key.includes('Color') || key.includes('Font'))
                      .map(([key, value]) => `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
                      .join('\n')
                    navigator.clipboard.writeText(cssVars)
                  }}
                  variant="outline"
                  className="border-theme hover:border-theme-primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Copy CSS Variables
                </Button>
              </div>
            </Collapsible>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
