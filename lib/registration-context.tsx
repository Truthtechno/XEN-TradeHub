'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CourseRegistration {
  id: string
  courseId: string | number
  courseTitle: string
  courseType: 'online' | 'academy'
  studentName: string
  studentEmail: string
  registrationDate: string
  paymentStatus: 'completed' | 'pending' | 'failed'
  transactionId: string
  experienceLevel: string
  preferredYear?: string
  preferredMonth?: string
  motivation?: string
}

interface RegistrationContextType {
  registrations: CourseRegistration[]
  registeredCourseIds: Set<string | number>
  addRegistration: (registration: CourseRegistration) => void
  isRegistered: (courseId: string | number) => boolean
  getRegistration: (courseId: string | number) => CourseRegistration | undefined
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined)

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([])

  // Load registrations from localStorage on mount
  useEffect(() => {
    const savedRegistrations = localStorage.getItem('corefx-registrations')
    if (savedRegistrations) {
      try {
        const parsed = JSON.parse(savedRegistrations)
        setRegistrations(parsed)
      } catch (error) {
        console.error('Error loading registrations from localStorage:', error)
      }
    }
  }, [])

  // Save registrations to localStorage whenever registrations change
  useEffect(() => {
    localStorage.setItem('corefx-registrations', JSON.stringify(registrations))
  }, [registrations])

  const addRegistration = (registration: CourseRegistration) => {
    setRegistrations(prev => [...prev, registration])
  }

  const registeredCourseIds = new Set(registrations.map(r => r.courseId))

  const isRegistered = (courseId: string | number) => {
    return registeredCourseIds.has(Number(courseId))
  }

  const getRegistration = (courseId: string | number) => {
    return registrations.find(r => r.courseId === Number(courseId))
  }

  return (
    <RegistrationContext.Provider value={{
      registrations,
      registeredCourseIds,
      addRegistration,
      isRegistered,
      getRegistration
    }}>
      {children}
    </RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const context = useContext(RegistrationContext)
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider')
  }
  return context
}
