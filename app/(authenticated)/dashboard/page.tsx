'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRegistration } from '@/lib/registration-context'
import { useSettings } from '@/lib/settings-context'
import { useNotifications } from '@/lib/notifications-context'
import { Activity, Building, Calculator, Calendar, CheckCircle, GraduationCap, Hand, Headphones, HelpCircle, Home, Play, RefreshCw, Shield, Star, Target, TrendingUp, Trophy, Users } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import BannerDisplay from '@/components/banner-display'

// This will be moved inside the component to use dynamic settings
const getDashboardCards = (siteName: string) => [
  {
    title: `Trade With ${siteName}`,
    description: 'Exness partnership',
    icon: Hand,
    color: 'bg-red-500',
    href: '/trade-core'
  },
  {
    title: 'Signals',
    description: 'Premium trading signals',
    icon: TrendingUp,
    color: 'bg-green-500',
    href: '/signals'
  },
  {
    title: 'Currency Heatmap',
    description: 'Live currency strength',
    icon: Activity,
    color: 'bg-blue-500',
    href: '/market-analysis'
  },
  {
    title: 'Lot Size Calculator',
    description: 'Position sizing tool',
    icon: Calculator,
    color: 'bg-yellow-500',
    href: 'calculator-panel'
  },
  {
    title: 'Upcoming Events',
    description: 'Organised events',
    icon: Calendar,
    color: 'bg-purple-500',
    href: '/events'
  },
  {
    title: 'Course',
    description: 'Master forex trading',
    icon: GraduationCap,
    color: 'bg-green-500',
    href: '/courses'
  },
  {
    title: 'One on One',
    description: 'Personal coaching',
    icon: Users,
    color: 'bg-orange-500',
    href: '/one-on-one'
  },
  {
    title: 'Academy',
    description: 'In-person training',
    icon: Building,
    color: 'bg-green-500',
    href: '/academy'
  },
  {
    title: 'Enquiry',
    description: 'Get in touch',
    icon: HelpCircle,
    color: 'bg-red-500',
    href: '/enquiry'
  }
]

export default function DashboardPage() {
  const { isDarkMode } = useTheme()
  const { registrations } = useRegistration()
  const { settings } = useSettings()
  const { hasNewNotification, markNewAsViewed } = useNotifications()
  const [user, setUser] = useState<{ name?: string | null; email?: string | null; role?: string; profile?: { firstName?: string; lastName?: string } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const textHierarchy = useTextHierarchy()

  // Function to handle card clicks
  const handleCardClick = async (href: string) => {
    if (href === 'calculator-panel') {
      // Trigger the calculator panel to open by dispatching a custom event
      window.dispatchEvent(new CustomEvent('openCalculatorPanel'))
    } else {
      // Mark notification as viewed if it exists for this page
      if (hasNewNotification(href)) {
        await markNewAsViewed(href)
      }
      // Navigate to the page
      window.location.href = href
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setLastUpdated(new Date())
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleRefresh = () => {
    setLastUpdated(new Date())
  }

  // Get display name based on user role and profile
  const getDisplayName = () => {
    if (!user) return 'User'
    
    // For admin users, show "ADMIN"
    if (user.role === 'ADMIN') {
      return 'ADMIN'
    }
    
    // For other users, try to get first name from profile, then from name
    if (user.profile?.firstName) {
      return user.profile.firstName.toUpperCase()
    }
    
    if (user.name) {
      return user.name.split(' ')[0].toUpperCase()
    }
    
    return 'User'
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Banners */}
      <BannerDisplay pagePath="/dashboard" className="mb-6" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-8">
        <div className="space-y-3">
          <h1 className={textHierarchy.mainHeading(isDarkMode)}>
            Welcome back, {getDisplayName()}! 👋
          </h1>
          <p className={textHierarchy.subheading()}>
            Here's your complete navigation hub. Click any card to access that section.
          </p>
        </div>
        <div className="flex flex-col sm:items-end space-y-3">
          {lastUpdated && (
            <p className={textHierarchy.metaText(isDarkMode)}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button onClick={handleRefresh} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getDashboardCards(settings.siteName).map((card, index) => {
          const Icon = card.icon
          const hasNew = hasNewNotification(card.href)
          return (
            <Card key={index} className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 ${card.color} rounded-xl flex items-center justify-center shadow-lg relative flex-shrink-0`}>
                    <Icon className="h-7 w-7 text-white" />
                    {hasNew && (
                      <Badge variant="xen-red" className="absolute -top-1 -right-1 text-xs">
                        NEW
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold group-hover:text-theme-primary transition-colors leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {card.title}
                    </h3>
                    <p className={`text-sm mt-2 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {card.description}
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-theme-primary hover:bg-theme-primary-700 text-white transition-colors font-medium py-2.5"
                  onClick={() => handleCardClick(card.href)}
                >
                  Access Now
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* My Courses Section */}
      {registrations.length > 0 && (
        <div className="mt-12">
          <h2 className={`${textHierarchy.sectionHeading(isDarkMode)} mb-6`}>
            My Registered Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((registration) => (
              <Card key={registration.id} className={`hover:shadow-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {registration.courseType === 'academy' ? (
                        <Building className="h-5 w-5 text-teal-500" />
                      ) : (
                        <GraduationCap className="h-5 w-5 text-blue-500" />
                      )}
                      <CardTitle className={`text-lg transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {registration.courseTitle}
                      </CardTitle>
                    </div>
                    <Badge variant={registration.paymentStatus === 'completed' ? 'xen-green' : 'xen-orange'}>
                      {registration.paymentStatus}
                    </Badge>
                  </div>
                  <CardDescription className={`transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {registration.courseType === 'academy' ? 'In-person training' : 'Online course'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Registered on {new Date(registration.registrationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Experience: {registration.experienceLevel}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Access Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Active Signals</CardTitle>
            <TrendingUp className={`h-4 w-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>3</div>
            <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Courses Completed</CardTitle>
            <GraduationCap className={`h-4 w-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1</div>
            <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>2 courses in progress</p>
          </CardContent>
        </Card>

        <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total Earnings</CardTitle>
            <Trophy className={`h-4 w-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$0</div>
            <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>Start trading to earn</p>
          </CardContent>
        </Card>

        <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subscription</CardTitle>
            <Shield className={`h-4 w-4 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Active</div>
            <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>Signals plan</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
