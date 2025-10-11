'use client'

import React, { useState, useEffect } from 'react'
import { X, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Banner {
  id: string
  title: string
  message: string
  description?: string
  color: string
  createdAt: string
  expiresAt?: string
}

interface BannerDisplayProps {
  pagePath: string
  className?: string
}

const colorConfig = {
  red: {
    bg: 'bg-red-500',
    text: 'text-white',
    icon: '🔴'
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-white',
    icon: '🔵'
  },
  green: {
    bg: 'bg-green-500',
    text: 'text-white',
    icon: '🟢'
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-black',
    icon: '🟡'
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-white',
    icon: '🟣'
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-white',
    icon: '🟠'
  },
  pink: {
    bg: 'bg-pink-500',
    text: 'text-white',
    icon: '🩷'
  },
  indigo: {
    bg: 'bg-indigo-500',
    text: 'text-white',
    icon: '🔷'
  }
}

export default function BannerDisplay({ pagePath, className = '' }: BannerDisplayProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [pagePath])

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/banners?page=${pagePath}`)
      if (response.ok) {
        const data = await response.json()
        setBanners(data.banners || [])
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const dismissBanner = async (bannerId: string) => {
    try {
      const response = await fetch('/api/banners/dismiss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bannerId }),
      })

      if (response.ok) {
        setDismissedBanners(prev => new Set(Array.from(prev).concat(bannerId)))
      }
    } catch (error) {
      console.error('Error dismissing banner:', error)
    }
  }

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return null
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h ${minutes}m left`
    return `${minutes}m left`
  }

  const getProgressPercentage = (expiresAt: string) => {
    const now = new Date()
    const created = new Date(banners.find(b => b.expiresAt === expiresAt)?.createdAt || now)
    const expiry = new Date(expiresAt)
    const total = expiry.getTime() - created.getTime()
    const remaining = expiry.getTime() - now.getTime()
    
    if (total <= 0 || remaining <= 0) return 100
    return Math.max(0, Math.min(100, ((total - remaining) / total) * 100))
  }

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const visibleBanners = banners.filter(banner => !dismissedBanners.has(banner.id))

  if (visibleBanners.length === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {visibleBanners.map((banner) => {
        const color = colorConfig[banner.color as keyof typeof colorConfig] || colorConfig.blue
        const timeLeft = banner.expiresAt ? getTimeUntilExpiry(banner.expiresAt) : null
        const progressPercentage = banner.expiresAt ? getProgressPercentage(banner.expiresAt) : 0
        
        return (
          <div
            key={banner.id}
            className={`${color.bg} ${color.text} rounded-lg p-4 relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
          >
            {/* Progress bar for expiring banners */}
            {banner.expiresAt && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-black bg-opacity-20">
                <div 
                  className="h-full bg-white bg-opacity-30 transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{color.icon}</span>
                  <h3 className="font-bold text-lg">{banner.title}</h3>
                  {timeLeft && (
                    <div className="flex items-center space-x-1 text-sm opacity-90">
                      <Clock className="h-4 w-4" />
                      <span>{timeLeft}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm opacity-90 mb-1">{banner.message}</p>
                {banner.description && (
                  <p className="text-xs opacity-75">{banner.description}</p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissBanner(banner.id)}
                className={`${color.text} hover:bg-white hover:bg-opacity-20 p-1 h-8 w-8`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Warning for expiring soon */}
            {timeLeft && timeLeft.includes('m') && !timeLeft.includes('h') && (
              <div className="flex items-center space-x-1 mt-2 text-xs opacity-90">
                <AlertCircle className="h-3 w-3" />
                <span>Expires soon!</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
