'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, DollarSign, Edit, Eye, Filter, MoreHorizontal, Play, Plus, Search, Trash2, TrendingUp, Users, Video } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import CourseForm from '@/components/admin/course-form'

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

export default function CoursesPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/courses')
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      const data = await response.json()
      console.log('Admin courses data:', data)
      console.log('Total courses:', data.courses?.length)
      console.log('Total lessons:', data.courses?.reduce((acc: number, c: any) => acc + c.totalLessons, 0))
      console.log('Total students:', data.courses?.reduce((acc: number, c: any) => acc + c.enrollments, 0))
      console.log('Total revenue:', data.courses?.reduce((acc: number, c: any) => acc + c.revenue, 0))
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleCreateCourse = () => {
    setEditingCourse(null)
    setShowCourseForm(true)
  }

  const handleEditCourse = (course: Course) => {
    try {
      setEditingCourse(course)
      setShowCourseForm(true)
    } catch (error) {
      console.error('Error opening course editor:', error)
      alert('Failed to open course editor. Please try again.')
    }
  }

  const handleViewCourse = (course: Course) => {
    try {
      // Open the public courses page in a new tab
      const url = `/courses?course=${course.slug}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error opening course view:', error)
      alert('Failed to open course view. Please try again.')
    }
  }

  const handleManageLessons = (course: Course) => {
    try {
      // Set editing course and show form focused on content tab
    setEditingCourse(course)
    setShowCourseForm(true)
      // The form will start on the content tab for lesson management
    } catch (error) {
      console.error('Error opening lesson manager:', error)
      alert('Failed to open lesson manager. Please try again.')
    }
  }

  const handleViewStudents = (course: Course) => {
    try {
      // TODO: Implement student management modal/page
      alert(`👥 Student Management for "${course.title}"\n\nThis feature is coming soon!\n\nYou'll be able to:\n• View enrolled students\n• Track their progress\n• Manage their access\n• Send notifications`)
    } catch (error) {
      console.error('Error opening student view:', error)
      alert('Failed to open student view. Please try again.')
    }
  }

  const handleViewAnalytics = (course: Course) => {
    try {
      // TODO: Implement analytics dashboard
      alert(`📊 Analytics for "${course.title}"\n\nThis feature is coming soon!\n\nYou'll be able to view:\n• Course performance metrics\n• Student engagement data\n• Revenue analytics\n• Completion rates\n• Popular content insights`)
    } catch (error) {
      console.error('Error opening analytics:', error)
      alert('Failed to open analytics. Please try again.')
    }
  }

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return

    try {
      setIsDeleting(true)
      console.log('Deleting course:', courseToDelete.id, courseToDelete.title)
      
      const response = await fetch(`/api/admin/courses/${courseToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Delete response status:', response.status)

      if (response.ok) {
        alert(`✅ Course "${courseToDelete.title}" deleted successfully!`)
        // Refresh the courses list
        await fetchCourses()
      } else {
        const errorData = await response.json()
        console.error('Delete error response:', errorData)
        throw new Error(errorData.error || `Failed to delete course (${response.status})`)
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      alert(`❌ Error deleting course: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setCourseToDelete(null)
    }
  }

  const handleSaveCourse = async (courseData: any) => {
    setIsSaving(true)
    try {
      if (editingCourse) {
        // Update existing course
        console.log('Updating course:', editingCourse.id, courseData)
        const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(courseData),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update course')
        }
        
        console.log('Course updated successfully')
        alert(`✅ Course "${courseData.title}" updated successfully!`)
      } else {
        // Create new course
        console.log('Creating new course:', courseData)
        const response = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(courseData),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create course')
        }
        
        console.log('Course created successfully')
        alert(`✅ Course "${courseData.title}" created successfully!`)
      }
      
      // Refresh courses list
      await fetchCourses()
      
      setShowCourseForm(false)
      setEditingCourse(null)
    } catch (error) {
      console.error('Failed to save course:', error)
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelForm = () => {
    setShowCourseForm(false)
    setEditingCourse(null)
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter
    return matchesSearch && matchesStatus && matchesLevel
  })

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200'
      case 'INTERMEDIATE':
        return 'bg-theme-primary-100 text-theme-primary-800 dark:bg-theme-primary-900 dark:text-theme-primary-200'
      case 'ADVANCED':
        return 'bg-theme-accent-100 text-theme-accent-800 dark:bg-theme-accent-900 dark:text-theme-accent-200'
      case 'EXPERT':
        return 'bg-theme-error-100 text-theme-error-800 dark:bg-theme-error-900 dark:text-theme-error-200'
      default:
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200'
      case 'DRAFT':
        return 'bg-theme-warning-100 text-theme-warning-800 dark:bg-theme-warning-900 dark:text-theme-warning-200'
      default:
        return 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-900 dark:text-theme-neutral-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0s'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m${secs > 0 ? ` ${secs}s` : ''}`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={textHierarchy.largeHeading(isDarkMode)}>Courses</h1>
          <p className={`${textHierarchy.subheading()} mt-1`}>
            Manage courses, lessons, and track performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchCourses} 
            variant="outline" 
            className="flex items-center gap-2 border-theme-border hover:bg-theme-bg-secondary"
            disabled={isLoading}
          >
            <Search className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreateCourse} variant="theme-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)} truncate`}>Total Courses</p>
                <p className={`text-xl sm:text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>{courses.length}</p>
                <p className={`text-xs ${textHierarchy.cardDescription()} truncate`}>
                  {courses.filter(c => c.isFree).length} free, {courses.filter(c => !c.isFree).length} paid
                </p>
              </div>
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-theme-primary flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)} truncate`}>Total Lessons</p>
                <p className={`text-xl sm:text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  {courses.reduce((acc, c) => acc + c.totalLessons, 0)}
                </p>
                <p className={`text-xs ${textHierarchy.cardDescription()} truncate`}>
                  {formatDuration(courses.reduce((acc, c) => acc + (c.duration || 0), 0))} total duration
                </p>
              </div>
              <Video className="h-6 w-6 sm:h-8 sm:w-8 text-theme-success flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)} truncate`}>Total Students</p>
                <p className={`text-xl sm:text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  {courses.reduce((acc, c) => acc + c.enrollments, 0)}
                </p>
                <p className={`text-xs ${textHierarchy.cardDescription()} truncate`}>
                  {courses.filter(c => c.enrollments > 0).length} courses with students
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-theme-accent flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${textHierarchy.metaText(isDarkMode)} truncate`}>Total Revenue</p>
                <p className={`text-xl sm:text-2xl font-bold ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  {formatCurrency(courses.reduce((acc, c) => acc + c.revenue, 0))}
                </p>
                <p className={`text-xs ${textHierarchy.cardDescription()} truncate`}>
                  From {courses.filter(c => !c.isFree).length} paid courses
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-theme-warning flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-theme-card border-theme-border">
        <CardHeader>
          <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-tertiary h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-theme-bg border-theme-border text-theme-text"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg text-theme-text"
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg text-theme-text"
              >
                <option value="all">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="bg-theme-card border-theme-border">
        <CardHeader>
          <CardTitle className={textHierarchy.sectionHeading(isDarkMode)}>Courses ({filteredCourses.length})</CardTitle>
          <CardDescription className={textHierarchy.subheading()}>
            Manage course content and track performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-theme-border">
                  <TableHead className="min-w-[300px] text-theme-text">Course</TableHead>
                  <TableHead className="hidden sm:table-cell text-theme-text">Type</TableHead>
                  <TableHead className="hidden md:table-cell text-theme-text">Level</TableHead>
                  <TableHead className="hidden lg:table-cell text-theme-text">Price</TableHead>
                  <TableHead className="hidden sm:table-cell text-theme-text">Lessons</TableHead>
                  <TableHead className="hidden md:table-cell text-theme-text">Duration</TableHead>
                  <TableHead className="hidden lg:table-cell text-theme-text">Students</TableHead>
                  <TableHead className="hidden lg:table-cell text-theme-text">Revenue</TableHead>
                  <TableHead className="hidden md:table-cell text-theme-text">Updated</TableHead>
                <TableHead className="w-[200px] text-theme-text">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id} className="border-theme-border hover:bg-theme-bg-secondary">
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      {course.coverUrl ? (
                        <img 
                          src={course.coverUrl} 
                          alt={course.title}
                          className="w-16 h-16 rounded-lg object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-theme-primary via-theme-accent to-theme-warning rounded-lg flex items-center justify-center shadow-md">
                          <BookOpen className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className={`font-medium ${textHierarchy.cardTitle(isDarkMode)} truncate`}>{course.title}</div>
                        <div className={`text-sm ${textHierarchy.cardDescription()}`}>{course.instructor}</div>
                        {course.shortDescription && (
                          <div className={`text-xs ${textHierarchy.metaText(isDarkMode)} mt-1 truncate`}>
                            {course.shortDescription}
                          </div>
                        )}
                        {/* Mobile: Show key info below title */}
                        <div className="sm:hidden mt-2 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge className={course.isFree ? 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200' : 'bg-theme-primary-100 text-theme-primary-800 dark:bg-theme-primary-900 dark:text-theme-primary-200'}>
                              {course.isFree ? 'Free' : 'Paid'}
                            </Badge>
                            <Badge className={getLevelBadgeColor(course.level)}>
                              {course.level}
                            </Badge>
                          </div>
                          <div className={`flex items-center space-x-4 text-xs ${textHierarchy.cardDescription()}`}>
                            <span className="flex items-center space-x-1">
                              <Video className="h-3 w-3" />
                              <span>{course.totalLessons} lessons</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{course.enrollments} students</span>
                            </span>
                            {!course.isFree && (
                              <span className={`font-medium text-theme-success`}>
                                {formatCurrency(course.revenue)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={course.isFree ? 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200' : 'bg-theme-primary-100 text-theme-primary-800 dark:bg-theme-primary-900 dark:text-theme-primary-200'}>
                      {course.isFree ? 'Free' : 'Paid'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className={getLevelBadgeColor(course.level)}>
                      {course.level}
                    </Badge>
                  </TableCell>
                  <TableCell className={`hidden lg:table-cell font-medium ${textHierarchy.cardTitle(isDarkMode)}`}>
                    {course.isFree ? 'Free' : formatCurrency(course.priceUSD)}
                  </TableCell>
                  <TableCell className={`hidden sm:table-cell ${textHierarchy.cardTitle(isDarkMode)}`}>
                    <div className="flex items-center space-x-1">
                      <Video className="h-4 w-4 text-theme-text-tertiary" />
                      <span>{course.totalLessons}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`hidden md:table-cell ${textHierarchy.cardTitle(isDarkMode)}`}>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-theme-text-tertiary" />
                      <span>{formatDuration(course.duration || null)}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`hidden lg:table-cell ${textHierarchy.cardTitle(isDarkMode)}`}>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-theme-text-tertiary" />
                      <span>{course.enrollments}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`hidden lg:table-cell ${textHierarchy.cardTitle(isDarkMode)}`}>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-theme-text-tertiary" />
                      <span>{formatCurrency(course.revenue)}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`hidden md:table-cell ${textHierarchy.cardTitle(isDarkMode)}`}>
                    {formatDate(course.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {/* Direct Delete Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourse(course)}
                        className="text-theme-error hover:text-theme-error-700 hover:bg-theme-error-50 dark:hover:bg-theme-error-900 border-theme-error hover:border-theme-error-300"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      
                      {/* More Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-theme-bg-secondary">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-theme-card border-theme-border">
                          <DropdownMenuLabel className={textHierarchy.cardTitle(isDarkMode)}>More Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewCourse(course)} className="text-theme-text hover:bg-theme-bg-secondary">
                            <Eye className="mr-2 h-4 w-4" />
                            View Course
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCourse(course)} className="text-theme-text hover:bg-theme-bg-secondary">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Course
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleManageLessons(course)} className="text-theme-text hover:bg-theme-bg-secondary">
                            <Video className="mr-2 h-4 w-4" />
                            Manage Lessons
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewStudents(course)} className="text-theme-text hover:bg-theme-bg-secondary">
                            <Users className="mr-2 h-4 w-4" />
                            View Students
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewAnalytics(course)} className="text-theme-text hover:bg-theme-bg-secondary">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Analytics
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-theme-card border-theme-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textHierarchy.largeHeading(isDarkMode)}`}>
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                <Button variant="ghost" onClick={handleCancelForm} className="hover:bg-theme-bg-secondary">
                  ×
                </Button>
              </div>
              <CourseForm
                initialData={editingCourse || undefined}
                onSubmit={handleSaveCourse}
                onCancel={handleCancelForm}
                isLoading={isSaving}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-theme-card border-theme-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <Trash2 className="h-8 w-8 text-theme-error" />
              </div>
              <div className="ml-3">
                <h3 className={`text-lg font-medium ${textHierarchy.sectionHeading(isDarkMode)}`}>
                  Delete Course
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className={`text-sm ${textHierarchy.cardDescription()} mb-4`}>
                Are you sure you want to delete <strong>"{courseToDelete.title}"</strong>?
              </p>
              
              <div className="bg-theme-error-50 dark:bg-theme-error-900/20 border border-theme-error-200 dark:border-theme-error-800 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="text-theme-error">⚠️</div>
                  </div>
                  <div className="ml-3">
                    <h4 className={`text-sm font-medium text-theme-error-800 dark:text-theme-error-200`}>
                      This action cannot be undone
                    </h4>
                    <div className={`mt-2 text-sm text-theme-error-700 dark:text-theme-error-300`}>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Permanently delete the course</li>
                        <li>Remove all associated lessons</li>
                        <li>Cancel all student enrollments</li>
                        <li>Delete all course data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setCourseToDelete(null)
                }}
                disabled={isDeleting}
                className="border-theme-border hover:bg-theme-bg-secondary"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteCourse}
                disabled={isDeleting}
                className="bg-theme-error hover:bg-theme-error-700"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Course
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
