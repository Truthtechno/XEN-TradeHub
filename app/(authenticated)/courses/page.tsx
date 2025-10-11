'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import RegistrationPopup from '@/components/ui/registration-popup'
import { useRegistration } from '@/lib/registration-context'
import { useSettings } from '@/lib/settings-context'
import { useEnrolledCourses } from '@/lib/use-enrolled-courses'
import { useLessonProgress } from '@/lib/use-lesson-progress'
import { BookOpen, CheckCircle, ChevronLeft, ChevronRight, Clock, Eye, GraduationCap, Lock, Play, Star, Users, Video } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import { usePageViewTracking } from '@/lib/use-page-view-tracking'
import BannerDisplay from '@/components/banner-display'
import { VideoPlayer } from '@/components/video-player'
import { parseVideoUrl, isDirectVideoFile } from '@/lib/video-utils'

interface Lesson {
  id: string
  title: string
  description: string
  videoUrl: string
  durationSec: number
  order: number
  isPreview: boolean
  isPublished: boolean
  thumbnailUrl?: string
}

interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  priceUSD: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  status: 'DRAFT' | 'PUBLISHED'
  coverUrl: string | null
  instructor: string
  isFree: boolean
  duration?: number
  totalLessons: number
  views: number
  rating?: number
  tags: string[]
  lessons: Lesson[]
  enrollments: number
  revenue: number
  createdAt: string
  updatedAt: string
}

// Fetch courses from API
const fetchCourses = async (): Promise<Course[]> => {
  try {
    const response = await fetch('/api/courses')
    if (!response.ok) {
      throw new Error('Failed to fetch courses')
    }
    const data = await response.json()
    return data.courses || []
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

// Mock data fallback - replace with actual API call
const getCourses = (siteName: string, currency: string): Course[] => [
  {
    id: '1',
    title: 'Forex Trading Masterclass - FREE',
    slug: 'forex-trading-masterclass-free',
    description: 'A comprehensive beginner course covering everything you need to know about forex trading. Learn from basic concepts to practical trading strategies.',
    shortDescription: 'Complete beginner guide to forex trading',
    priceUSD: 0,
    level: 'BEGINNER',
    status: 'PUBLISHED',
    coverUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    instructor: 'XEN Forex Team',
    isFree: true,
    duration: 180, // 3 hours total
    totalLessons: 3,
    views: 1247,
    rating: 4.8,
    tags: ['forex', 'beginner', 'trading', 'free'],
    lessons: [
      {
        id: '1-1',
        title: 'Introduction to Forex Trading',
        description: 'Learn the basics of forex markets and currency pairs',
        videoUrl: 'https://www.youtube.com/watch?v=3qHj8dWJQZk',
        durationSec: 3600, // 1 hour
        order: 1,
        isPreview: true,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/3qHj8dWJQZk/maxresdefault.jpg'
      },
      {
        id: '1-2',
        title: 'Understanding Currency Pairs',
        description: 'Deep dive into major, minor, and exotic currency pairs',
        videoUrl: 'https://www.youtube.com/watch?v=4cWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 2,
        isPreview: false,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/4cWQEBtLgcg/maxresdefault.jpg'
      },
      {
        id: '1-3',
        title: 'Basic Trading Strategies',
        description: 'Essential trading strategies for beginners',
        videoUrl: 'https://www.youtube.com/watch?v=5dWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 3,
        isPreview: false,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/5dWQEBtLgcg/maxresdefault.jpg'
      }
    ],
    enrollments: 156,
    revenue: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Technical Analysis Fundamentals - FREE',
    slug: 'technical-analysis-fundamentals-free',
    description: 'Master the art of technical analysis with charts, indicators, and patterns. Perfect for intermediate traders looking to improve their skills.',
    shortDescription: 'Complete guide to technical analysis',
    priceUSD: 0,
    level: 'INTERMEDIATE',
    status: 'PUBLISHED',
    coverUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop',
    instructor: 'XEN Forex Team',
    isFree: true,
    duration: 240, // 4 hours total
    totalLessons: 4,
    views: 892,
    rating: 4.6,
    tags: ['technical-analysis', 'charts', 'indicators', 'free'],
    lessons: [
      {
        id: '2-1',
        title: 'Chart Patterns and Trends',
        description: 'Understanding support, resistance, and trend lines',
        videoUrl: 'https://www.youtube.com/watch?v=6cWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 1,
        isPreview: true,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/6cWQEBtLgcg/maxresdefault.jpg'
      },
      {
        id: '2-2',
        title: 'Moving Averages and Oscillators',
        description: 'Learn about RSI, MACD, and moving average strategies',
        videoUrl: 'https://www.youtube.com/watch?v=7cWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 2,
        isPreview: false,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/7cWQEBtLgcg/maxresdefault.jpg'
      },
      {
        id: '2-3',
        title: 'Candlestick Patterns',
        description: 'Reading price action through candlestick formations',
        videoUrl: 'https://www.youtube.com/watch?v=8cWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 3,
        isPreview: false,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/8cWQEBtLgcg/maxresdefault.jpg'
      },
      {
        id: '2-4',
        title: 'Risk Management in Technical Analysis',
        description: 'Applying risk management principles to technical trading',
        videoUrl: 'https://www.youtube.com/watch?v=9cWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 4,
        isPreview: false,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/9cWQEBtLgcg/maxresdefault.jpg'
      }
    ],
    enrollments: 89,
    revenue: 0,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-14T15:30:00Z'
  },
  {
    id: '3',
    title: 'The GOAT Strategy - Premium',
    slug: 'the-goat-strategy-premium',
    description: 'The GOAT Strategy is a high-level, confluence-driven trading approach designed for traders who want to master advanced techniques and achieve consistent profitability.',
    shortDescription: 'Advanced confluence trading strategy',
    priceUSD: 199,
    level: 'ADVANCED',
    status: 'PUBLISHED',
    coverUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    instructor: 'XEN Forex Team',
    isFree: false,
    duration: 300, // 5 hours total
    totalLessons: 5,
    views: 456,
    rating: 4.9,
    tags: ['premium', 'advanced', 'strategy', 'confluence'],
    lessons: [
      {
        id: '3-1',
        title: 'Introduction to Confluence Trading',
        description: 'Understanding the power of multiple confirmations',
        videoUrl: 'https://www.youtube.com/watch?v=10cWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 1,
        isPreview: true,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/10cWQEBtLgcg/maxresdefault.jpg'
      },
      {
        id: '3-2',
        title: 'Market Structure Analysis',
        description: 'Reading market structure for high-probability setups',
        videoUrl: 'https://www.youtube.com/watch?v=11cWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 2,
        isPreview: false,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/11cWQEBtLgcg/maxresdefault.jpg'
      },
      {
        id: '3-3',
        title: 'Confluence Points and Entries',
        description: 'Identifying and executing confluence-based entries',
        videoUrl: 'https://www.youtube.com/watch?v=12cWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 3,
        isPreview: false,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/12cWQEBtLgcg/maxresdefault.jpg'
      },
      {
        id: '3-4',
        title: 'Risk Management and Position Sizing',
        description: 'Advanced risk management for the GOAT strategy',
        videoUrl: 'https://www.youtube.com/watch?v=13cWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 4,
        isPreview: false,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/13cWQEBtLgcg/maxresdefault.jpg'
      },
      {
        id: '3-5',
        title: 'Live Trading Examples',
        description: 'Real-time examples and case studies',
        videoUrl: 'https://www.youtube.com/watch?v=14cWQEBtLgcg',
        durationSec: 3600, // 1 hour
        order: 5,
        isPreview: false,
        isPublished: true,
        thumbnailUrl: 'https://img.youtube.com/vi/14cWQEBtLgcg/maxresdefault.jpg'
      }
    ],
    enrollments: 67,
    revenue: 13333,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  }
]

export default function CoursesPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const { settings } = useSettings()
  const { isRegistered, addRegistration } = useRegistration()
  const { isEnrolled, getEnrollment, refreshEnrolledCourses } = useEnrolledCourses()
  const { isLessonCompleted, markLessonComplete, loadProgress } = useLessonProgress()
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedCourseForViewing, setSelectedCourseForViewing] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [unlockedLessons, setUnlockedLessons] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Track page view to remove NEW badge
  usePageViewTracking('/courses')

  // Fetch courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true)
      try {
        const fetchedCourses = await fetchCourses()
        setCourses(fetchedCourses)
      } catch (error) {
        console.error('Error loading courses:', error)
        // Fallback to mock data if API fails
        setCourses(getCourses(settings.siteName, settings.currency))
      } finally {
        setIsLoading(false)
      }
    }
    
    loadCourses()
  }, [settings.siteName, settings.currency])

  // Track course view when a student actually views a course
  const trackCourseView = async (courseId: string) => {
    try {
      console.log('Tracking view for course:', courseId)
      const response = await fetch(`/api/courses/${courseId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('View tracked successfully:', data)
        
        // Update the course views in the local state
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course.id === courseId 
              ? { ...course, views: data.views }
              : course
          )
        )
      } else {
        console.error('Failed to track view:', response.status)
      }
    } catch (error) {
      console.error('Error tracking course view:', error)
    }
  }

  const handleEnroll = async (course: Course) => {
    if (course.isFree) {
      // For free courses, create database enrollment
      try {
        const enrollmentResponse = await fetch('/api/courses/enroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: course.id,
            transactionId: `FREE-${Date.now()}`,
            paymentStatus: 'completed'
          })
        })

        if (enrollmentResponse.ok) {
          // Also add to local registration for UI consistency
          const registration = {
            id: `reg-${Date.now()}`,
            courseId: parseInt(course.id) || 0,
            courseTitle: course.title,
            courseType: 'online' as const,
            studentName: 'BRIAN AMOOTI',
            studentEmail: 'brayamooti@gmail.com',
            registrationDate: new Date().toISOString(),
            paymentStatus: 'completed' as const,
            transactionId: `FREE-${Date.now()}`,
            experienceLevel: 'Complete Beginner',
            motivation: 'Free course enrollment'
          }
          addRegistration(registration)
          
          // Refresh course data to update counters
          const fetchedCourses = await fetchCourses()
          setCourses(fetchedCourses)
        } else {
          console.error('Failed to enroll in free course')
        }
      } catch (error) {
        console.error('Error enrolling in free course:', error)
      }
    } else {
      // For paid courses, open registration popup
      setSelectedCourse(course)
      setIsRegistrationOpen(true)
    }
  }

  // Check if user has access to a course (either free and registered, or paid and enrolled)
  const hasAccess = (course: Course): boolean => {
    if (course.isFree) {
      return isRegistered(parseInt(course.id) || 0)
    } else {
      return isEnrolled(course.id)
    }
  }

  const handleViewCourse = async (course: Course) => {
    // Track the course view
    await trackCourseView(course.id)
    
    // If user is not enrolled, enroll them (for both free and paid courses)
    if (!hasAccess(course)) {
      try {
        const enrollmentResponse = await fetch('/api/courses/enroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: course.id,
            transactionId: course.isFree ? `FREE-VIEW-${Date.now()}` : `PAID-VIEW-${Date.now()}`,
            paymentStatus: 'completed'
          })
        })

        if (enrollmentResponse.ok) {
          // Refresh course data to update counters
          const fetchedCourses = await fetchCourses()
          setCourses(fetchedCourses)
        }
      } catch (error) {
        console.error('Error enrolling when viewing course:', error)
      }
    }
    
    setSelectedCourseForViewing(course)
    
    // Load progress from database
    await loadProgress(course.id)
    
    // Initialize with first lesson unlocked
    const firstLesson = course.lessons[0]
    if (firstLesson) {
      setCurrentLesson(firstLesson)
      setUnlockedLessons(new Set([firstLesson.id]))
      
      // Determine which lessons should be unlocked based on completed lessons
      const unlocked = new Set([firstLesson.id])
      for (let i = 0; i < course.lessons.length - 1; i++) {
        const currentLesson = course.lessons[i]
        if (isLessonCompleted(currentLesson.id)) {
          const nextLesson = course.lessons[i + 1]
          if (nextLesson) {
            unlocked.add(nextLesson.id)
          }
        }
      }
      setUnlockedLessons(unlocked)
    }
  }

  const handleLessonComplete = async (lessonId: string) => {
    if (!selectedCourseForViewing) return
    
    try {
      // Save progress to database
      await markLessonComplete(selectedCourseForViewing.id, lessonId)
      
      // Update local state
      setCompletedLessons(prev => new Set([...Array.from(prev), lessonId]))
      
      // Unlock next lesson
      const currentIndex = selectedCourseForViewing.lessons.findIndex(lesson => lesson.id === lessonId)
      const nextLesson = selectedCourseForViewing.lessons[currentIndex + 1]
      
      if (nextLesson) {
        setUnlockedLessons(prev => new Set([...Array.from(prev), nextLesson.id]))
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error)
    }
  }

  const handleNextLesson = () => {
    if (selectedCourseForViewing && currentLesson) {
      const currentIndex = selectedCourseForViewing.lessons.findIndex(lesson => lesson.id === currentLesson.id)
      const nextLesson = selectedCourseForViewing.lessons[currentIndex + 1]
      
      if (nextLesson && unlockedLessons.has(nextLesson.id)) {
        setCurrentLesson(nextLesson)
      }
    }
  }

  const handlePreviousLesson = () => {
    if (selectedCourseForViewing && currentLesson) {
      const currentIndex = selectedCourseForViewing.lessons.findIndex(lesson => lesson.id === currentLesson.id)
      const previousLesson = selectedCourseForViewing.lessons[currentIndex - 1]
      
      if (previousLesson) {
        setCurrentLesson(previousLesson)
      }
    }
  }

  const isLessonUnlocked = (lessonId: string) => {
    return unlockedLessons.has(lessonId)
  }

  const isLessonCompletedLocal = (lessonId: string) => {
    return isLessonCompleted(lessonId)
  }

  const getLessonStatus = (lessonId: string, index: number) => {
    if (isLessonCompletedLocal(lessonId)) return 'completed'
    if (isLessonUnlocked(lessonId)) return 'unlocked'
    if (index === 0) return 'unlocked' // First lesson is always unlocked
    return 'locked'
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200' // Success for beginner (positive start)
      case 'INTERMEDIATE':
        return 'bg-theme-primary-100 text-theme-primary-800 dark:bg-theme-primary-900 dark:text-theme-primary-200' // Primary for intermediate (main level)
      case 'ADVANCED':
        return 'bg-theme-info-100 text-theme-info-800 dark:bg-theme-info-900 dark:text-theme-info-200' // Info for advanced (knowledge)
      case 'EXPERT':
        return 'bg-theme-warning-100 text-theme-warning-800 dark:bg-theme-warning-900 dark:text-theme-warning-200' // Warning for expert (challenging)
      default:
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-800 dark:text-theme-neutral-200' // Neutral default
    }
  }

  const handleRegistrationSuccess = async (registrationData: any) => {
    try {
      // Create database enrollment for paid courses
      if (!registrationData.course.isFree) {
        const enrollmentResponse = await fetch('/api/courses/enroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: registrationData.course.id,
            transactionId: registrationData.transactionId,
            paymentStatus: registrationData.paymentStatus
          })
        })

        if (!enrollmentResponse.ok) {
          console.error('Failed to create database enrollment')
        }
      }

      // Add to client-side registration for free courses
      if (registrationData.course.isFree) {
        const registration = {
          id: `reg-${Date.now()}`,
          courseId: typeof registrationData.course.id === 'string' ? registrationData.course.id : parseInt(registrationData.course.id) || 0,
          courseTitle: registrationData.course.title,
          courseType: registrationData.course.type as 'online' | 'academy',
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
      }

      setIsRegistrationOpen(false)
      setSelectedCourse(null)
      
      // Refresh enrolled courses after successful payment
      await refreshEnrolledCourses()
      
      // Refresh course data to update counters
      try {
        const fetchedCourses = await fetchCourses()
        setCourses(fetchedCourses)
      } catch (error) {
        console.error('Error refreshing courses after enrollment:', error)
      }
    } catch (error) {
      console.error('Error handling registration success:', error)
    }
  }
  
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Banners */}
      <BannerDisplay pagePath="/courses" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 rounded-lg bg-theme-primary">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className={textHierarchy.largeHeading(isDarkMode)}>Courses</h1>
              <p className={textHierarchy.subheading()}>
                Master forex trading with our comprehensive course library.
              </p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-2 ${
                viewMode === 'grid'
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-900 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
              </div>
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 ${
                viewMode === 'list'
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-900 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col space-y-1 w-4 h-4">
                <div className="w-full h-1 bg-current rounded-sm"></div>
                <div className="w-full h-1 bg-current rounded-sm"></div>
                <div className="w-full h-1 bg-current rounded-sm"></div>
              </div>
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" 
        : "space-y-3 sm:space-y-4"
      }>
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse bg-theme-card border-theme-border">
              <CardHeader>
                <div className="h-4 bg-theme-bg-secondary rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-theme-bg-secondary rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-theme-bg-secondary rounded"></div>
                  <div className="h-3 bg-theme-bg-secondary rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <GraduationCap className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No courses available</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Check back later for new courses!</p>
          </div>
        ) : (
          courses.map((course) => (
          <Card key={course.id} className={`group hover:shadow-xl transition-all duration-300 overflow-hidden ${viewMode === 'list' ? 'flex flex-row' : ''} bg-theme-card border-theme-border hover:bg-theme-card-hover`}>
            {/* Course Cover Image */}
            <div className={`relative overflow-hidden ${viewMode === 'list' ? 'h-32 w-48 flex-shrink-0' : 'h-36 sm:h-40 md:h-48 w-full'}`}>
              {course.coverUrl ? (
                <img
                  src={course.coverUrl}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-orange-500 flex items-center justify-center">
                  <GraduationCap className="h-16 w-16 text-white opacity-80" />
                </div>
              )}
              
              {/* Overlay with badges */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Badge 
                    variant={course.isFree ? "default" : "secondary"}
                    className={`border-0 text-xs sm:text-sm px-2 py-1 font-medium ${
                      isDarkMode 
                        ? 'bg-black text-white shadow-lg' 
                        : course.isFree 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {course.isFree ? 'Free' : 'Premium'}
                  </Badge>
                  {hasAccess(course) && (
                    <Badge 
                      variant="default"
                      className={`border-0 text-xs sm:text-sm px-2 py-1 font-medium ${
                        isDarkMode 
                          ? 'bg-green-600 text-white shadow-lg' 
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      Enrolled
                    </Badge>
                  )}
                </div>
                <div className={`flex items-center space-x-1 text-xs sm:text-sm backdrop-blur-sm bg-black/20 px-2 py-1 rounded-full transition-colors duration-200 text-white`}>
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{course.views}</span>
                </div>
              </div>

              {/* Level badge on bottom right */}
              <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4">
                <Badge className={`border-0 text-xs sm:text-sm px-2 py-1 font-medium ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white shadow-lg' 
                    : course.level === 'BEGINNER'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {course.level}
                </Badge>
              </div>
            </div>

            <CardContent className={`${viewMode === 'list' ? 'p-3 sm:p-4 flex-1' : 'p-3 sm:p-4 md:p-6'}`}>
              <div className="space-y-2 sm:space-y-3">
                {/* Course Title and Description */}
                <div>
                  <CardTitle className={`text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {course.title}
                  </CardTitle>
                  <CardDescription className={`text-xs sm:text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {course.shortDescription || course.description}
                  </CardDescription>
                </div>

                {/* Instructor */}
                <div className="flex items-center text-xs sm:text-sm">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    By <span className="font-medium">{course.instructor}</span>
                  </span>
                </div>

                {/* Course Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center space-x-1">
                      <Clock className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`} />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {Math.round((course.duration || 0) / 60)}h
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Video className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`} />
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>{course.totalLessons} lessons</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`} />
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>{course.enrollments}</span>
                  </div>
                </div>

                {/* Price and Action Button */}
                <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-1 sm:pt-2 ${viewMode === 'list' ? 'flex-col space-y-2' : ''}`}>
                  <div className={`${viewMode === 'list' ? 'text-left' : 'text-center sm:text-right'}`}>
                    {course.isFree ? (
                      <span className={`font-bold text-green-500 ${viewMode === 'list' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-2xl'}`}>Free</span>
                    ) : (
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} ${viewMode === 'list' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-2xl'}`}>${course.priceUSD}</span>
                    )}
                  </div>
                  
                  <Button 
                    className={`${viewMode === 'list' ? 'w-full h-9 sm:h-10' : 'w-full sm:w-auto px-4 sm:px-6 py-2 h-9 sm:h-10'} text-xs sm:text-sm ${
                      isDarkMode 
                        ? hasAccess(course) 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
                        : hasAccess(course)
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                    variant="outline"
                    onClick={() => hasAccess(course) ? handleViewCourse(course) : handleEnroll(course)}
                  >
                    <Play className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {hasAccess(course) 
                      ? 'View Course' 
                      : course.isFree 
                        ? 'Start Course' 
                        : 'Enroll Now'
                    }
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>

      {/* Stats */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1 sm:mb-2">{courses.length}</div>
            <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-theme-success mb-1 sm:mb-2">
              {courses.filter(c => c.isFree).length}
            </div>
            <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Free Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1 sm:mb-2">
              {courses.filter(c => !c.isFree).length}
            </div>
            <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Premium Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-theme-accent mb-1 sm:mb-2">
              {courses.reduce((acc, c) => acc + c.totalLessons, 0)}
            </div>
            <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Lessons</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Viewing Modal */}
      {selectedCourseForViewing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-theme-card rounded-lg max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex flex-col lg:flex-row h-full">
              {/* Video Player Section */}
              <div className="flex-1 p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedCourseForViewing.title}
                  </h2>
                  <Button variant="ghost" onClick={() => setSelectedCourseForViewing(null)}>
                    ×
                  </Button>
                </div>
                
                {currentLesson && (
                  <div className="space-y-4">
                    {/* Video Player */}
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                      {(() => {
                        const videoUrl = currentLesson.videoUrl
                        const videoSource = parseVideoUrl(videoUrl)
                        
                        // Handle YouTube videos with minimal branding
                        if (videoSource.type === 'youtube' && videoSource.embedUrl) {
                          return (
                            <iframe
                              src={videoSource.embedUrl}
                              title={currentLesson.title}
                              className="w-full h-full"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              frameBorder="0"
                            />
                          )
                        }
                        
                        // Handle Vimeo videos
                        if (videoSource.type === 'vimeo' && videoSource.embedUrl) {
                          return (
                            <iframe
                              src={videoSource.embedUrl}
                              title={currentLesson.title}
                              className="w-full h-full"
                              allowFullScreen
                              allow="autoplay; fullscreen; picture-in-picture"
                              frameBorder="0"
                            />
                          )
                        }
                        
                        // Handle direct video files with custom player
                        if (videoSource.type === 'direct' || isDirectVideoFile(videoUrl)) {
                          return (
                            <VideoPlayer
                              src={videoUrl}
                              poster={currentLesson.thumbnailUrl}
                              title={currentLesson.title}
                              onEnded={() => handleLessonComplete(currentLesson.id)}
                              className="w-full h-full"
                            />
                          )
                        }
                        
                        // Check if it's a placeholder or invalid URL
                        if (videoUrl.includes('example.com') || videoUrl.includes('placeholder') || (!videoUrl.startsWith('http') && !videoUrl.startsWith('/uploads/'))) {
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <div className="text-center text-white">
                                <div className="mb-4">
                                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Video Not Available</h3>
                                <p className="text-gray-300 mb-4">This lesson video is not yet available.</p>
                                <div className="text-sm text-gray-400">
                                  <p>Duration: {formatDuration(currentLesson.durationSec)}</p>
                                  <p>Status: {currentLesson.isPreview ? 'Preview' : 'Coming Soon'}</p>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        
                        // Fallback for other video types
                        return (
                          <VideoPlayer
                            src={videoUrl}
                            poster={currentLesson.thumbnailUrl}
                            title={currentLesson.title}
                            onEnded={() => handleLessonComplete(currentLesson.id)}
                            className="w-full h-full"
                          />
                        )
                      })()}
                    </div>

                    {/* Video Navigation Controls */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={handlePreviousLesson}
                        disabled={!selectedCourseForViewing || selectedCourseForViewing.lessons.findIndex(lesson => lesson.id === currentLesson.id) === 0}
                        className="flex items-center space-x-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </Button>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleLessonComplete(currentLesson.id)}
                          disabled={isLessonCompletedLocal(currentLesson.id)}
                          className="bg-theme-success hover:bg-theme-success-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {isLessonCompletedLocal(currentLesson.id) ? 'Completed' : 'Mark Complete'}
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        onClick={handleNextLesson}
                        disabled={!selectedCourseForViewing || 
                          selectedCourseForViewing.lessons.findIndex(lesson => lesson.id === currentLesson.id) === selectedCourseForViewing.lessons.length - 1 ||
                          !isLessonUnlocked(selectedCourseForViewing.lessons[selectedCourseForViewing.lessons.findIndex(lesson => lesson.id === currentLesson.id) + 1]?.id || '')
                        }
                        className="flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentLesson.title}
                      </h3>
                      <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currentLesson.description}
                      </p>
                      <div className={`flex items-center space-x-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(currentLesson.durationSec)}</span>
                        </div>
                        {currentLesson.isPreview && (
                          <Badge variant="secondary" className="bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200">
                            Preview
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Lessons Sidebar */}
              <div className="w-full lg:w-80 bg-theme-bg-secondary p-3 sm:p-6 overflow-y-auto max-h-96 lg:max-h-none">
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Course Lessons ({selectedCourseForViewing.totalLessons})
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-theme-bg-tertiary rounded-full h-2 mb-2">
                    <div 
                      className="bg-theme-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(completedLessons.size / selectedCourseForViewing.lessons.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {completedLessons.size} of {selectedCourseForViewing.lessons.length} lessons completed
                  </p>
                </div>
                
                <div className="space-y-3">
                  {selectedCourseForViewing.lessons.map((lesson, index) => {
                    const status = getLessonStatus(lesson.id, index)
                    const isCurrent = currentLesson?.id === lesson.id
                    
                    return (
                      <div
                        key={lesson.id}
                        className={`p-4 rounded-lg transition-all duration-200 ${
                          isCurrent
                            ? 'bg-white dark:bg-gray-800 border-2 border-theme-primary shadow-md'
                            : status === 'completed'
                            ? 'bg-white dark:bg-gray-800 border border-theme-success-200 dark:border-theme-success-700'
                            : status === 'unlocked'
                            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-60'
                        }`}
                        onClick={() => status === 'unlocked' || status === 'completed' ? setCurrentLesson(lesson) : null}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Status Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {status === 'completed' ? (
                              <div className="w-6 h-6 bg-theme-success rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            ) : status === 'unlocked' ? (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isCurrent ? 'bg-theme-primary' : 'bg-theme-primary-100 dark:bg-theme-primary-900'
                              }`}>
                                <Play className={`h-3 w-3 ${
                                  isCurrent ? 'text-white' : 'text-theme-primary dark:text-theme-primary-400'
                                }`} />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-theme-bg-tertiary rounded-full flex items-center justify-center">
                                <Lock className="h-3 w-3 text-theme-text-tertiary" />
                              </div>
                            )}
                          </div>
                          
                          {/* Lesson Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`text-sm font-medium truncate ${
                                isCurrent 
                                  ? 'text-blue-600 dark:text-blue-400' 
                                  : status === 'completed'
                                  ? 'text-green-600 dark:text-green-400'
                                  : status === 'unlocked'
                                  ? isDarkMode ? 'text-white' : 'text-gray-900'
                                  : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                {index + 1}. {lesson.title}
                              </p>
                              {status === 'completed' && (
                                <Badge variant="secondary" className="text-xs bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200">
                                  Done
                                </Badge>
                              )}
                            </div>
                            
                            <p className={`text-xs truncate mb-2 ${
                              isCurrent 
                                ? 'text-blue-500 dark:text-blue-300' 
                                : status === 'completed'
                                ? 'text-green-500 dark:text-green-300'
                                : status === 'unlocked'
                                ? isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {lesson.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className={`text-xs ${
                                isCurrent 
                                  ? 'text-blue-500 dark:text-blue-400' 
                                  : status === 'completed'
                                  ? 'text-green-500 dark:text-green-400'
                                  : status === 'unlocked'
                                  ? isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                {formatDuration(lesson.durationSec)}
                              </span>
                              
                              {status === 'locked' && (
                                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                  Complete previous lesson
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Course Progress Summary */}
                <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-theme-primary rounded-full flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-theme-text">
                      Course Progress
                    </span>
                  </div>
                  <p className="text-xs text-theme-text-secondary mb-2">
                    Complete lessons sequentially to unlock the next video. Watch each video to completion to mark it as done.
                  </p>
                  <div className="flex items-center justify-between text-xs text-theme-text-tertiary">
                    <span>{completedLessons.size} completed</span>
                    <span>{unlockedLessons.size} unlocked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Popup */}
      <RegistrationPopup
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        course={selectedCourse ? {
          id: selectedCourse.id, // Keep as string since it's a database ID
          title: selectedCourse.title,
          description: selectedCourse.description,
          price: selectedCourse.priceUSD,
          currency: 'USD',
          level: selectedCourse.level,
          duration: `${Math.round((selectedCourse.duration || 0) / 60)}h`,
          type: 'online' as const,
          instructor: selectedCourse.instructor,
          enrolled: selectedCourse.enrollments
        } : null}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  )
}