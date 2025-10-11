'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Calendar, Edit, Eye, Filter, Heart, MessageCircle, Plus, Search, Trash2, TrendingDown, TrendingUp, User } from 'lucide-react'

interface Forecast {
  id: string
  title: string
  description: string
  pair?: string
  chartImage?: string
  isPublic: boolean
  views: number
  likes: number
  comments: number
  createdAt: string
  updatedAt: string
}

export default function AdminForecastsPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchForecasts = async () => {
    try {
      const response = await fetch(`/api/forecasts?type=all&limit=50&t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setForecasts(data.forecasts || [])
      }
    } catch (error) {
      console.error('Failed to fetch forecasts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchForecasts()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchForecasts()
    setIsRefreshing(false)
  }

  const filteredForecasts = forecasts.filter(forecast => {
    const matchesSearch = forecast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forecast.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forecast.pair?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'public' && forecast.isPublic) ||
                         (statusFilter === 'private' && !forecast.isPublic)
    
    return matchesSearch && matchesStatus
  })

  const totalForecasts = forecasts.length
  const publicForecasts = forecasts.filter(f => f.isPublic).length
  const privateForecasts = forecasts.filter(f => !f.isPublic).length
  const totalViews = forecasts.reduce((sum, f) => sum + f.views, 0)
  const totalLikes = forecasts.reduce((sum, f) => sum + f.likes, 0)
  const totalComments = forecasts.reduce((sum, f) => sum + f.comments, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forecasts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forecasts Management</h1>
          <p className="text-gray-600">Manage and monitor all trading forecasts</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <BarChart3 className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forecasts</p>
                <p className="text-2xl font-bold text-gray-900">{totalForecasts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">{totalLikes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{totalComments.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search forecasts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Forecasts</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecasts List */}
      <div className="space-y-4">
        {filteredForecasts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forecasts found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No forecasts have been created yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredForecasts.map((forecast) => (
            <Card key={forecast.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{forecast.title}</h3>
                      <Badge variant={forecast.isPublic ? "default" : "secondary"}>
                        {forecast.isPublic ? 'Public' : 'Private'}
                      </Badge>
                      {forecast.pair && (
                        <Badge variant="outline">{forecast.pair}</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{forecast.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{"CoreFX Team"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(forecast.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{forecast.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{forecast.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{forecast.comments}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
