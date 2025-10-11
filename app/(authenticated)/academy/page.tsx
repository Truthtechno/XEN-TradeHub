'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import RegistrationPopup from '@/components/ui/registration-popup'
import { useRegistration } from '@/lib/registration-context'
import { useSettings } from '@/lib/settings-context'
import { useSession } from 'next-auth/react'
import { useAcademyRegistrations } from '@/hooks/use-academy-registrations'
import { BookOpen, Building, Calendar, CheckCircle, Clock, GraduationCap, Mail, MapPin, Phone, RefreshCw, Target, Users } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

interface AcademyClass {
  id: string
  title: string
  description: string
  instructor: string
  location: string
  nextSession: string
  duration: string
  maxStudents: number
  enrolledStudents: number
  price: number
  currency: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTERCLASS'
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

// This will be moved inside the component to use dynamic settings
const getCourses = (siteName: string, currency: string) => [
  {
    id: 1,
    title: 'Beginner Forex Course',
    description: 'Complete introduction to forex trading for beginners',
    price: 50,
    currency: currency,
    duration: '2 days',
    level: 'Beginner',
    maxStudents: 20,
    enrolled: 15,
    instructor: `${siteName} Team`,
    nextSession: '2025-10-15',
    location: `${siteName} Academy, Kampala`,
    type: 'academy'
  },
  {
    id: 2,
    title: 'Advanced Strategy Workshop',
    description: 'Master advanced trading strategies and risk management',
    price: 250,
    currency: currency,
    duration: '3 days',
    level: 'Advanced',
    maxStudents: 15,
    enrolled: 8,
    instructor: `${siteName} Team`,
    nextSession: '2025-10-22',
    location: `${siteName} Academy, Kampala`,
    type: 'academy'
  }
]

const features = [
  {
    icon: Users,
    title: 'Small Class Sizes',
    description: 'Maximum 20 students per class for personalized attention',
    color: 'text-theme-primary' // Primary for main feature
  },
  {
    icon: Target,
    title: 'Hands-on Training',
    description: 'Live trading sessions with real market data',
    color: 'text-theme-success' // Success for practical training
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Materials',
    description: 'Detailed course materials and trading guides',
    color: 'text-theme-info' // Info for educational materials
  },
  {
    icon: CheckCircle,
    title: 'Certification',
    description: 'Receive a certificate upon course completion',
    color: 'text-theme-accent' // Accent for achievement/certification
  }
]


export default function AcademyPage() {
  const { isDarkMode } = useTheme()
  const { settings } = useSettings()
  const textHierarchy = useTextHierarchy()
  const { data: session, status } = useSession()
  const { isRegistered, addRegistration } = useRegistration()
  const { 
    userRegistrations, 
    isLoading: isLoadingRegistrations, 
    isUserRegistered, 
    addRegistration: addAcademyRegistration,
    fetchUserRegistrations 
  } = useAcademyRegistrations()
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [classes, setClasses] = useState<AcademyClass[]>([])
  const [isLoading, setIsLoading] = useState(true)


  const fetchClasses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/academy-classes?status=UPCOMING&isPublished=true')
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      } else {
        console.error('Failed to fetch classes')
        // Fallback to hardcoded data if API fails
        setClasses(getCourses(settings.siteName, settings.currency).map(course => ({
          id: course.id.toString(),
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          location: course.location,
          nextSession: course.nextSession,
          duration: course.duration,
          maxStudents: course.maxStudents,
          enrolledStudents: course.enrolled,
          price: course.price,
          currency: course.currency,
          level: course.level.toUpperCase() as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTERCLASS',
          status: 'UPCOMING' as const,
          isPublished: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })))
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      // Fallback to hardcoded data if API fails
      setClasses(getCourses(settings.siteName, settings.currency).map(course => ({
        id: course.id.toString(),
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        location: course.location,
        nextSession: course.nextSession,
        duration: course.duration,
        maxStudents: course.maxStudents,
        enrolledStudents: course.enrolled,
        price: course.price,
        currency: course.currency,
        level: course.level.toUpperCase() as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTERCLASS',
        status: 'UPCOMING' as const,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('Loading classes...')
    fetchClasses()
  }, [settings.siteName, settings.currency])

  const handleRegister = (course: any) => {
    setSelectedCourse(course)
    setIsRegistrationOpen(true)
  }

  const handleRegistrationSuccess = async (registrationData: any) => {
    try {
      // Save registration to database
      const response = await fetch(`/api/academy-classes/${registrationData.course.id}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: `${registrationData.firstName} ${registrationData.lastName}`,
          email: registrationData.email,
          phone: `${registrationData.countryCode}${registrationData.phone}`,
          experience: registrationData.experienceLevel,
          goals: registrationData.motivation,
          amountUSD: registrationData.course.price,
          currency: registrationData.course.currency,
          status: 'PENDING',
          paymentStatus: registrationData.paymentStatus === 'completed' ? 'PAID' : 'PENDING',
          stripePaymentIntentId: registrationData.transactionId
        })
      })

      if (response.ok) {
        // Add to local registration context for UI state
        const registration = {
          id: `reg-${Date.now()}`,
          courseId: registrationData.course.id,
          courseTitle: registrationData.course.title,
          courseType: 'academy' as const,
          studentName: `${registrationData.firstName} ${registrationData.lastName}`,
          studentEmail: registrationData.email,
          registrationDate: registrationData.registrationDate,
          paymentStatus: registrationData.paymentStatus,
          transactionId: registrationData.transactionId,
          experienceLevel: registrationData.experienceLevel,
          preferredYear: registrationData.preferredYear,
          preferredMonth: registrationData.preferredMonth,
          motivation: registrationData.motivation
        }
        
        addRegistration(registration)
        setIsRegistrationOpen(false)
        setSelectedCourse(null)
        
        // Update user registrations state using the hook
        addAcademyRegistration(registrationData.course.id)
        
        // Refresh the classes to update enrollment counts
        fetchClasses()
      } else {
        console.error('Failed to save registration to database')
        alert('Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Error saving registration:', error)
      alert('Registration failed. Please try again.')
    }
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-theme-primary">
            <Building className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className={textHierarchy.largeHeading(isDarkMode)}>CoreFX Academy</h1>
            <p className={textHierarchy.subheading()}>In-person training and workshops for all skill levels</p>
          </div>
          {session?.user?.email && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => fetchUserRegistrations()}
                disabled={isLoadingRegistrations}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingRegistrations ? 'animate-spin' : ''}`} />
                {isLoadingRegistrations ? 'Refreshing...' : 'Refresh'}
              </Button>
              <div className="text-xs text-theme-text-tertiary">
                Reg: {userRegistrations.length}
              </div>
              <Button
                onClick={() => {
                  console.log('Manual test - Current state:', {
                    userRegistrations,
                    session: session?.user?.email,
                    status
                  })
                  fetchUserRegistrations()
                }}
                variant="outline"
                size="sm"
              >
                Test
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Notice */}
      <Card className="mb-8 bg-theme-card border-theme-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-theme-success" />
            <div>
              <h3 className={textHierarchy.cardTitle(isDarkMode)}>All Skill Levels Welcome</h3>
              <p className={textHierarchy.cardDescription()}>Whether you're a complete beginner or an experienced trader, we have courses tailored for your level.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses */}
      <div className="mb-12">
        <h2 className={textHierarchy.sectionHeading(isDarkMode)}>Available Courses</h2>
        {isLoading || status === 'loading' ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-all duration-200 bg-theme-card border-theme-border hover:bg-theme-card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={textHierarchy.cardTitle(isDarkMode)}>{course.title}</CardTitle>
                    <CardDescription className={textHierarchy.cardDescription()}>{course.description}</CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-theme-text-tertiary">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrolledStudents}/{course.maxStudents} students</span>
                      </div>
                      <Badge variant={
                        course.level === 'BEGINNER' ? 'success' : 
                        course.level === 'ADVANCED' ? 'warning' : 
                        course.level === 'MASTERCLASS' ? 'destructive' : 
                        course.level === 'INTERMEDIATE' ? 'info' : 
                        'default'}>
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-theme-primary">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: course.currency
                      }).format(course.price)}
                    </div>
                    <div className="text-sm text-theme-text-tertiary">per person</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-theme-text-secondary">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-theme-text-tertiary" />
                    <span>Next session: {new Date(course.nextSession).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-theme-text-tertiary" />
                    <span>{course.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-theme-text-tertiary" />
                    <span>Instructor: {course.instructor}</span>
                  </div>
                </div>

                <div className="w-full rounded-full h-2 bg-theme-bg-secondary">
                  <div 
                    className="bg-theme-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(course.enrolledStudents / course.maxStudents) * 100}%` }}
                  ></div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="theme-primary"
                    className="flex-1"
                    onClick={() => handleRegister(course)}
                    disabled={isUserRegistered(course.id) || isLoadingRegistrations}
                  >
                    {isLoadingRegistrations ? (
                      'Loading...'
                    ) : isUserRegistered(course.id) ? (
                      'Registered'
                    ) : (
                      'Register Now'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className={textHierarchy.sectionHeading(isDarkMode)}>Why Choose CoreFX Academy?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-200 bg-theme-card border-theme-border hover:bg-theme-card-hover">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} bg-opacity-10 flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className={textHierarchy.cardTitle(isDarkMode)}>{feature.title}</h3>
                  <p className={textHierarchy.cardDescription()}>{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>


      {/* Contact Information */}
      <Card className="bg-theme-card border-theme-border">
        <CardHeader>
          <CardTitle className={textHierarchy.cardTitle(isDarkMode)}>Get in Touch</CardTitle>
          <CardDescription className={textHierarchy.cardDescription()}>
            Ready to start your trading journey? Contact {settings.siteName} for more information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-theme-text-tertiary" />
              <div>
                <div className={textHierarchy.cardTitle(isDarkMode)}>Location</div>
                <div className={textHierarchy.cardDescription()}>
                  {settings.supportAddress || 'CoreFX Academy, Kampala, Uganda'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-theme-text-tertiary" />
              <div>
                <div className={textHierarchy.cardTitle(isDarkMode)}>Phone</div>
                <div className={textHierarchy.cardDescription()}>
                  {settings.supportPhone || '+256 700 123 456'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-theme-text-tertiary" />
              <div>
                <div className={textHierarchy.cardTitle(isDarkMode)}>Email</div>
                <div className={textHierarchy.cardDescription()}>
                  {settings.supportEmail || 'academy@corefx.com'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Popup */}
      <RegistrationPopup
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        course={selectedCourse}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  )
}
