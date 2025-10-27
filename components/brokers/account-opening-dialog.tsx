'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Step {
  text: string
  buttonText?: string
  buttonLink?: string
  note?: string
  bullets?: string[]
}

interface Broker {
  id: string
  name: string
  referralLink: string
  newAccountSteps: Step[] | null
  existingAccountSteps: Step[] | null
}

interface AccountOpeningDialogProps {
  broker: Broker | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail: string
  userName: string
}

export function AccountOpeningDialog({ 
  broker, 
  open, 
  onOpenChange,
  userEmail,
  userName 
}: AccountOpeningDialogProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new')
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: userName || '',
    email: userEmail || '',
    phone: '',
    accountId: ''
  })

  if (!broker) return null

  const handleProceedToVerification = () => {
    setShowVerificationForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.accountId.trim()) {
      toast.error('Please enter your Account ID')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/brokers/open-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brokerId: broker.id,
          ...formData
        })
      })

      if (response.ok) {
        toast.success('Your verification request has been submitted. Our team will review it shortly.')
        setFormData({
          fullName: userName || '',
          email: userEmail || '',
          phone: '',
          accountId: ''
        })
        setShowVerificationForm(false)
        onOpenChange(false)
      } else {
        throw new Error('Failed to submit request')
      }
    } catch (error) {
      toast.error('Failed to submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderSteps = (steps: Step[] | null) => {
    if (!steps || steps.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No steps configured for this broker yet.</p>
          <p className="text-sm mt-2">Please contact support for assistance.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100">Follow these steps</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Complete all steps below, then proceed to verification
              </p>
            </div>
          </div>
        </div>

        {steps.map((step, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-theme-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 pt-1">
              <p className="font-medium">{step.text}</p>
              {step.note && (
                <p className="text-sm text-muted-foreground mt-1">{step.note}</p>
              )}
              {step.bullets && step.bullets.length > 0 && (
                <ul className="mt-2 space-y-1 ml-4">
                  {step.bullets.map((bullet, bIndex) => (
                    <li key={bIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
              {step.buttonText && step.buttonLink && (
                <Button
                  className="mt-3 bg-theme-primary hover:bg-theme-primary-700 text-white"
                  onClick={() => window.open(step.buttonLink, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {step.buttonText}
                </Button>
              )}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <Button 
            className="w-full bg-theme-primary hover:bg-theme-primary-700 text-white" 
            size="lg"
            onClick={handleProceedToVerification}
          >
            I've Completed Registration - Proceed to Verification
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Open Account with {broker.name}</DialogTitle>
          <DialogDescription>
            {showVerificationForm 
              ? "Fill in your details below. We'll guide you through the account opening process."
              : "Choose whether you're creating a new account or have an existing one"
            }
          </DialogDescription>
        </DialogHeader>

        {!showVerificationForm ? (
          <div className="space-y-4">
           {/* <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-900 dark:text-red-100">FREE VIP MEMBERSHIP</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">ONLY FOR TODAY!</p>
                </div>
              </div>
            </div> */}

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'new' | 'existing')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new">New Account</TabsTrigger>
                <TabsTrigger value="existing">Existing Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="new" className="mt-6">
                {renderSteps(broker.newAccountSteps)}
              </TabsContent>
              
              <TabsContent value="existing" className="mt-6">
                <div className="mb-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100">FOLLOW THIS PROCEDURE CAREFULLY</h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        For existing {broker.name} account holders
                      </p>
                    </div>
                  </div>
                </div>
                {renderSteps(broker.existingAccountSteps)}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID *</Label>
              <Input
                id="accountId"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                placeholder="Enter your broker account ID"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the account ID you received after creating your {broker.name} account
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowVerificationForm(false)}
                disabled={submitting}
                className="flex-1"
              >
                Back to Steps
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Submitting...' : 'Submit & Verify'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
