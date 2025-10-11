'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, Clock, FileText, HelpCircle, HelpCircle as QuestionMark, Mail, MessageCircle, Phone } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import { useSettings } from '@/lib/settings-context'

const enquiryTypes = [
  {
    id: 1,
    title: 'General Enquiries',
    description: 'Questions about our services, courses, or trading signals.',
    icon: QuestionMark,
    responseTime: '24h response',
    supportType: 'Email support',
    features: [
      'Course information',
      'Service details',
      'Trading signal questions',
      'Account support'
    ]
  },
  {
    id: 2,
    title: 'Technical Support',
    description: 'Platform issues, account problems, or technical difficulties.',
    icon: Phone,
    responseTime: 'Priority support',
    supportType: 'Direct assistance',
    features: [
      'Platform troubleshooting',
      'Account access issues',
      'Payment problems',
      'Technical bugs'
    ]
  },
  {
    id: 3,
    title: 'Partnership & Collaboration',
    description: 'Business partnerships, sponsorships, and collaboration opportunities.',
    icon: Calendar,
    responseTime: '48h response',
    supportType: 'Business inquiries',
    features: [
      'Business partnerships',
      'Media partnerships',
      'Sponsorship deals',
      'Collaboration opportunities'
    ]
  }
]

export default function EnquiryPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const { settings } = useSettings()
  const [selectedType, setSelectedType] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    enquiryType: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message || !formData.enquiryType) {
      setSubmitMessage('Error: Please fill in all required fields.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          subject: formData.subject,
          message: formData.message,
          enquiryType: formData.enquiryType ? formData.enquiryType.toUpperCase() : 'GENERAL',
        }),
      })

      if (response.ok) {
        setSubmitMessage('Your enquiry has been submitted successfully! We\'ll get back to you soon.')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          enquiryType: ''
        })
        setSelectedType(null)
      } else {
        const errorData = await response.json()
        setSubmitMessage(`Error: ${errorData.error || 'Failed to submit enquiry'}`)
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error)
      setSubmitMessage('Error: Failed to submit enquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-theme-primary">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className={textHierarchy.largeHeading(isDarkMode)}>
              Get in <span className="text-theme-primary">TOUCH</span>
            </h1>
            <p className={textHierarchy.subheading()}>
              Have questions or need assistance? We're here to help with any enquiries about our services.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enquiry Types */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {enquiryTypes.map((type) => {
              const Icon = type.icon
              return (
                <Card 
                  key={type.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedType === type.id ? `ring-2 ring-theme-primary ${isDarkMode ? 'bg-theme-primary-900/20' : 'bg-theme-primary-50'}` : ''
                  } bg-theme-card border-theme-border hover:bg-theme-card-hover`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mx-auto mb-4">
                      <Icon className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <h3 className={textHierarchy.cardTitle(isDarkMode)}>{type.title}</h3>
                    <p className={textHierarchy.cardDescription()}>{type.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-center space-x-2 text-theme-text-tertiary">
                        <Clock className="h-4 w-4" />
                        <span>{type.responseTime}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-theme-text-tertiary">
                        <Mail className="h-4 w-4" />
                        <span>{type.supportType}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Enquiry Form */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.cardTitle(isDarkMode)}>Submit Your Enquiry</CardTitle>
              <CardDescription className={textHierarchy.cardDescription()}>
                Fill out our contact form and we'll get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${textHierarchy.cardDescription()}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg border-theme-border text-theme-text placeholder-theme-text-tertiary"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${textHierarchy.cardDescription()}`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg border-theme-border text-theme-text placeholder-theme-text-tertiary"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textHierarchy.cardDescription()}`}>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter your phone number (optional)"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textHierarchy.cardDescription()}`}>
                    Enquiry Type
                  </label>
                  <select
                    required
                    value={formData.enquiryType}
                    onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg border-theme-border text-theme-text"
                  >
                    <option value="">Select enquiry type</option>
                    <option value="general">General Enquiries</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership & Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textHierarchy.cardDescription()}`}>
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Brief description of your enquiry"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textHierarchy.cardDescription()}`}>
                    Message
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Please provide details about your enquiry..."
                  />
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-md ${
                    submitMessage.includes('Error') 
                      ? 'bg-theme-error-50 dark:bg-theme-error-900/20 text-theme-error-600 dark:text-theme-error-400 border border-theme-error-200 dark:border-theme-error-800' 
                      : 'bg-theme-success-50 dark:bg-theme-success-900/20 text-theme-success-600 dark:text-theme-success-400 border border-theme-success-200 dark:border-theme-success-800'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant="theme-primary"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2 text-white" />
                  {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.cardTitle(isDarkMode)}>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-theme-text-tertiary" />
                <div>
                  <div className={textHierarchy.cardTitle(isDarkMode)}>Email</div>
                  <div className={textHierarchy.cardDescription()}>{settings.supportEmail}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-theme-text-tertiary" />
                <div>
                  <div className={textHierarchy.cardTitle(isDarkMode)}>Phone</div>
                  <div className={textHierarchy.cardDescription()}>{settings.supportPhone}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-theme-text-tertiary" />
                <div>
                  <div className={textHierarchy.cardTitle(isDarkMode)}>Response Time</div>
                  <div className={textHierarchy.cardDescription()}>24 hours</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Information */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader className="pb-4">
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>
                What to Expect
              </CardTitle>
              <CardDescription className={textHierarchy.cardDescription()}>
                Here's what happens after you submit your enquiry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-theme-success-100 dark:bg-gray-800 border border-theme-success-200 dark:border-gray-600">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-5 w-5 text-theme-success-600 dark:text-theme-success-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-theme-success-900 dark:text-white">
                      Quick Response Time
                    </h4>
                    <p className="text-sm mt-1 text-theme-success-800 dark:text-gray-200">
                      Typical response time: 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-theme-primary-100 dark:bg-gray-800 border border-theme-primary-200 dark:border-gray-600">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-5 w-5 text-theme-primary-600 dark:text-theme-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-theme-primary-900 dark:text-white">
                      Email Response
                    </h4>
                    <p className="text-sm mt-1 text-theme-primary-800 dark:text-gray-200">
                      You will receive a detailed response via email to the address provided in your enquiry
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-theme-info-100 dark:bg-gray-800 border border-theme-info-200 dark:border-gray-600">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-5 w-5 text-theme-info-600 dark:text-theme-info-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-theme-info-900 dark:text-white">
                      Status Updates
                    </h4>
                    <p className="text-sm mt-1 text-theme-info-800 dark:text-gray-200">
                      In-app notifications will be sent for status updates on your enquiry
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-theme-neutral-100 dark:bg-gray-800 border border-theme-neutral-200 dark:border-gray-600">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-5 w-5 text-theme-neutral-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-theme-neutral-900 dark:text-white">
                      All Enquiries Welcome
                    </h4>
                    <p className="text-sm mt-1 text-theme-neutral-800 dark:text-gray-200">
                      All enquiry types welcome - we're here to help
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.cardTitle(isDarkMode)}>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className={`font-medium mb-1 ${textHierarchy.cardTitle(isDarkMode)}`}>How quickly will I get a response?</div>
                <div className={textHierarchy.cardDescription()}>Most enquiries are responded to within 24 hours.</div>
              </div>
              <div className="text-sm">
                <div className={`font-medium mb-1 ${textHierarchy.cardTitle(isDarkMode)}`}>Can I get a refund?</div>
                <div className={textHierarchy.cardDescription()}>Refunds are available within 30 days of purchase.</div>
              </div>
              <div className="text-sm">
                <div className={`font-medium mb-1 ${textHierarchy.cardTitle(isDarkMode)}`}>Do you offer phone support?</div>
                <div className={textHierarchy.cardDescription()}>Yes, for technical issues and urgent matters.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
