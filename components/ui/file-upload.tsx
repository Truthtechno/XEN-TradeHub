'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Image, FileIcon } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  accept?: string
  maxSize?: number
  placeholder?: string
  label?: string
}

export function FileUpload({ 
  value, 
  onChange, 
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  placeholder = 'Click to upload or drag and drop',
  label = 'Upload File'
}: FileUploadProps) {
  const { isDarkMode } = useTheme()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)
    
    // Validate file type
    if (!file.type.match(/^image\//)) {
      setError('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('FileUpload: Starting upload for file:', file.name, file.type, file.size)

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      console.log('FileUpload: Response status:', response.status)
      const result = await response.json()
      console.log('FileUpload: Response data:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setPreview(result.url)
      onChange(result.url)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
          isDarkMode 
            ? 'border-gray-600 hover:border-gray-500 bg-gray-800' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        } ${error ? 'border-red-500' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-32 object-contain rounded"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
              {preview}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                  Uploading...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className={`p-3 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <Upload className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {placeholder}
                  </p>
                  <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    PNG, JPG, GIF, SVG, ICO up to {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
