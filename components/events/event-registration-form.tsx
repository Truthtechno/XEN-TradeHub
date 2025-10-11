'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, DollarSign, MapPin, Users, X, CreditCard, CheckCircle } from 'lucide-react'
import EventMockPaymentForm from './event-mock-payment-form'

interface Event {
  id: string
  title: string
  description: string
  type: 'WORKSHOP' | 'WEBINAR' | 'SEMINAR' | 'CONFERENCE' | 'MASTERCLASS'
  startDate: string
  endDate: string | null
  location: string | null
  price: number | null
  currency: string
  maxAttendees: number | null
}

interface EventRegistrationFormProps {
  event: Event
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EventRegistrationForm({ event, isOpen, onClose, onSuccess }: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    dietaryRequirements: '',
    specialRequests: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null || price === 0) return 'FREE'
    return `$${price} ${currency}`
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'WORKSHOP': return 'xen-blue'
      case 'WEBINAR': return 'xen-green'
      case 'SEMINAR': return 'xen-purple'
      case 'CONFERENCE': return 'xen-orange'
      case 'MASTERCLASS': return 'xen-accent'
      default: return 'default'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          amountUSD: event.price || 0,
          currency: event.currency || 'USD',
          provider: event.price === 0 ? 'free' : 'stripe',
          providerRef: event.price === 0 ? 'free_registration' : undefined,
          ...formData
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setRegistrationData(result.registration)
        
        if (event.price === 0) {
          // Free event - show success immediately
          setStep('success')
        } else {
          // Paid event - proceed to payment
          if (result.paymentIntentId) {
            setPaymentIntentId(result.paymentIntentId)
            setStep('payment')
          } else {
            alert('Payment intent not created. Please try again.')
          }
        }
      } else {
        alert(`Registration failed: ${result.message}`)
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = () => {
    setStep('success')
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    alert(`Payment failed: ${error}`)
    setStep('form')
  }

  const handleClose = () => {
    setStep('form')
    setRegistrationData(null)
    setPaymentIntentId(null)
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      dietaryRequirements: '',
      specialRequests: '',
      emergencyContact: '',
      emergencyPhone: ''
    })
    onClose()
  }

  const handleSuccess = () => {
    onSuccess()
    handleClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {step === 'form' && 'Register for Event'}
            {step === 'payment' && 'Complete Payment'}
            {step === 'success' && 'Registration Successful!'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && 'Fill in your details to register for this event'}
            {step === 'payment' && 'Complete your payment to confirm your registration'}
            {step === 'success' && 'Your registration has been confirmed'}
          </DialogDescription>
        </DialogHeader>

        {step === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Registration Confirmed!</h3>
            <p className="text-gray-600 mb-4">
              You have successfully registered for "{event.title}". 
              {event.price === 0 ? ' You will receive a confirmation email shortly.' : ' Your payment has been processed and you will receive a confirmation email shortly.'}
            </p>
            <Button onClick={handleSuccess} className="bg-green-600 hover:bg-green-700">
              Close
            </Button>
          </div>
        ) : step === 'payment' ? (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Complete Your Payment</h3>
              <p className="text-gray-600">
                Complete your payment to confirm your registration for "{event.title}"
              </p>
            </div>
            
            <EventMockPaymentForm
              eventId={event.id}
              eventTitle={event.title}
              amount={event.price || 0}
              currency={event.currency || 'USD'}
              paymentIntentId={paymentIntentId || ''}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={() => setStep('form')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Details */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getEventTypeColor(event.type) as any}>
                  {event.type}
                </Badge>
                {event.price === 0 && (
                  <Badge variant="xen-green">Free</Badge>
                )}
              </div>
              
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatTime(event.startDate)}</span>
                  {event.endDate && (
                    <span> - {formatTime(event.endDate)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{event.location || 'Online'}</span>
                </div>
                {event.maxAttendees && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Max {event.maxAttendees} attendees</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">{formatPrice(event.price, event.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Enter your company"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="Enter your job title"
              />
            </div>

            <div>
              <Label htmlFor="dietaryRequirements">Dietary Requirements</Label>
              <Textarea
                id="dietaryRequirements"
                value={formData.dietaryRequirements}
                onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                placeholder="Any dietary restrictions or requirements"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Any special requests or accommodations needed"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-xen-orange hover:bg-xen-orange/90"
              >
                {isSubmitting ? 'Registering...' : 'Register Now'}
              </Button>
            </DialogFooter>
          </form>
        </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
