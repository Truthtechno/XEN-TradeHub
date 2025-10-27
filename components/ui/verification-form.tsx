'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, X, Loader2 } from 'lucide-react'

interface VerificationFormProps {
  isOpen: boolean
  onClose: () => void
  accountType: 'new' | 'existing'
}

export function VerificationForm({ isOpen, onClose, accountType }: VerificationFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    exnessAccountId: '',
    fullName: '',
    phoneNumber: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting || hasSubmitted) return // Prevent double submission
    
    setIsSubmitting(true)
    setError('')

    try {
      console.log('Form data being submitted:', formData);
      console.log('Account type:', accountType);

      // Check if user is logged in by looking for auth token in cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const authToken = getCookie('auth-token');
      console.log('Auth token found:', authToken ? 'Yes' : 'No');

      if (!authToken) {
        setError('You must be logged in to submit verification. Please refresh the page and try again.');
        return;
      }

      console.log('User authenticated via auth token');

      const response = await fetch('/api/exness/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth-token=${authToken}`
        },
        credentials: 'include', // This ensures cookies are sent
        body: JSON.stringify({
          ...formData,
          accountType
        })
      })

      const result = await response.json()
      console.log('Exness verification result:', result);

      if (!response.ok) {
        console.error('Exness API error:', response.status, result);
        setError(`Exness verification failed: ${result.error || 'Unknown error'}`)
        return
      }

      if (result.success) {
        // Update broker registration status to verified
        const brokerResponse = await fetch('/api/broker/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `auth-token=${authToken}`
          },
          credentials: 'include', // This ensures cookies are sent
          body: JSON.stringify({
            broker: 'EXNESS',
            accountType,
            verificationData: formData
          })
        })

        console.log('Broker verification response status:', brokerResponse.status);

        if (!brokerResponse.ok) {
          const brokerError = await brokerResponse.json()
          console.error('Broker verification failed:', brokerError)
          setError(`Failed to update verification status: ${brokerError.error || 'Unknown error'}. Please try again.`)
          return
        }

        const brokerResult = await brokerResponse.json();
        console.log('Broker verification result:', brokerResult);

        setHasSubmitted(true)
        setIsSuccess(true)
        
        console.log('✅ Verification submitted successfully!');
        console.log('✅ Data will appear in admin panel shortly');
        
        // Track successful verification
        try {
          await fetch('/api/exness/analytics', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Cookie': `auth-token=${authToken}`
            },
            credentials: 'include', // This ensures cookies are sent
            body: JSON.stringify({
              action: 'verification_submitted',
              accountType,
              timestamp: new Date().toISOString()
            })
          })
        } catch (analyticsError) {
          console.warn('Analytics tracking failed:', analyticsError);
          // Don't fail the whole process for analytics
        }
      } else {
        setError(result.error || 'Verification failed. Please try again.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      email: '',
      exnessAccountId: '',
      fullName: '',
      phoneNumber: ''
    })
    setIsSuccess(false)
    setError('')
    setHasSubmitted(false)
    onClose()
  }

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600 dark:text-green-400">Verification Submitted!</DialogTitle>
          </DialogHeader>
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">Thank You!</h3>
              <p className="text-green-700 dark:text-green-400 text-sm mb-4">
                Your verification request has been submitted successfully and will appear in the admin panel shortly. You will receive an email confirmation shortly.
              </p>
              <div className="text-left text-sm text-green-700 dark:text-green-400 space-y-2">
                <p className="font-semibold">Next Steps:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Check your email for verification instructions</li>
                  <li>• Complete your Exness account setup if you haven't already</li>
                  <li>• Join our Telegram group using the link provided in the email</li>
                  <li>• Start receiving daily trading signals</li>
                </ul>
              </div>
              <Button 
                onClick={handleClose}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-gray-900 dark:text-white">
            Complete Your Verification
          </DialogTitle>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {accountType === 'new' ? 'New Account' : 'Existing Account'} Verification
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1234567890"
              className="w-full"
            />
          </div>

          {accountType === 'existing' && (
            <div>
              <label htmlFor="exnessAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exness Account ID
              </label>
              <Input
                id="exnessAccountId"
                name="exnessAccountId"
                type="text"
                value={formData.exnessAccountId}
                onChange={handleInputChange}
                placeholder="Your Exness Account ID"
                className="w-full"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-xen-red hover:bg-xen-red/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Verification'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
