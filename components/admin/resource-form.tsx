'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Upload, X } from 'lucide-react'
import { FileUploadEnhanced } from '@/components/ui/file-upload-enhanced'
import { getMediaDuration, estimateDurationFromFileSize } from '@/lib/media-duration'

interface ResourceFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (resource: any) => void
  resource?: any
}

export function ResourceForm({ isOpen, onClose, onSave, resource }: ResourceFormProps) {
  const [formData, setFormData] = useState({
    title: resource?.title || '',
    slug: resource?.slug || '',
    description: resource?.description || '',
    type: resource?.type || 'VIDEO',
    category: resource?.category || '',
    url: resource?.url || '',
    thumbnail: resource?.thumbnail || '',
    duration: resource?.duration || null, // Duration will be automatically detected
    isPremium: resource?.isPremium || false,
    priceUSD: resource?.priceUSD || null,
    tags: resource?.tags || [],
    courseId: resource?.courseId || ''
  })
  const [newTag, setNewTag] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [contentFile, setContentFile] = useState<File | null>(null)

  // Update form data when resource prop changes
  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || '',
        slug: resource.slug || '',
        description: resource.description || '',
        type: resource.type || 'VIDEO',
        category: resource.category || '',
        url: resource.url || '',
        thumbnail: resource.thumbnail || '',
        duration: null, // Duration will be automatically detected
        isPremium: resource.isPremium || false,
        priceUSD: resource.priceUSD || null,
        tags: resource.tags || [],
        courseId: resource.courseId || ''
      })
    } else {
      // Reset form for new resource
      setFormData({
        title: '',
        slug: '',
        description: '',
        type: 'VIDEO',
        category: '',
        url: '',
        thumbnail: '',
        duration: null,
        isPremium: false,
        priceUSD: null,
        tags: [],
        courseId: ''
      })
    }
  }, [resource])
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingContent, setUploadingContent] = useState(false)
  const [detectingDuration, setDetectingDuration] = useState(false)

  // Function to generate URL slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  const resourceTypes = [
    { value: 'VIDEO', label: 'Video' },
    { value: 'PODCAST', label: 'Podcast' },
    { value: 'EBOOK', label: 'E-Book' },
    { value: 'ARTICLE', label: 'Article' }
  ]

  const categories = [
    { value: 'Education', label: 'Education' },
    { value: 'Analysis', label: 'Analysis' },
    { value: 'Strategy', label: 'Strategy' },
    { value: 'Tutorial', label: 'Tutorial' },
    { value: 'Psychology', label: 'Psychology' },
    { value: 'Live Trading', label: 'Live Trading' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-generate slug when title changes
      if (field === 'title' && value) {
        newData.slug = generateSlug(value)
      }
      
      return newData
    })
  }

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

  const handleThumbnailUpload = async (file: File | null, url?: string) => {
    setThumbnailFile(file)
    
    if (file) {
      setUploadingThumbnail(true)
      try {
        const uploadedUrl = await uploadFile(file)
        setFormData(prev => ({
          ...prev,
          thumbnail: uploadedUrl
        }))
      } catch (error) {
        console.error('Error uploading thumbnail:', error)
        alert('Failed to upload thumbnail')
      } finally {
        setUploadingThumbnail(false)
      }
    } else if (url) {
      setFormData(prev => ({
        ...prev,
        thumbnail: url
      }))
    }
  }

  const handleContentUpload = async (file: File | null, url?: string) => {
    console.log(`🚀 handleContentUpload called with file:`, file?.name, 'url:', url)
    setContentFile(file)
    
    if (file) {
      console.log(`📁 Processing file upload: ${file.name}`)
      setUploadingContent(true)
      try {
        const uploadedUrl = await uploadFile(file)
        console.log(`📤 File uploaded to: ${uploadedUrl}`)
        setFormData(prev => ({
          ...prev,
          url: uploadedUrl
        }))
        
        // Auto-detect duration for video and audio files
        // Determine media type from file MIME type
        const isVideo = file.type.startsWith('video/')
        const isAudio = file.type.startsWith('audio/')
        const mediaType = isVideo ? 'VIDEO' : isAudio ? 'PODCAST' : null
        
        console.log(`🔍 File analysis: isVideo=${isVideo}, isAudio=${isAudio}, mediaType=${mediaType}`)
        
        if (mediaType) {
          console.log(`🎬 Starting duration detection for ${mediaType}: ${uploadedUrl}`)
          console.log(`📁 File info: ${file.name}, type: ${file.type}, size: ${file.size}`)
          setDetectingDuration(true)
          try {
            const result = await getMediaDuration(uploadedUrl, mediaType)
            console.log(`📊 Duration detection result:`, result)
            
            if (result.success && result.duration && result.duration > 0) {
              // Store duration in seconds for accuracy
              setFormData(prev => ({
                ...prev,
                duration: Math.round(result.duration)
              }))
              console.log(`✅ Auto-detected duration: ${result.duration}s for ${uploadedUrl}`)
            } else {
              console.log(`❌ Duration detection failed for ${uploadedUrl}:`, result.error)
              
              // Fallback: Estimate duration from file size
              if (file && file.size) {
                console.log(`🔄 Attempting fallback duration estimation from file size...`)
                const estimatedDuration = estimateDurationFromFileSize(file.size, mediaType)
                setFormData(prev => ({
                  ...prev,
                  duration: estimatedDuration
                }))
                console.log(`📊 Fallback duration estimation: ${estimatedDuration}s for ${file.name}`)
              } else {
                console.log(`⚠️ No file size available for fallback estimation`)
              }
            }
          } catch (durationError) {
            console.error('Error detecting duration:', durationError)
            
            // Fallback: Estimate duration from file size
            if (file && file.size) {
              console.log(`🔄 Attempting fallback duration estimation from file size after error...`)
              const estimatedDuration = estimateDurationFromFileSize(file.size, mediaType)
              setFormData(prev => ({
                ...prev,
                duration: estimatedDuration
              }))
              console.log(`📊 Fallback duration estimation: ${estimatedDuration}s for ${file.name}`)
            }
          } finally {
            setDetectingDuration(false)
          }
        } else {
          console.log(`⏭️ Skipping duration detection for unsupported file type: ${file.type}`)
        }
      } catch (error) {
        console.error('Error uploading content:', error)
        alert('Failed to upload content file')
      } finally {
        setUploadingContent(false)
      }
    } else if (url) {
      setFormData(prev => ({
        ...prev,
        url: url
      }))
      
      // Auto-detect duration for video and audio URLs
      if (formData.type === 'VIDEO' || formData.type === 'PODCAST') {
        console.log(`🎬 Starting duration detection for ${formData.type} URL: ${url}`)
        setDetectingDuration(true)
        try {
          const result = await getMediaDuration(url, formData.type as 'VIDEO' | 'PODCAST')
          console.log(`📊 Duration detection result:`, result)
          
          if (result.success && result.duration && result.duration > 0) {
            // Store duration in seconds for accuracy
            setFormData(prev => ({
              ...prev,
              duration: Math.round(result.duration)
            }))
            console.log(`✅ Auto-detected duration: ${result.duration}s for ${url}`)
          } else {
            console.log(`❌ Duration detection failed for ${url}:`, result.error)
          }
        } catch (durationError) {
          console.error('Error detecting duration:', durationError)
          // Don't show error to user, just continue without auto-detection
        } finally {
          setDetectingDuration(false)
        }
      } else {
        console.log(`⏭️ Skipping duration detection for type: ${formData.type}`)
      }
    }
  }

  const getContentUploadAccept = () => {
    switch (formData.type) {
      case 'EBOOK':
        return '.pdf,.epub,.doc,.docx,.txt'
      case 'ARTICLE':
        return '.pdf,.doc,.docx,.txt'
      case 'PODCAST':
        return '.mp3,.wav,.ogg,.m4a,.aac'
      case 'VIDEO':
        return '.mp4,.webm,.mov'
      default:
        return '*'
    }
  }

  const getContentUploadPlaceholder = () => {
    switch (formData.type) {
      case 'EBOOK':
        return 'https://example.com/ebook.pdf'
      case 'ARTICLE':
        return 'https://example.com/article.pdf'
      case 'PODCAST':
        return 'https://example.com/podcast.mp3'
      case 'VIDEO':
        return 'Upload video file (MP4, WebM, MOV) or enter YouTube URL'
      default:
        return 'https://example.com/resource'
    }
  }

  const isFileUploadType = () => {
    return ['EBOOK', 'ARTICLE', 'PODCAST', 'VIDEO'].includes(formData.type)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      const resourceData = {
        ...formData,
        duration: formData.duration // Keep duration in seconds for API
      }
      
      console.log(`💾 Submitting resource with duration: ${formData.duration}s`)

      // Remove empty strings and convert to proper types
      if (resourceData.url === '') resourceData.url = undefined
      if (resourceData.thumbnail === '') resourceData.thumbnail = undefined
      if (resourceData.courseId === '') resourceData.courseId = undefined
      
      // Validate URL format for external content types
      if (resourceData.url && !isFileUploadType()) {
        try {
          new URL(resourceData.url)
        } catch {
          alert('Please enter a valid URL for external content (e.g., https://youtube.com/watch?v=example)')
          return
        }
      }

      const url = resource ? `/api/admin/resources/${resource.id}` : '/api/admin/resources'
      const method = resource ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        
        if (errorData.details) {
          // Show validation errors
          const errorMessages = errorData.details.map((detail: any) => 
            `${detail.path.join('.')}: ${detail.message}`
          ).join('\n')
          alert(`Validation Error:\n${errorMessages}`)
        } else {
          alert(`Error: ${errorData.error || 'Failed to save resource'}`)
        }
        return
      }

      const savedResource = await response.json()
      onSave(savedResource)
      onClose()
      
      // Reset form
      setFormData({
        title: '',
        slug: '',
        description: '',
        type: 'VIDEO',
        category: '',
        url: '',
        thumbnail: '',
        duration: null,
        isPremium: false,
        priceUSD: null,
        tags: [],
        courseId: ''
      })
      setThumbnailFile(null)
      setContentFile(null)
    } catch (error) {
      console.error('Error saving resource:', error)
      alert('Failed to save resource. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {resource ? 'Edit Resource' : 'New Resource'}
          </DialogTitle>
          <DialogDescription>
            {resource ? 'Update the resource details below.' : 'Add a new educational resource to the platform.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter resource title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* URL Slug Field */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              placeholder="Auto-generated from title"
              required
            />
            <p className="text-xs text-gray-500">
              This will be used in the resource URL. Auto-generated from title but can be customized.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter resource description"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration is automatically detected - no manual input needed */}
            {detectingDuration && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Detecting duration...</span>
              </div>
            )}
          </div>

          {/* Content Upload/URL */}
          <div className="space-y-2">
            {isFileUploadType() ? (
              <FileUploadEnhanced
                label="Content File *"
                accept={getContentUploadAccept()}
                maxSize={formData.type === 'VIDEO' ? 100 : 10} // 100MB for videos, 10MB for others
                onFileSelect={handleContentUpload}
                currentFile={contentFile}
                currentUrl={formData.url}
                type="file"
                placeholder={getContentUploadPlaceholder()}
              />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder={getContentUploadPlaceholder()}
                  required
                />
              </div>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <FileUploadEnhanced
              label="Thumbnail"
              accept="image/*"
              onFileSelect={handleThumbnailUpload}
              currentFile={thumbnailFile}
              currentUrl={formData.thumbnail}
              type="image"
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => handleInputChange('isPremium', checked)}
              />
              <Label htmlFor="isPremium">Premium Content</Label>
            </div>
            
            {formData.isPremium && (
              <div className="space-y-2">
                <Label htmlFor="priceUSD">Price (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="priceUSD"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceUSD || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === null || value === undefined) {
                        handleInputChange('priceUSD', null);
                      } else {
                        const numValue = parseFloat(value);
                        handleInputChange('priceUSD', isNaN(numValue) ? null : numValue);
                      }
                    }}
                    placeholder="0.00"
                    className="pl-8"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Set the price for this premium resource. Users will need to pay this amount to access the content.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || uploadingThumbnail || uploadingContent}>
              {isUploading || uploadingThumbnail || uploadingContent ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  {uploadingThumbnail ? 'Uploading thumbnail...' : 
                   uploadingContent ? 'Uploading content...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {resource ? 'Update Resource' : 'Create Resource'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
