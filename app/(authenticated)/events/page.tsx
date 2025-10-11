'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, Filter, MapPin, Plus, RefreshCw, Search, Users } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'
import { EventRegistrationForm } from '@/components/events/event-registration-form'
import BannerDisplay from '@/components/banner-display'

interface Event {
  id: string
  title: string
  description: string
  type: 'WORKSHOP' | 'WEBINAR' | 'SEMINAR' | 'CONFERENCE' | 'MASTERCLASS'
  startDate: string
  endDate: string | null
  location: string | null
  price: number | null
  currency: string
  maxAttendees: number | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

const eventTypes = ['All Types', 'WORKSHOP', 'WEBINAR', 'SEMINAR', 'CONFERENCE', 'MASTERCLASS']
const pricingOptions = ['All Pricing', 'Free', 'Paid']
const categories = ['All Categories', 'Trading', 'Education', 'Networking', 'Live Session']

export default function EventsPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All Types')
  const [selectedPricing, setSelectedPricing] = useState('All Pricing')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/events')
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'All Types' || event.type === selectedType
    const matchesPricing = selectedPricing === 'All Pricing' || 
                          (selectedPricing === 'Free' && event.price === 0) ||
                          (selectedPricing === 'Paid' && event.price && event.price > 0)
    
    return matchesSearch && matchesType && matchesPricing && event.isPublished
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'WORKSHOP': return 'primary'
      case 'WEBINAR': return 'success'
      case 'SEMINAR': return 'info'
      case 'CONFERENCE': return 'warning'
      case 'MASTERCLASS': return 'accent'
      default: return 'default'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null || price === 0) return 'FREE'
    return `$${price} ${currency}`
  }

  const handleRegister = (event: Event) => {
    setSelectedEvent(event)
    setShowRegistrationForm(true)
  }

  const handleRegistrationSuccess = () => {
    alert('Successfully registered for the event!')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Banners */}
      <BannerDisplay pagePath="/events" className="mb-6" />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-theme-primary">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className={textHierarchy.largeHeading(isDarkMode)}>Events</h1>
              <p className={textHierarchy.subheading()}>{filteredEvents.length} events available</p>
            </div>
          </div>
          <Button variant="theme-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-text-tertiary" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-theme-bg border-theme-border text-theme-text placeholder-theme-text-tertiary focus:ring-theme-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg border-theme-border text-theme-text"
            >
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={selectedPricing}
              onChange={(e) => setSelectedPricing(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg border-theme-border text-theme-text"
            >
              {pricingOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-bg border-theme-border text-theme-text"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-16 w-16 text-theme-text-tertiary mx-auto mb-4" />
            <h3 className={textHierarchy.cardTitle(isDarkMode)}>No events available</h3>
            <p className={textHierarchy.cardDescription()}>Check back later for new events</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('')
              setSelectedType('All Types')
              setSelectedPricing('All Pricing')
              setSelectedCategory('All Categories')
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-all duration-200 bg-theme-card border-theme-border hover:bg-theme-card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getEventTypeColor(event.type) as any}>
                        {event.type}
                      </Badge>
                      {event.price === 0 && (
                        <Badge variant="success">Free</Badge>
                      )}
                    </div>
                    <CardTitle className={textHierarchy.cardTitle(isDarkMode)}>{event.title}</CardTitle>
                    <CardDescription className={textHierarchy.cardDescription()}>{event.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="space-y-2 text-sm text-theme-text-secondary">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-theme-text-tertiary" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-theme-text-tertiary" />
                    <span>{formatTime(event.startDate)}</span>
                    {event.endDate && (
                      <span> - {formatTime(event.endDate)}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-theme-text-tertiary" />
                    <span>{event.location || 'Online'}</span>
                  </div>
                  {event.maxAttendees && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-theme-text-tertiary" />
                      <span>Max {event.maxAttendees} attendees</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-center">
                  <span className={`text-2xl font-bold ${event.price === 0 ? 'text-theme-success' : 'text-theme-text'}`}>
                    {formatPrice(event.price, event.currency)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    variant="theme-primary"
                    className="flex-1"
                    onClick={() => handleRegister(event)}
                  >
                    Register Now
                  </Button>
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Event Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-theme-primary mb-2">{events.length}</div>
            <div className={textHierarchy.cardDescription()}>Total Events</div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-theme-success mb-2">
              {events.filter(e => e.price === 0).length}
            </div>
            <div className={textHierarchy.cardDescription()}>Free Events</div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-theme-info mb-2">
              {events.filter(e => e.price && e.price > 0).length}
            </div>
            <div className={textHierarchy.cardDescription()}>Paid Events</div>
          </CardContent>
        </Card>
        <Card className="bg-theme-card border-theme-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-theme-accent mb-2">
              {events.reduce((acc, e) => acc + (e.maxAttendees || 0), 0)}
            </div>
            <div className={textHierarchy.cardDescription()}>Total Capacity</div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Form */}
      {selectedEvent && (
        <EventRegistrationForm
          event={selectedEvent}
          isOpen={showRegistrationForm}
          onClose={() => {
            setShowRegistrationForm(false)
            setSelectedEvent(null)
          }}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  )
}
