'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { BookOpen, ChevronLeft, ChevronRight, Clock, DollarSign, Edit, Eye, Image, Play, Plus, Settings, Tag, Trash2, Upload, Users, Video, X } from 'lucide-react'
import { FileUploadEnhanced } from '@/components/ui/file-upload-enhanced'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface Lesson {
  id?: string
  title: string
  description: string
  videoUrl: string
  durationSec: number
  order: number
  isPreview: boolean
  isPublished: boolean
  thumbnailUrl?: string
}

interface CourseFormData {
  title: string
  slug: string
  description: string
  shortDescription: string
  priceUSD: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  status: 'DRAFT' | 'PUBLISHED'
  coverUrl: string | null
  instructor: string
  isFree: boolean
  tags: string[]
  lessons: Lesson[]
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>
  onSubmit: (data: CourseFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function CourseForm({ initialData, onSubmit, onCancel, isLoading = false }: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    priceUSD: initialData?.priceUSD || 0,
    level: initialData?.level || 'BEGINNER',
    status: initialData?.status || 'DRAFT',
    coverUrl: initialData?.coverUrl || null,
    instructor: initialData?.instructor || 'CoreFX',
    isFree: initialData?.isFree || false,
    tags: initialData?.tags || [],
    lessons: initialData?.lessons || []
  })

  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState('basic-info')
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    initialData ? new Set(['basic-info', 'content', 'media', 'settings']) : new Set(['basic-info'])
  )
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({
    title: '',
    description: '',
    videoUrl: '',
    durationSec: 0,
    order: formData.lessons.length + 1,
    isPreview: false,
    isPublished: true
  })
  
  // File upload states
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null)
  const [lessonThumbnailFile, setLessonThumbnailFile] = useState<File | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLessonChange = (index: number, field: keyof Lesson, value: any) => {
    const updatedLessons = [...formData.lessons]
    updatedLessons[index] = { ...updatedLessons[index], [field]: value }
    setFormData(prev => ({ ...prev, lessons: updatedLessons }))
  }

  const addLesson = () => {
    // Allow adding lesson if either title or videoUrl is provided
    if (newLesson.title || newLesson.videoUrl) {
      const lesson: Lesson = {
        id: `temp-${Date.now()}`,
        title: newLesson.title || `Lesson ${formData.lessons.length + 1}`,
        description: newLesson.description || '',
        videoUrl: newLesson.videoUrl || '',
        durationSec: newLesson.durationSec || 0,
        order: formData.lessons.length + 1,
        isPreview: newLesson.isPreview || false,
        isPublished: newLesson.isPublished || true,
        thumbnailUrl: newLesson.thumbnailUrl
      }
      
      setFormData(prev => ({
        ...prev,
        lessons: [...prev.lessons, lesson]
      }))
      
      setNewLesson({
        title: '',
        description: '',
        videoUrl: '',
        durationSec: 0,
        order: formData.lessons.length + 2,
        isPreview: false,
        isPublished: true,
        thumbnailUrl: ''
      })
      
      // Clear file states
      setLessonVideoFile(null)
      setLessonThumbnailFile(null)
    } else {
      alert('Please provide either a lesson title or upload a video file')
    }
  }

  const removeLesson = (index: number) => {
    const updatedLessons = formData.lessons.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, lessons: updatedLessons }))
  }

  const editLesson = (index: number) => {
    const lesson = formData.lessons[index]
    setNewLesson({
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      durationSec: lesson.durationSec,
      order: lesson.order,
      isPreview: lesson.isPreview,
      isPublished: lesson.isPublished,
      thumbnailUrl: lesson.thumbnailUrl
    })
    
    // Remove the lesson from the list (it will be re-added when saved)
    removeLesson(index)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const generateSlug = (title: string) => {
    if (!title || title.trim() === '') {
      return ''
    }
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  // File upload functions
  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload file')
    }
    
    const data = await response.json()
    return data.url
  }

  const handleCoverUpload = async (file: File | null, url?: string) => {
    setCoverFile(file)
    
    if (file) {
      setIsUploadingCover(true)
      try {
        const uploadedUrl = await uploadFile(file)
        setFormData(prev => ({
          ...prev,
          coverUrl: uploadedUrl
        }))
      } catch (error) {
        console.error('Error uploading cover:', error)
        alert('Failed to upload cover image')
      } finally {
        setIsUploadingCover(false)
      }
    } else if (url) {
      setFormData(prev => ({
        ...prev,
        coverUrl: url
      }))
    }
  }

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(Math.round(video.duration))
      }
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src)
        reject(new Error('Failed to load video metadata'))
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  const handleVideoUpload = async (file: File | null, url?: string) => {
    setLessonVideoFile(file)
    
    if (file) {
      setIsUploadingVideo(true)
      try {
        // Get video duration first
        const duration = await getVideoDuration(file)
        console.log('Video duration:', duration, 'seconds')
        
        // Upload the file
        const uploadedUrl = await uploadFile(file)
        
        setNewLesson(prev => ({
          ...prev,
          videoUrl: uploadedUrl,
          durationSec: duration
        }))
      } catch (error) {
        console.error('Error uploading video:', error)
        alert('Failed to upload video')
      } finally {
        setIsUploadingVideo(false)
      }
    } else if (url) {
      setNewLesson(prev => ({
        ...prev,
        videoUrl: url
      }))
    }
  }

  const handleThumbnailUpload = async (file: File | null, url?: string) => {
    setLessonThumbnailFile(file)
    
    if (file) {
      setIsUploadingThumbnail(true)
      try {
        const uploadedUrl = await uploadFile(file)
        setNewLesson(prev => ({
          ...prev,
          thumbnailUrl: uploadedUrl
        }))
      } catch (error) {
        console.error('Error uploading thumbnail:', error)
        alert('Failed to upload thumbnail')
      } finally {
        setIsUploadingThumbnail(false)
      }
    } else if (url) {
      setNewLesson(prev => ({
        ...prev,
        thumbnailUrl: url
      }))
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const totalDuration = formData.lessons.reduce((acc, lesson) => acc + lesson.durationSec, 0)

  // Tab navigation logic
  const tabs = ['basic-info', 'content', 'media', 'settings']
  const currentTabIndex = tabs.indexOf(currentTab)
  const isLastTab = currentTabIndex === tabs.length - 1

  // Validation functions for each tab
  const validateBasicInfo = () => {
    return formData.title.trim() !== '' && 
           formData.description.trim() !== '' && 
           formData.slug.trim() !== '' &&
           formData.level.trim() !== ''
  }

  const validateContent = () => {
    // Content tab must have at least one lesson with a video
    return formData.lessons.length > 0 && formData.lessons.some(lesson => lesson.videoUrl && lesson.videoUrl.trim() !== '')
  }

  const validateMedia = () => {
    // Media is optional, but we should check if user has actually visited this tab
    return visitedTabs.has('media')
  }

  const validateSettings = () => {
    // For existing courses, be more lenient with validation
    if (initialData) {
      // Just check that we have basic required fields
      return formData.title.trim() !== '' && formData.description.trim() !== ''
    }
    
    // For new courses, use stricter validation
    const validPrice = formData.isFree ? formData.priceUSD >= 0 : formData.priceUSD > 0
    return visitedTabs.has('settings') && validPrice && formData.level
  }

  const validateCurrentTab = () => {
    const result = (() => {
      switch (currentTab) {
        case 'basic-info':
          return validateBasicInfo()
        case 'content':
          return validateContent()
        case 'media':
          return validateMedia()
        case 'settings':
          return validateSettings()
        default:
          return false
      }
    })()
    
    
    return result
  }

  const handleNextStep = () => {
    if (!validateCurrentTab()) {
      alert('Please complete the required fields in this tab before proceeding.')
      return
    }

    if (isLastTab) {
      // Submit the form
      handleSubmit(new Event('submit') as any)
    } else {
      // Move to next tab
      const nextTab = tabs[currentTabIndex + 1]
      setCurrentTab(nextTab)
      setVisitedTabs(prev => new Set([...Array.from(prev), nextTab]))
    }
  }

  const handlePreviousStep = () => {
    if (currentTabIndex > 0) {
      const prevTab = tabs[currentTabIndex - 1]
      setCurrentTab(prevTab)
    }
  }

  const handleTabChange = (tabValue: string) => {
    setCurrentTab(tabValue)
    setVisitedTabs(prev => new Set([...Array.from(prev), tabValue]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      console.log('Submitting course data:', formData)
      await onSubmit(formData)
      console.log('Course submitted successfully')
      // Success feedback will be handled by the parent component
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      alert(`Error updating course: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>Course Creation Progress</span>
          <span>{Math.round(((currentTabIndex + 1) / tabs.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentTabIndex + 1) / tabs.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger 
            value="basic-info" 
            className={`flex items-center gap-2 ${validateBasicInfo() ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : visitedTabs.has('basic-info') ? 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}`}
          >
            <Settings className="h-4 w-4" />
            Basic Info
            {validateBasicInfo() && <span className="text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            className={`flex items-center gap-2 ${validateContent() ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : visitedTabs.has('content') ? 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}`}
          >
            <Video className="h-4 w-4" />
            Content
            {validateContent() && <span className="text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger 
            value="media" 
            className={`flex items-center gap-2 ${validateMedia() ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : visitedTabs.has('media') ? 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}`}
          >
            <Image className="h-4 w-4" />
            Media
            {validateMedia() && <span className="text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className={`flex items-center gap-2 ${validateSettings() ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : visitedTabs.has('settings') ? 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}`}
          >
            <Tag className="h-4 w-4" />
            Settings
            {validateSettings() && <span className="text-xs">✓</span>}
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Course Information</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Enter the basic details for your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-900 dark:text-white">Course Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g., Forex Trading Masterclass"
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      URL slug: {formData.slug}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription" className="text-gray-900 dark:text-white">Short Description</Label>
                    <Input
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                      placeholder="Brief description for course cards"
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level" className="text-gray-900 dark:text-white">Level *</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                        <SelectItem value="EXPERT">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructor" className="text-gray-900 dark:text-white">Instructor</Label>
                    <Input
                      id="instructor"
                      value={formData.instructor}
                      onChange={(e) => handleInputChange('instructor', e.target.value)}
                      placeholder="Course instructor name"
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-900 dark:text-white">Full Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Detailed description of the course content and what students will learn"
                      rows={8}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Video Lessons</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Add video lessons to your course. Students will watch these in order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Lesson */}
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-900 dark:text-white">Lesson Title *</Label>
                        <Input
                          value={newLesson.title}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Introduction to Forex Trading"
                          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-900 dark:text-white">
                          Duration {newLesson.durationSec && newLesson.durationSec > 0 && `(${formatDuration(newLesson.durationSec)})`}
                        </Label>
                        <Input
                          type="number"
                          value={newLesson.durationSec}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, durationSec: parseInt(e.target.value) || 0 }))}
                          placeholder={newLesson.videoUrl ? "Auto-detected from video" : "Enter duration in seconds"}
                          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          disabled={!!(newLesson.videoUrl && newLesson.durationSec && newLesson.durationSec > 0)}
                        />
                        {newLesson.videoUrl && newLesson.durationSec && newLesson.durationSec > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            ✓ Duration automatically detected from video
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-900 dark:text-white">Description</Label>
                      <Input
                        value={newLesson.description}
                        onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief lesson description"
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-900 dark:text-white">Video File *</Label>
                        <FileUploadEnhanced
                          key={`video-${formData.lessons.length}`}
                          label="Upload Video"
                          accept="video/*"
                          maxSize={100}
                          onFileSelect={handleVideoUpload}
                          currentFile={lessonVideoFile}
                          currentUrl={newLesson.videoUrl}
                          type="file"
                          placeholder="Upload video file (MP4, WebM, MOV) or enter URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-900 dark:text-white">Video Thumbnail</Label>
                        <FileUploadEnhanced
                          key={`thumbnail-${formData.lessons.length}`}
                          label="Upload Thumbnail"
                          accept="image/*"
                          maxSize={5}
                          onFileSelect={handleThumbnailUpload}
                          currentFile={lessonThumbnailFile}
                          currentUrl={newLesson.thumbnailUrl}
                          type="image"
                          placeholder="Upload thumbnail image or enter URL"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPreview"
                        checked={newLesson.isPreview || false}
                        onCheckedChange={(checked) => setNewLesson(prev => ({ ...prev, isPreview: checked }))}
                      />
                      <Label htmlFor="isPreview" className="text-gray-900 dark:text-white">Preview Lesson</Label>
                    </div>
                    <Button 
                      type="button" 
                      onClick={addLesson} 
                      disabled={(!newLesson.title && !newLesson.videoUrl) || isUploadingVideo || isUploadingThumbnail}
                    >
                      {isUploadingVideo || isUploadingThumbnail ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-spin" />
                          {isUploadingVideo ? 'Uploading video...' : 'Uploading thumbnail...'}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Lesson
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Lessons */}
              {formData.lessons.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      Course Lessons ({formData.lessons.length})
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Total Duration: {formatDuration(totalDuration)}
                    </div>
                  </div>
                  
                  {formData.lessons.map((lesson, index) => (
                    <Card key={lesson.id || index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {index + 1}.
                              </span>
                              <Input
                                value={lesson.title}
                                onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                                className="font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                            <Input
                              value={lesson.description}
                              onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                              placeholder="Lesson description"
                              className="text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center space-x-1">
                                <Play className="h-4 w-4" />
                                <span>{formatDuration(lesson.durationSec)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Order: {lesson.order}</span>
                              </div>
                              {lesson.isPreview && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Preview
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => editLesson(index)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLesson(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Course Media</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Upload cover image and manage course media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">Cover Image</Label>
                <FileUploadEnhanced
                  label="Upload Cover Image"
                  accept="image/*"
                  maxSize={10}
                  onFileSelect={handleCoverUpload}
                  currentFile={coverFile}
                  currentUrl={formData.coverUrl || undefined}
                  type="image"
                  placeholder="Upload course cover image or enter URL"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Course Settings</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Configure pricing, visibility, and course tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFree"
                        checked={formData.isFree}
                        onCheckedChange={(checked) => handleInputChange('isFree', checked)}
                      />
                      <Label htmlFor="isFree" className="text-gray-900 dark:text-white">Free Course</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="status"
                        checked={formData.status === 'PUBLISHED'}
                        onCheckedChange={(checked) => handleInputChange('status', checked ? 'PUBLISHED' : 'DRAFT')}
                      />
                      <Label htmlFor="status" className="text-gray-900 dark:text-white">Published</Label>
                    </div>
                  </div>

                  {!formData.isFree && (
                    <div className="space-y-2">
                      <Label htmlFor="priceUSD" className="text-gray-900 dark:text-white">Price (USD) *</Label>
                      <Input
                        id="priceUSD"
                        type="number"
                        value={formData.priceUSD}
                        onChange={(e) => handleInputChange('priceUSD', parseFloat(e.target.value) || 0)}
                        placeholder="99.99"
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2.5 border-theme-border bg-theme-bg text-theme-text hover:bg-theme-bg-secondary hover:border-theme-border-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          {currentTabIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={isSubmitting}
              className="px-6 py-2.5 border-theme-border bg-theme-bg text-theme-text hover:bg-theme-bg-secondary hover:border-theme-border-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Step
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Progress indicator */}
          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Step {currentTabIndex + 1} of {tabs.length}
          </div>
          
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={isSubmitting || isUploadingCover || isUploadingVideo || isUploadingThumbnail}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                {isUploadingCover ? 'Uploading...' : 'Saving...'}
              </>
            ) : isLastTab ? (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                {initialData ? 'Update Course' : 'Create Course'}
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
