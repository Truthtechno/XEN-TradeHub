'use client'

import { useState, useRef, useEffect } from 'react'
import { FileText, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'

interface PDFViewerProps {
  url: string
  title: string
}

export default function PDFViewer({ url, title }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)


  const openInNewTab = () => {
    window.open(url, '_blank')
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }



  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError('Failed to load PDF')
  }

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">Failed to load PDF</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">{error}</p>
          <div className="mt-4">
            <button
              onClick={openInNewTab}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Action Controls */}
          <button
            onClick={openInNewTab}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Open in New Tab"
          >
            <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Maximize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="relative bg-gray-100 dark:bg-gray-800 p-4">
        {isLoading && (
          <div className="absolute inset-4 flex items-center justify-center bg-white dark:bg-gray-900 z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-inner overflow-hidden">
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className={`w-full border-0 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[600px]'}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title}
            style={{
              border: 'none',
              outline: 'none',
              borderRadius: isFullscreen ? '0' : '8px'
            }}
          />
        </div>
      </div>
    </div>
  )
}
