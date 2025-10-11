'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface EnrolledCourse {
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
  duration: number | null
  totalLessons: number
  views: number
  rating: number | null
  tags: string[]
  lessons: any[]
  enrollments: number
  progress: number
  completed: boolean
  enrolledAt: string
  completedAt: string | null
}

interface EnrolledCoursesContextType {
  enrolledCourses: EnrolledCourse[]
  isLoading: boolean
  isEnrolled: (courseId: string) => boolean
  getEnrollment: (courseId: string) => EnrolledCourse | null
  refreshEnrolledCourses: () => Promise<void>
}

const EnrolledCoursesContext = createContext<EnrolledCoursesContextType | undefined>(undefined)

export function EnrolledCoursesProvider({ children }: { children: ReactNode }) {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/courses/enrolled')
      
      if (response.ok) {
        const data = await response.json()
        setEnrolledCourses(data.enrolledCourses || [])
        console.log('Fetched enrolled courses:', data.enrolledCourses?.length || 0)
      } else {
        console.error('Failed to fetch enrolled courses:', response.status)
        setEnrolledCourses([])
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
      setEnrolledCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  const checkEnrollment = async (courseId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/courses/enrolled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId })
      })

      if (response.ok) {
        const data = await response.json()
        return data.isEnrolled
      }
      return false
    } catch (error) {
      console.error('Error checking enrollment:', error)
      return false
    }
  }

  const isEnrolled = (courseId: string): boolean => {
    return enrolledCourses.some(course => course.id === courseId)
  }

  const getEnrollment = (courseId: string): EnrolledCourse | null => {
    return enrolledCourses.find(course => course.id === courseId) || null
  }

  const refreshEnrolledCourses = async () => {
    await fetchEnrolledCourses()
  }

  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  return (
    <EnrolledCoursesContext.Provider
      value={{
        enrolledCourses,
        isLoading,
        isEnrolled,
        getEnrollment,
        refreshEnrolledCourses
      }}
    >
      {children}
    </EnrolledCoursesContext.Provider>
  )
}

export function useEnrolledCourses() {
  const context = useContext(EnrolledCoursesContext)
  if (context === undefined) {
    throw new Error('useEnrolledCourses must be used within an EnrolledCoursesProvider')
  }
  return context
}
