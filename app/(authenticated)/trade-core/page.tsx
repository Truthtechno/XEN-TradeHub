'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ExnessRegistrationPopup } from '@/components/ui/exness-registration-popup'
import { useSettings } from '@/lib/settings-context'
import { Calendar, CheckCircle, Circle, Gift, Hand, Headphones, Plus, Shield, Star, TrendingUp, Trophy, Users, AlertCircle, Loader2, X } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import { z } from 'zod'

const features = [
  {
    icon: Shield,
    title: 'Lifetime Access to VIP Signal Group',
    description: 'Normally $50/month — you save $600+ yearly',
    color: 'text-theme-success'
  },
  {
    icon: Users,
    title: 'Private Telegram Group',
    description: 'Verified Exness traders — tighter community, faster updates',
    color: 'text-theme-primary'
  },
  {
    icon: Trophy,
    title: 'Priority Trading Competitions',
    description: 'Win real money and funded accounts',
    color: 'text-theme-warning'
  },
  {
    icon: TrendingUp,
    title: 'Early Access to Tools',
    description: 'Future bots, EAs, and strategy tools by {siteName}',
    color: 'text-theme-accent'
  },
  {
    icon: Headphones,
    title: 'Customer Support Line',
    description: 'Fast verification — get onboarded in less than 24hrs',
    color: 'text-theme-info'
  },
  {
    icon: Calendar,
    title: 'Monthly Live Recaps',
    description: 'Exness-only traders performance analysis sessions',
    color: 'text-theme-secondary'
  }
]

const benefits = [
  {
    icon: Gift,
    title: 'Zero Cost to Join',
    description: 'Just deposit your trading funds — you keep 100% of your money',
    color: 'text-theme-success'
  },
  {
    icon: Circle,
    title: 'Stay 100% Liquid',
    description: 'Premium access while staying risk-free from {siteName}\'s side',
    color: 'text-theme-success'
  },
  {
    icon: Star,
    title: 'Premium Experience',
    description: 'Full {siteName} ecosystem access without paying upfront',
    color: 'text-theme-success'
  }
]

// Validation schema for verification form
const verificationSchema = z.object({
  email: z.string().email('Valid email is required'),
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().min(5, 'Phone number is required'),
  exnessAccountId: z.string().min(1, 'Exness Account ID is required'),
  accountType: z.enum(['new', 'existing'])
})

interface VerificationFormData {
  email: string
  fullName: string
  phoneNumber: string
  exnessAccountId: string
  accountType: 'new' | 'existing'
}

export default function TradeCoreFXPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const { settings } = useSettings()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isVerificationOpen, setIsVerificationOpen] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  
  // Verification form state
  const [formData, setFormData] = useState<VerificationFormData>({
    email: '',
    fullName: '',
    phoneNumber: '',
    exnessAccountId: '',
    accountType: 'existing'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [user, setUser] = useState<any>(null)

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,
            email: data.user?.email || '',
            fullName: data.user?.name || ''
          }))
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  const handleInputChange = (field: keyof VerificationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    try {
      verificationSchema.parse(formData)
      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message
          }
        })
        setFormErrors(errors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission started')
    console.log('Form data:', formData)
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    console.log('Form validation passed')
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const requestData = {
        broker: 'EXNESS',
        accountType: formData.accountType,
        verificationData: {
          email: formData.email,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          exnessAccountId: formData.exnessAccountId
        }
      }
      
      console.log('Sending request:', requestData)
      
      // Submit verification directly (like enquiry system - no auth required)
      const response = await fetch('/api/broker/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const error = await response.json()
        console.error('API error:', error)
        setSubmitError(`Verification failed: ${error.error || 'Unknown error'}`)
        return
      }

      const result = await response.json()
      console.log('API result:', result)

      if (result.success) {
        console.log('Verification successful')
        // Success
        setIsSuccess(true)
        setIsVerificationOpen(false)
        
        // Reset form
        setFormData({
          email: user?.email || '',
          fullName: user?.name || '',
          phoneNumber: '',
          exnessAccountId: '',
          accountType: 'existing'
        })
      } else {
        console.error('Verification failed:', result.error)
        setSubmitError(result.error || 'Verification failed. Please try again.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      })
      setSubmitError(`Network error: ${errorMessage}. Please check your connection and try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-lg bg-blue-500 flex-shrink-0">
            <Hand className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme tracking-tight">
              Trade With {settings.siteName} via <span className="text-blue-600 dark:text-blue-400">EXNESS</span>
            </h1>
            <p className="text-theme-secondary text-sm sm:text-base lg:text-lg mt-2 max-w-2xl">
              Open a real Exness account with {settings.siteName}'s referral link and get lifetime access to free signals.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Main Offer Card */}
          <Card className="bg-white dark:bg-gray-800/50 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Trade with {settings.siteName} — Free (Lifetime Access)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Who this is for:</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Traders who want to join the {settings.siteName} ecosystem without paying a dime upfront, but still get access to the full signal experience — just by funding their own live trading account.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">What You Get:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {features.map((feature, index) => {
                    const description = feature.description.replace('{siteName}', settings.siteName)
                    const Icon = feature.icon
                    return (
                      <Card key={index} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg flex-shrink-0">
                              <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why This Investment Changes Everything */}
          <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Why This Investment Changes Everything</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Skip Years of Trial & Error</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Get direct access to proven strategies that work.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Personalized to YOUR Trading</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Not generic advice — custom solutions for your style.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Lifetime Value</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Skills and access that pay for themselves many times over.</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Call to Action */}
          <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-4">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">FREE</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Lifetime Access</div>
                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-4">Don't have an account?</p>
                <Button 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 text-sm sm:text-base py-3"
                  onClick={() => {
                    if (!isRegistering) {
                      setIsRegistering(true)
                      setIsPopupOpen(true)
                      setTimeout(() => setIsRegistering(false), 2000)
                    }
                  }}
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Opening...' : 'REGISTER ON EXNESS'}
                </Button>
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Start with {settings.siteName}'s referral link</p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-4">Already have an account with {settings.siteName}'s link?</p>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm sm:text-base py-3"
                  onClick={() => setIsVerificationOpen(true)}
                >
                  SUBMIT EMAIL FOR VERIFICATION
                </Button>
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Get instant access to signals</p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Perks */}
          <Card className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Additional Perks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                const description = benefit.description.replace('{siteName}', settings.siteName)
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                      <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{benefit.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Exness Registration Popup */}
      <ExnessRegistrationPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />

      {/* Verification Modal */}
      {isVerificationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Complete Your Verification
                </h2>
                <button
                  onClick={() => setIsVerificationOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Existing Account Verification
              </p>

              {submitError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                    <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`mt-1 ${formErrors.email ? 'border-red-500' : ''}`}
                    placeholder="your@email.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`mt-1 ${formErrors.fullName ? 'border-red-500' : ''}`}
                    placeholder="John Doe"
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`mt-1 ${formErrors.phoneNumber ? 'border-red-500' : ''}`}
                    placeholder="+1234567890"
                  />
                  {formErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="exnessAccountId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Exness Account ID *
                  </Label>
                  <Input
                    id="exnessAccountId"
                    type="text"
                    value={formData.exnessAccountId}
                    onChange={(e) => handleInputChange('exnessAccountId', e.target.value)}
                    className={`mt-1 ${formErrors.exnessAccountId ? 'border-red-500' : ''}`}
                    placeholder="Your Exness Account ID"
                  />
                  {formErrors.exnessAccountId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.exnessAccountId}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsVerificationOpen(false)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Verification'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Verification Submitted!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your verification request has been submitted successfully and will appear in the admin panel shortly. You will receive an email confirmation shortly.
              </p>
              <div className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p className="font-semibold">Next Steps:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Check your email for verification instructions</li>
                  <li>• Complete your Exness account setup if you haven't already</li>
                  <li>• Join our Telegram group using the link provided in the email</li>
                  <li>• Start receiving daily trading signals</li>
                </ul>
              </div>
              <Button
                onClick={() => setIsSuccess(false)}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
