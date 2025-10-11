'use client'

import { useState, useEffect } from 'react'

export interface UserRole {
  id: string
  role: string
  email: string
  name: string
}

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/user/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const user = await response.json()
          setUserRole(user)
        } else {
          console.error('Failed to fetch user role:', response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  const isAdmin = userRole?.role && ['SUPERADMIN', 'ADMIN', 'EDITOR', 'ANALYST', 'SUPPORT'].includes(userRole.role)
  const isStudent = userRole?.role === 'STUDENT'

  return {
    userRole,
    isLoading,
    isAdmin,
    isStudent
  }
}
