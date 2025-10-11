'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/lib/optimized-theme-context'

export default function TestAdminActionsPage() {
  const { isDarkMode } = useTheme()
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<string>('')

  const createTestCourse = async () => {
    setIsCreating(true)
    setResult('Creating test course...')
    
    try {
      const courseData = {
        title: `Test Course - ${new Date().toLocaleString()}`,
        slug: `test-course-${Date.now()}`,
        description: 'This is a test course created to verify the notification system is working correctly.',
        shortDescription: 'Test course for notifications',
        priceUSD: 99.99,
        level: 'INTERMEDIATE',
        status: 'PUBLISHED',
        instructor: 'XEN Forex',
        isFree: false,
        tags: ['test', 'notifications', 'course'],
        lessons: [
          {
            title: 'Test Lesson 1',
            description: 'First test lesson',
            videoUrl: 'https://example.com/test1',
            durationSec: 1200,
            order: 1,
            isPreview: true,
            isPublished: true
          }
        ]
      }

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData)
      })

      if (response.ok) {
        const course = await response.json()
        setResult(`✅ Course created successfully!\nTitle: ${course.title}\nSlug: ${course.slug}\n\nCheck the notifications page to see if students received notifications.`)
      } else {
        const error = await response.json()
        setResult(`❌ Failed to create course: ${error.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }
  }

  const createTestResource = async () => {
    setIsCreating(true)
    setResult('Creating test resource...')
    
    try {
      const resourceData = {
        title: `Test Resource - ${new Date().toLocaleString()}`,
        slug: `test-resource-${Date.now()}`,
        description: 'This is a test resource created to verify the notification system is working correctly.',
        type: 'ARTICLE',
        category: 'Test',
        url: 'https://example.com/test-resource',
        thumbnail: 'https://example.com/thumbnail.jpg',
        duration: 900, // 15 minutes
        isPremium: false,
        priceUSD: null,
        tags: ['test', 'notifications', 'resource']
      }

      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData)
      })

      if (response.ok) {
        const resource = await response.json()
        setResult(`✅ Resource created successfully!\nTitle: ${resource.title}\nType: ${resource.type}\n\nCheck the notifications page to see if students received notifications.`)
      } else {
        const error = await response.json()
        setResult(`❌ Failed to create resource: ${error.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }
  }

  const checkNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setResult(`📊 Notification Statistics:\nTotal: ${data.notifications.length}\nUnread: ${data.unreadCount}\n\nRecent notifications:\n${data.notifications.slice(0, 3).map((n: any, i: number) => `${i + 1}. ${n.title}`).join('\n')}`)
      } else {
        setResult('❌ Failed to fetch notifications')
      }
    } catch (error) {
      setResult(`❌ Error fetching notifications: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Test Admin Actions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the notification system by creating courses and resources as an admin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📚</span>
                <span>Create Test Course</span>
              </CardTitle>
              <CardDescription>
                Create a test course and verify that all students receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createTestCourse}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Create Test Course'}
              </Button>
            </CardContent>
          </Card>

          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📄</span>
                <span>Create Test Resource</span>
              </CardTitle>
              <CardDescription>
                Create a test resource and verify that all students receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createTestResource}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Create Test Resource'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🔔</span>
              <span>Check Notifications</span>
            </CardTitle>
            <CardDescription>
              Check current notification statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={checkNotifications}
              className="w-full mb-4"
            >
              Check Notifications
            </Button>
            
            {result && (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Testing Instructions:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200 text-sm">
            <li>Click "Create Test Course" to create a course and send notifications to all students</li>
            <li>Click "Create Test Resource" to create a resource and send notifications to all students</li>
            <li>Open a new browser tab and login as a student user</li>
            <li>Navigate to the notifications page to see the new notifications</li>
            <li>Check the sidebar for NEW badges on Courses and Resources</li>
            <li>Open the right notification panel to see recent notifications</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
