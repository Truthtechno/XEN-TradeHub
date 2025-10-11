'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface LessonProgress {
  completed: boolean
  completedAt: Date | null
}

interface LessonProgressContextType {
  progress: Record<string, LessonProgress>
  isLoading: boolean
  isLessonCompleted: (lessonId: string) => boolean
  markLessonComplete: (courseId: string, lessonId: string) => Promise<void>
  markLessonIncomplete: (courseId: string, lessonId: string) => Promise<void>
  loadProgress: (courseId: string) => Promise<void>
}

const LessonProgressContext = createContext<LessonProgressContextType | undefined>(undefined)

export const LessonProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({})
  const [isLoading, setIsLoading] = useState(false)

  const loadProgress = useCallback(async (courseId: string) => {
    setIsLoading(true)
    try {
      // First try to load from localStorage
      const storageKey = `lesson-progress-${courseId}`
      const localProgress = JSON.parse(localStorage.getItem(storageKey) || '{}')
      
      // Convert localStorage data to the expected format
      const progressMap = Object.keys(localProgress).reduce((acc, lessonId) => {
        acc[lessonId] = {
          completed: localProgress[lessonId].completed,
          completedAt: localProgress[lessonId].completedAt ? new Date(localProgress[lessonId].completedAt) : null
        }
        return acc
      }, {} as Record<string, LessonProgress>)
      
      setProgress(progressMap)

      // Try to load from API as well (but don't fail if it doesn't work)
      try {
        const response = await fetch(`/api/courses/${courseId}/progress`)
        if (response.ok) {
          const data = await response.json()
          if (data.progress && Object.keys(data.progress).length > 0) {
            setProgress(data.progress)
          }
        }
      } catch (apiError) {
        console.warn('API error (using local progress):', apiError)
      }
    } catch (error) {
      console.error('Error loading lesson progress:', error)
      setProgress({})
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markLessonComplete = useCallback(async (courseId: string, lessonId: string) => {
    try {
      // Update local state immediately for better UX
      setProgress(prev => ({
        ...prev,
        [lessonId]: {
          completed: true,
          completedAt: new Date()
        }
      }))

      // Also save to localStorage as backup
      const storageKey = `lesson-progress-${courseId}`
      const existingProgress = JSON.parse(localStorage.getItem(storageKey) || '{}')
      existingProgress[lessonId] = {
        completed: true,
        completedAt: new Date().toISOString()
      }
      localStorage.setItem(storageKey, JSON.stringify(existingProgress))

      // Try to save to API (but don't fail if it doesn't work)
      try {
        const response = await fetch(`/api/courses/${courseId}/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lessonId,
            completed: true
          })
        })

        if (response.ok) {
          console.log('Progress saved to API successfully')
        } else {
          console.warn('Failed to save progress to API, but local progress saved')
        }
      } catch (apiError) {
        console.warn('API error (progress saved locally):', apiError)
      }

      // Success - no return value needed
    } catch (error) {
      console.error('Error marking lesson complete:', error)
      throw error
    }
  }, [])

  const markLessonIncomplete = useCallback(async (courseId: string, lessonId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          completed: false
        })
      })

      if (response.ok) {
        setProgress(prev => ({
          ...prev,
          [lessonId]: {
            completed: false,
            completedAt: null
          }
        }))
      } else {
        console.error('Failed to mark lesson incomplete:', response.statusText)
        throw new Error('Failed to mark lesson incomplete')
      }
    } catch (error) {
      console.error('Error marking lesson incomplete:', error)
      throw error
    }
  }, [])

  const isLessonCompleted = useCallback((lessonId: string) => {
    return progress[lessonId]?.completed || false
  }, [progress])

  return (
    <LessonProgressContext.Provider value={{ 
      progress, 
      isLoading, 
      isLessonCompleted, 
      markLessonComplete, 
      markLessonIncomplete, 
      loadProgress 
    }}>
      {children}
    </LessonProgressContext.Provider>
  )
}

export const useLessonProgress = () => {
  const context = useContext(LessonProgressContext)
  if (context === undefined) {
    throw new Error('useLessonProgress must be used within a LessonProgressProvider')
  }
  return context
}
