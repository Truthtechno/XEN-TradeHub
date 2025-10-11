'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Eye, Filter, Heart, MessageCircle, Plus, RefreshCw, Search, TrendingUp, User } from 'lucide-react'

const forecasts = [
  {
    id: 1,
    title: 'btc',
    description: 'good',
    author: 'fuwad280',
    date: '2025-10-03T08:29:00Z',
    views: 0,
    likes: 0,
    comments: 0,
    isPublic: true,
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
    pair: 'BTCUSD'
  },
  {
    id: 2,
    title: 'EURUSD',
    description: 'Bearish setup.',
    author: 'DAVEZ',
    date: '2025-10-03T08:21:00Z',
    views: 0,
    likes: 0,
    comments: 0,
    isPublic: true,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
    pair: 'EURUSD'
  },
  {
    id: 3,
    title: 'GBPJPY Analysis',
    description: 'Strong bullish momentum expected with key resistance at 185.50',
    author: 'CoreFX',
    date: '2025-10-02T15:30:00Z',
    views: 245,
    likes: 12,
    comments: 3,
    isPublic: false,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
    pair: 'GBPJPY'
  },
  {
    id: 4,
    title: 'XAUUSD Gold Forecast',
    description: 'Gold breaking key resistance with strong momentum towards 2050',
    author: 'CoreFX',
    date: '2025-10-02T10:15:00Z',
    views: 189,
    likes: 8,
    comments: 2,
    isPublic: false,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
    pair: 'XAUUSD'
  }
]

export default function ForecastsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('public')

  const publicForecasts = forecasts.filter(f => f.isPublic)
  const privateForecasts = forecasts.filter(f => !f.isPublic)

  const filteredForecasts = activeTab === 'public' ? publicForecasts : privateForecasts

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-xen-blue">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Market Forecasts</h1>
              <p className="text-gray-600">Latest market predictions and analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="bg-xen-orange hover:bg-xen-orange/90">
              <Plus className="h-4 w-4 mr-2" />
              Publish
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="public">Public Forecasts</TabsTrigger>
            <TabsTrigger value="private">CoreFX Forecasts</TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search forecasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <TabsContent value="public">
          <div className="space-y-6">
            {filteredForecasts.map((forecast) => (
              <Card key={forecast.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    {/* Forecast Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={forecast.image}
                        alt={forecast.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Forecast Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {forecast.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{forecast.description}</p>
                        </div>
                        {forecast.pair && (
                          <Badge variant="outline" className="ml-2">
                            {forecast.pair}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{"CoreFX Team"}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(forecast.date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{forecast.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{forecast.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{forecast.comments}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="private">
          <div className="space-y-6">
            {filteredForecasts.map((forecast) => (
              <Card key={forecast.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    {/* Forecast Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={forecast.image}
                        alt={forecast.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Forecast Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {forecast.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{forecast.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="xen-red">Premium</Badge>
                          {forecast.pair && (
                            <Badge variant="outline">
                              {forecast.pair}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{"CoreFX Team"}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(forecast.date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{forecast.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{forecast.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{forecast.comments}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredForecasts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No forecasts found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or check back later for new forecasts</p>
            <Button onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-xen-blue mb-2">{forecasts.length}</div>
            <div className="text-sm text-gray-600">Total Forecasts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-xen-green mb-2">{publicForecasts.length}</div>
            <div className="text-sm text-gray-600">Public Forecasts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-xen-purple mb-2">{privateForecasts.length}</div>
            <div className="text-sm text-gray-600">Premium Forecasts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-xen-orange mb-2">
              {forecasts.reduce((sum, f) => sum + f.views, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
