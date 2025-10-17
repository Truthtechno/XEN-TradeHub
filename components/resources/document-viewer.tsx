'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FileText, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  BookOpen
} from 'lucide-react'
import PDFViewer from './pdf-viewer'

interface DocumentViewerProps {
  url: string
  title: string
  type: 'EBOOK' | 'ARTICLE'
}

interface ParsedDocument {
  success: boolean
  content: string
  type: string
  metadata?: {
    title?: string
    author?: string
    pages?: number
    slides?: number
  }
  filename: string
}

export function DocumentViewer({ url, title, type }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [documentType, setDocumentType] = useState<string>('')
  const [documentMetadata, setDocumentMetadata] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  // Fetch document content
  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Use the proxy API to parse the document
        const proxyUrl = `/api/documents/proxy?url=${encodeURIComponent(url)}&t=${Date.now()}`
        console.log('Fetching document from:', proxyUrl)
        const response = await fetch(proxyUrl)
        
        if (!response.ok) {
          throw new Error('Failed to fetch document')
        }
        
        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers.get('content-type'))
        
        let data: ParsedDocument
        try {
          data = await response.json()
          console.log('Parsed document data:', data)
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError)
          const responseText = await response.text()
          console.log('Response text:', responseText.substring(0, 100) + '...')
          
          // Check if we got binary content (starts with PK for ZIP-based formats)
          if (responseText.startsWith('PK') || responseText.includes('PK')) {
            throw new Error('Document is in a binary format that cannot be displayed inline. Please convert to text format for better compatibility.')
          }
          
          throw new Error('Failed to parse document response. The document may be corrupted or in an unsupported format.')
        }
        
        if (data.success) {
          setContent(data.content || 'No content available')
          setDocumentType(data.type || 'text')
          setDocumentMetadata(data.metadata || {})
          
          // Set total pages based on document type
          if (data.metadata?.pages) {
            setTotalPages(data.metadata.pages)
          } else if (data.metadata?.slides) {
            setTotalPages(data.metadata.slides)
          } else {
            setTotalPages(1)
          }
        } else {
          setContent(data.content || 'Failed to load document')
          setDocumentType('error')
          setDocumentMetadata({ title: 'Error' })
          setTotalPages(1)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document')
      } finally {
        setIsLoading(false)
      }
    }

    if (url) {
      fetchDocument()
    }
  }, [url])

  // Handle zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  // Handle rotation
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // Handle page navigation
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <div className="space-x-2">
            <Button
              onClick={() => window.open(url, '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Document Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-2">
        {/* Title Row */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
            {title}
          </span>
          {documentType && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
              {documentType.toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Controls Row */}
        <div className="flex items-center justify-between sm:justify-end space-x-1 sm:space-x-2 flex-wrap">
          {/* Page Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                variant="outline"
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1 sm:px-2 whitespace-nowrap">
                {currentPage}/{totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                variant="outline"
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
          
          {/* Zoom Controls - Hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-1">
            <Button
              onClick={handleZoomOut}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {zoom}%
            </span>
            <Button
              onClick={handleZoomIn}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Rotation - Hidden on mobile */}
          <Button
            onClick={handleRotate}
            variant="outline"
            size="sm"
            className="hidden sm:flex h-8 w-8 p-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          {/* Fullscreen */}
          <Button
            onClick={() => {
              const element = document.querySelector('.document-content')
              if (element && element.requestFullscreen) {
                element.requestFullscreen()
              }
            }}
            variant="outline"
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
          >
            <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <div 
              className="document-content h-full overflow-auto p-2 sm:p-6"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top left',
                minHeight: '100%'
              }}
            >
              {content ? (
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {/* Document content */}
                  {documentType === 'pdf' ? (
                    <PDFViewer url={url} title={title} />
                  ) : documentMetadata?.isImageBased ? (
                    <div 
                      className="pdf-image-viewer"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100 leading-relaxed">
                      {content}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Document content not available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
