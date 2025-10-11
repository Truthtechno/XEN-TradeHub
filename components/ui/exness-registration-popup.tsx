'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VerificationForm } from '@/components/ui/verification-form'
import { AlertTriangle, CheckCircle, ExternalLink, Leaf, X } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useSettings } from '@/lib/settings-context'

interface ExnessRegistrationPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function ExnessRegistrationPopup({ isOpen, onClose }: ExnessRegistrationPopupProps) {
  const { isDarkMode } = useTheme()
  const { settings } = useSettings()
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new')
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const handleExnessRegistration = async () => {
    if (isRegistering) return // Prevent double-tap
    
    setIsRegistering(true)
    try {
      // Track analytics and create pending registration
      await fetch('/api/exness/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'exness_registration_clicked',
          accountType: activeTab,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      })

      // Create pending broker registration
      await fetch('/api/broker/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker: 'EXNESS',
          accountType: activeTab,
          timestamp: new Date().toISOString()
        })
      })
      
      // Open Exness registration in new tab using admin-configured URL
      window.open(settings.defaultBrokerLink, '_blank')
    } catch (error) {
      console.error('Analytics tracking failed:', error)
      // Still open the link even if analytics fails
      window.open(settings.defaultBrokerLink, '_blank')
    } finally {
      // Reset after a delay to prevent rapid clicking
      setTimeout(() => setIsRegistering(false), 2000)
    }
  }

  const handleProceedToVerification = async () => {
    try {
      // Track analytics
      await fetch('/api/exness/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verification_proceeded',
          accountType: activeTab,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      })

      // Show verification form
      setShowVerificationForm(true)
    } catch (error) {
      console.error('Verification process failed:', error)
      // Still show verification form even if analytics fails
      setShowVerificationForm(true)
    }
  }

  const handleVerificationClose = () => {
    setShowVerificationForm(false)
    onClose()
  }

  const newAccountSteps = [
    {
      number: 1,
      title: "Create a Brokerage Account with this link",
      action: (
        <Button 
          onClick={handleExnessRegistration}
          disabled={isRegistering}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {isRegistering ? 'Opening...' : 'Open Exness Registration'}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    {
      number: 2,
      title: "Create a trading account with leverage 1:2000 / 1:Unlimited"
    },
    {
      number: 3,
      title: "Verify & Fund your account with minimum $50"
    },
    {
      number: 4,
      title: "Download & install MT4/MT5 on your Mobile phone",
      subtitle: "(Install it if you haven't yet)"
    }
  ]

  const existingAccountSteps = [
    {
      number: 1,
      title: "Log in to your Exness account and click on Live Chat",
      action: (
        <a 
          href="https://exness.com/support" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Live Chat
        </a>
      )
    },
    {
      number: 2,
      title: 'Type and send "Change Partner" in the live chat',
      highlight: "Change Partner"
    },
    {
      number: 3,
      title: "You'll receive a link to a form. Fill it out as follows:",
      details: [
        'Reason for Partner Change: Write "Trading Signals"',
        `New Partner's Link: ${settings.defaultBrokerLink}`,
        'How You Found Your New Partner: Write "Telegram"'
      ]
    },
    {
      number: 4,
      title: "Submit the form. Process could take up to 3 days",
      highlight: "3 days"
    },
    {
      number: 5,
      title: "Wait for confirmation email from Exness"
    }
  ]

  const afterConfirmationSteps = [
    "Create a new MT5 account on your Exness dashboard",
    "Fund the new account or transfer funds from existing account",
    "Proceed to verification",
    "Message the telegram account provided after verification",
    "You'll be added to the FREE GROUP with daily trade signals"
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold text-gray-900">
            FREE VIP MEMBERSHIP
          </DialogTitle>
          <p className="text-center text-red-600 font-bold text-xs sm:text-sm mt-1">
            ONLY FOR TODAY!
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={activeTab === 'new' ? 'default' : 'outline'}
            onClick={() => setActiveTab('new')}
            className={`flex-1 text-xs sm:text-sm ${activeTab === 'new' ? 'bg-gray-800 text-white' : 'bg-white border-gray-300'}`}
          >
            New Account
          </Button>
          <Button
            variant={activeTab === 'existing' ? 'default' : 'outline'}
            onClick={() => setActiveTab('existing')}
            className={`flex-1 text-xs sm:text-sm ${activeTab === 'existing' ? 'bg-gray-800 text-white' : 'bg-white border-gray-300'}`}
          >
            Existing Account
          </Button>
        </div>

        {activeTab === 'new' ? (
          <div className="space-y-6">
            {/* Instructions Header */}
            <div className="flex items-center space-x-2 text-green-600 font-semibold text-sm sm:text-base">
              <span>Follow these steps</span>
              <div className="flex space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-3 h-3 sm:w-4 sm:h-4 bg-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">→</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {newAccountSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {step.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium text-sm sm:text-base">{step.title}</p>
                    {step.subtitle && (
                      <p className="text-gray-500 text-xs sm:text-sm mt-1">{step.subtitle}</p>
                    )}
                    {step.action}
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <Button 
              onClick={handleProceedToVerification}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-sm sm:text-lg font-semibold"
            >
              I've Completed Registration - Proceed to Verification
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 sm:p-4 flex items-start space-x-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-800 text-xs sm:text-sm">FOLLOW THIS PROCEDURE CAREFULLY</p>
                <p className="text-orange-700 text-xs sm:text-sm">For existing Exness account holders</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {existingAccountSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {step.title.split(step.highlight || '').map((part, i) => (
                        <span key={i}>
                          {part}
                          {step.highlight && i === 0 && (
                            <span className="bg-yellow-200 px-1 rounded text-xs sm:text-sm">{step.highlight}</span>
                          )}
                        </span>
                      ))}
                    </p>
                    {step.action && <div className="mt-2">{step.action}</div>}
                    {step.details && (
                      <div className="mt-3 space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="ml-2 sm:ml-4 text-xs sm:text-sm text-gray-700">
                            • {detail}
                          </div>
                        ))}
                      </div>
                    )}
                    {step.highlight === "3 days" && (
                      <span className="text-orange-600 font-semibold text-xs sm:text-sm"> {step.highlight}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* After Confirmation Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-3 text-sm sm:text-base">After confirmation:</h3>
                  <ul className="space-y-2">
                    {afterConfirmationSteps.map((step, index) => (
                      <li key={index} className="text-green-700 text-xs sm:text-sm flex items-start space-x-2">
                        <span className="text-green-600">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <Button 
              onClick={handleProceedToVerification}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-sm sm:text-lg font-semibold"
            >
              Proceed to Verification
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Verification Form */}
      <VerificationForm 
        isOpen={showVerificationForm}
        onClose={handleVerificationClose}
        accountType={activeTab}
      />
    </Dialog>
  )
}
