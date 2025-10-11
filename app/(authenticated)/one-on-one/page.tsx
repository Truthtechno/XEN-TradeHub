'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import MentorshipRegistrationPopup from '@/components/ui/mentorship-registration-popup'
import { useRegistration } from '@/lib/registration-context'
import { BarChart, BookOpen, CheckCircle, Circle, Headphones, Home, Plus, Shield, Star, Target, Trophy, Users, Zap } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

const features = [
  {
    icon: Users,
    title: '5 Personalized Coaching Sessions',
    description: 'One-on-one Zoom sessions with CoreFX team — lifetime replay access included.',
    color: 'text-theme-primary'
  },
  {
    icon: Target,
    title: 'Custom Strategy Refinement',
    description: 'Take what you know, optimize it for consistency and profitability.',
    color: 'text-theme-success'
  },
  {
    icon: BarChart,
    title: 'Live Chart Reviews & Audit',
    description: 'Get your trading journal analyzed, trade-by-trade breakdown.',
    color: 'text-theme-accent'
  },
  {
    icon: Circle,
    title: 'Trading Psychology Mastery',
    description: 'Identify emotional leaks and create a system that neutralizes them.',
    color: 'text-theme-warning'
  },
  {
    icon: BookOpen,
    title: 'Your Personalized Trading Plan',
    description: 'From watchlist building to entry/exit rules and risk system.',
    color: 'text-theme-info'
  },
  {
    icon: Headphones,
    title: 'Lifetime VIP Signal Group Access',
    description: 'Never pay again for signals — $1,000+ saved yearly.',
    color: 'text-theme-secondary'
  }
]

const additionalPerks = [
  {
    icon: Headphones,
    title: 'Private Access for 60 Days',
    description: 'Direct access to CoreFX team post-mentorship for any follow-up questions.',
    color: 'text-theme-primary'
  },
  {
    icon: Star,
    title: 'Mentorship Shoutout',
    description: 'Pass the funded challenge? CoreFX showcases you across all platforms (free clout + social proof).',
    color: 'text-theme-warning'
  },
  {
    icon: Home,
    title: 'Funded Trader Blueprint Add-On',
    description: 'Step-by-step guide to secure 6-figure funding included.',
    color: 'text-theme-success'
  }
]

const whyInvest = [
  {
    icon: Zap,
    title: 'Skip Years of Trial & Error',
    description: 'Get direct access to proven strategies that work.',
    color: 'text-theme-warning'
  },
  {
    icon: Target,
    title: 'Personalized to YOUR Trading',
    description: 'Not generic advice — custom solutions for your style.',
    color: 'text-theme-success'
  },
  {
    icon: Plus,
    title: 'Lifetime Value',
    description: 'Skills and access that pay for themselves many times over.',
    color: 'text-theme-primary'
  }
]


export default function OneOnOnePage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const { addRegistration } = useRegistration()
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/user/access')
      if (response.ok) {
        const data = await response.json()
        // Check if user has mentorship access (premium access)
        setIsPremium(data.data.mentorship || data.data.subscriptionType === 'PREMIUM')
      }
    } catch (error) {
      console.error('Error checking premium status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkPremiumStatus()
  }, [])

  const handleRegister = () => {
    if (isPremium) {
      return // Don't open registration if already premium
    }
    setIsRegistrationOpen(true)
  }

  const handleRegistrationSuccess = (registrationData: any) => {
    const registration = {
      id: `mentor-${Date.now()}`,
      courseId: 999, // Special ID for mentorship
      courseTitle: 'One-on-One Mentorship',
      courseType: 'online' as 'online' | 'academy',
      studentName: `${registrationData.firstName} ${registrationData.lastName}`,
      studentEmail: registrationData.email,
      registrationDate: registrationData.registrationDate,
      paymentStatus: registrationData.paymentStatus,
      transactionId: registrationData.transactionId,
      experienceLevel: 'Mentorship',
      motivation: registrationData.schedulingPreferences,
      price: registrationData.price,
      currency: registrationData.currency
    }
    addRegistration(registration)
    setIsRegistrationOpen(false)
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-theme-primary">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className={textHierarchy.largeHeading(isDarkMode)}>One-on-One Mentorship</h1>
            <p className={textHierarchy.subheading()}>Transform your trading with personalized coaching from CoreFX</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Offer Card */}
          <Card className="bg-theme-primary text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">One-on-One Mentorship - $1,500</CardTitle>
                  <CardDescription className="text-white/80">
                    Collapse 3-5 years of trading pain into 5 deep sessions.
                  </CardDescription>
                </div>
                <div className="p-3 rounded-full bg-white bg-opacity-20">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className={isPremium ? "bg-gray-700 text-white hover:bg-gray-800 border-gray-600 shadow-lg" : "bg-black text-white hover:bg-gray-800"} 
                onClick={handleRegister}
                disabled={isPremium}
              >
                {isLoading ? "Loading..." : isPremium ? "REGISTERED" : "REGISTER NOW"}
              </Button>
              {isPremium && (
                <div className="text-center mt-3">
                  <Badge variant="default" className="bg-theme-success-900 text-white border-theme-success-900 shadow-sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Premium Access Active
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Who this is for */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Who this is for:</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={textHierarchy.cardDescription()}>
                Highly motivated traders who want to collapse 3-5 years of pain into 5 deep sessions, rebuild their psychology, and get a custom trading system that actually works for them.
              </p>
            </CardContent>
          </Card>

          {/* What You Get */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>What You Get:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <Card key={index} className="bg-theme-bg-secondary border-theme-border">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Icon className={`h-6 w-6 ${feature.color} flex-shrink-0 mt-1`} />
                          <div>
                            <h4 className={textHierarchy.cardTitle(isDarkMode)}>{feature.title}</h4>
                            <p className={textHierarchy.cardDescription()}>{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Additional Perks */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Additional Perks:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {additionalPerks.map((perk, index) => {
                const Icon = perk.icon
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <Icon className={`h-5 w-5 ${perk.color} flex-shrink-0 mt-1`} />
                    <div>
                      <h4 className={textHierarchy.cardTitle(isDarkMode)}>{perk.title}</h4>
                      <p className={textHierarchy.cardDescription()}>{perk.description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Why This Investment Changes Everything */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Why This Investment Changes Everything</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {whyInvest.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <Icon className={`h-5 w-5 ${item.color} flex-shrink-0 mt-1`} />
                    <div>
                      <h4 className={textHierarchy.cardTitle(isDarkMode)}>{item.title}</h4>
                      <p className={textHierarchy.cardDescription()}>{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <div className="text-center">
                <div className="text-4xl font-bold text-theme-primary mb-2">$1,500</div>
                <div className={textHierarchy.metaText(isDarkMode)}>One-time investment</div>
                <p className={textHierarchy.cardTitle(isDarkMode)}>Transform 3-5 years of struggle into 5 focused sessions.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {[
                  '5 personalized coaching sessions',
                  'Custom strategy refinement',
                  'Trading psychology mastery',
                  'Lifetime VIP signal access',
                  'Certificate of completion',
                  '60-day follow-on access'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-theme-success" /> {/* Success for checkmarks */}
                    <span className={textHierarchy.cardTitle(isDarkMode)}>{item}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg" 
                className={isPremium ? "w-full bg-gray-700 hover:bg-gray-800 border-gray-600 shadow-lg" : "w-full bg-theme-primary hover:bg-theme-primary/90 text-white"} 
                onClick={handleRegister}
                disabled={isPremium}
              >
                {isLoading ? "Loading..." : isPremium ? "REGISTERED" : "REGISTER NOW"}
              </Button>
              {isPremium && (
                <div className="text-center mt-2">
                  <Badge variant="default" className="bg-theme-success-900 text-white border-theme-success-900 shadow-sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    You have premium access
                  </Badge>
                </div>
              )}
              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className={textHierarchy.cardTitle(isDarkMode)}>Lifetime value that pays for itself</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className={textHierarchy.cardTitle(isDarkMode)}>Limited spots available monthly</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Build Confidence */}
          <Card className="bg-theme-card border-theme-border">
            <CardHeader>
              <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Build your confidence to find answers to your questions!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-theme-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <span className={textHierarchy.cardTitle(isDarkMode)}>Personalized one-on-one coaching sessions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-theme-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span className={textHierarchy.cardTitle(isDarkMode)}>5-session transformative program</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-theme-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <span className={textHierarchy.cardTitle(isDarkMode)}>Real-time feedback and growth plan</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mentorship Registration Popup */}
      <MentorshipRegistrationPopup
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  )
}
