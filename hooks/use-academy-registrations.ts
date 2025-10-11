'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export function useAcademyRegistrations() {
  const { data: session, status } = useSession()
  const [userRegistrations, setUserRegistrations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchUserRegistrations = useCallback(async (email?: string) => {
    const userEmail = email || session?.user?.email
    if (!userEmail) {
      console.log('No email provided for fetching registrations')
      return
    }

    console.log('Fetching user registrations for:', userEmail)
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/user-registrations?email=${encodeURIComponent(userEmail)}`)
      console.log('User registrations API response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('User registrations data:', data)
        const classIds = data.registeredClassIds || []
        setUserRegistrations(classIds)
        console.log('Set userRegistrations to:', classIds)
        
        // Store in localStorage for persistence
        localStorage.setItem('academy-registrations', JSON.stringify(classIds))
        localStorage.setItem('user-email', userEmail)
        
        return classIds
      } else {
        console.error('Failed to fetch user registrations:', response.status, response.statusText)
        return []
      }
    } catch (error) {
      console.error('Error fetching user registrations:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.email])

  const isUserRegistered = useCallback((classId: string) => {
    const isRegistered = userRegistrations.includes(classId)
    console.log(`Checking registration for class ${classId}:`, {
      userRegistrations,
      isRegistered
    })
    return isRegistered
  }, [userRegistrations])

  const addRegistration = useCallback((classId: string) => {
    setUserRegistrations(prev => {
      const newRegistrations = [...prev, classId]
      localStorage.setItem('academy-registrations', JSON.stringify(newRegistrations))
      return newRegistrations
    })
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    const storedRegistrations = localStorage.getItem('academy-registrations')
    if (storedRegistrations) {
      try {
        const registrations = JSON.parse(storedRegistrations)
        setUserRegistrations(registrations)
        console.log('Loaded registrations from localStorage:', registrations)
      } catch (error) {
        console.error('Error parsing stored registrations:', error)
      }
    }
  }, [])

  // Load from database when session is available
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      console.log('Session authenticated, loading registrations from database')
      fetchUserRegistrations()
    }
  }, [status, session?.user?.email, fetchUserRegistrations])

  // Fallback: Try to load with stored email if no session
  useEffect(() => {
    if (status === 'unauthenticated' && userRegistrations.length === 0) {
      const storedEmail = localStorage.getItem('user-email')
      if (storedEmail) {
        console.log('No session but found stored email, trying to load registrations...')
        fetchUserRegistrations(storedEmail)
      }
    }
  }, [status, userRegistrations.length, fetchUserRegistrations])

  return {
    userRegistrations,
    isLoading,
    isUserRegistered,
    addRegistration,
    fetchUserRegistrations
  }
}
