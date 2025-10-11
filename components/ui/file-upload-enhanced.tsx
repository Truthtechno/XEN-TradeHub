'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, File, Image, FileText, Video, Headphones, BookOpen } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'

interface FileUploadProps {
  label: string
  accept: string
  maxSize?: number // in MB
  onFileSelect: (file: File | null, previewUrl?: string) => void
  currentFile?: File | null
  currentUrl?: string
  type?: 'image' | 'file'
  placeholder?: string
}

export function FileUploadEnhanced({ 
  label, 
  accept, 
  maxSize = 10, 
  onFileSelect, 
  currentFile,
  currentUrl,
  type = 'file',
  placeholder
}: FileUploadProps) {
  const { isDarkMode } = useTheme()
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle prop changes to reset component state
  useEffect(() => {
    if (!currentFile && !currentUrl) {
      setPreviewUrl(null)
      setError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [currentFile, currentUrl])

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image
    if (file.type.startsWith('video/')) return Video
    if (file.type.startsWith('audio/')) return Headphones
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFile = (file: File) => {
    setError(null)

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    // Check file type
    if (accept && !accept.split(',').some(type => {
      const cleanType = type.trim()
      if (cleanType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(cleanType.toLowerCase())
      }
      return file.type.match(cleanType.replace('*', '.*'))
    })) {
      setError(`File type not supported. Accepted types: ${accept}`)
      return
    }

    // Create preview URL for images
    if (type === 'image' && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }

    onFileSelect(file, type === 'image' ? URL.createObjectURL(file) : undefined)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">{label}</Label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        {currentFile || previewUrl ? (
          <div className="space-y-3">
            {/* File Preview */}
            <div className="flex items-center space-x-3">
              {type === 'image' && (previewUrl || currentUrl) ? (
                <div className="relative">
                  <img
                    src={previewUrl || currentUrl || ''}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  {currentFile ? (
                    (() => {
                      const Icon = getFileIcon(currentFile)
                      return <Icon className="h-8 w-8 text-gray-500" />
                    })()
                  ) : (
                    <File className="h-8 w-8 text-gray-500" />
                  )}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentFile?.name || 'File selected'}
                </p>
                {currentFile && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(currentFile.size)}
                  </p>
                )}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Click to upload
                </button>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {type === 'image' ? 'PNG, JPG, GIF up to' : 'Files up to'} {maxSize}MB
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>

      {/* URL Input as Alternative */}
      <div className="mt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Or enter a URL:
        </p>
        <Input
          placeholder={placeholder || "https://example.com/file.pdf"}
          value={currentUrl || ''}
          onChange={(e) => onFileSelect(null, e.target.value)}
          className="text-sm"
        />
      </div>
    </div>
  )
}
