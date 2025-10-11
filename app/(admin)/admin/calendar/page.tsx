'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Calendar, CheckCircle, Clock, Download, Filter, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useTextHierarchy } from '@/lib/text-hierarchy'

interface EconomicEvent {
  id: string
  time: string
  currency: string
  event: string
  impact: 'High' | 'Medium' | 'Low'
  actual: string | null
  forecast: string
  previous: string
  description: string
}

export default function CalendarPage() {
  const { isDarkMode } = useTheme()
  const textHierarchy = useTextHierarchy()
  const [events, setEvents] = useState<EconomicEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [impactFilter, setImpactFilter] = useState('all')
  const [currencyFilter, setCurrencyFilter] = useState('all')

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD']

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with actual data from API
      setEvents([
        {
          id: '1',
          time: '09:30',
          currency: 'USD',
          event: 'Non-Farm Payrolls',
          impact: 'High',
          actual: '185K',
          forecast: '180K',
          previous: '175K',
          description: 'Change in the number of employed people during the previous month'
        },
        {
          id: '2',
          time: '10:00',
          currency: 'EUR',
          event: 'GDP Growth Rate',
          impact: 'High',
          actual: null,
          forecast: '0.3%',
          previous: '0.2%',
          description: 'Quarterly change in the gross domestic product'
        },
        {
          id: '3',
          time: '11:30',
          currency: 'GBP',
          event: 'CPI Inflation Rate',
          impact: 'Medium',
          actual: null,
          forecast: '4.2%',
          previous: '4.0%',
          description: 'Year-over-year change in consumer prices'
        },
        {
          id: '4',
          time: '14:00',
          currency: 'JPY',
          event: 'Bank of Japan Interest Rate Decision',
          impact: 'High',
          actual: null,
          forecast: '-0.1%',
          previous: '-0.1%',
          description: 'Central bank interest rate decision'
        },
        {
          id: '5',
          time: '15:30',
          currency: 'AUD',
          event: 'Retail Sales',
          impact: 'Medium',
          actual: null,
          forecast: '0.5%',
          previous: '0.3%',
          description: 'Monthly change in retail sales volume'
        },
        {
          id: '6',
          time: '16:00',
          currency: 'CAD',
          event: 'Employment Change',
          impact: 'Medium',
          actual: null,
          forecast: '15K',
          previous: '12K',
          description: 'Change in the number of employed people'
        }
      ])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getCurrencyColor = (currency: string) => {
    const colors: { [key: string]: string } = {
      'USD': 'bg-theme-primary-100 text-theme-primary-800 dark:bg-theme-primary-900 dark:text-theme-primary-200', // Primary for USD (most important)
      'EUR': 'bg-theme-success-100 text-theme-success-800 dark:bg-theme-success-900 dark:text-theme-success-200', // Success for EUR (strong)
      'GBP': 'bg-theme-error-100 text-theme-error-800 dark:bg-theme-error-900 dark:text-theme-error-200', // Error for GBP (volatile)
      'JPY': 'bg-theme-info-100 text-theme-info-800 dark:bg-theme-info-900 dark:text-theme-info-200', // Info for JPY (safe haven)
      'AUD': 'bg-theme-warning-100 text-theme-warning-800 dark:bg-theme-warning-900 dark:text-theme-warning-200', // Warning for AUD (commodity)
      'CAD': 'bg-theme-accent-100 text-theme-accent-800 dark:bg-theme-accent-900 dark:text-theme-accent-200', // Accent for CAD (resource)
      'CHF': 'bg-theme-secondary-100 text-theme-secondary-800 dark:bg-theme-secondary-900 dark:text-theme-secondary-200', // Secondary for CHF (safe)
      'NZD': 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-700 dark:text-theme-neutral-200' // Neutral for NZD (smaller)
    }
    return colors[currency] || 'bg-theme-neutral-100 text-theme-neutral-800 dark:bg-theme-neutral-700 dark:text-theme-neutral-200'
  }

  const filteredEvents = events.filter(event => {
    const matchesImpact = impactFilter === 'all' || event.impact === impactFilter
    const matchesCurrency = currencyFilter === 'all' || event.currency === currencyFilter
    return matchesImpact && matchesCurrency
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className={textHierarchy.largeHeading(isDarkMode)}>Economic Calendar</h1>
          <p className={`${textHierarchy.subheading()} mt-1`}>
            Track important economic events and their market impact
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchEvents} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-xen-red hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-xen-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Impact
              </label>
              <select
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-xen-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Impact</option>
                <option value="High">High Impact</option>
                <option value="Medium">Medium Impact</option>
                <option value="Low">Low Impact</option>
              </select>
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-xen-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Currencies</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Economic Events ({filteredEvents.length})</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Today's economic calendar events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{event.time}</span>
                      </div>
                      <Badge className={getCurrencyColor(event.currency)}>
                        {event.currency}
                      </Badge>
                      <Badge className={getImpactColor(event.impact)}>
                        {event.impact} Impact
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {event.event}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {event.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Previous:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{event.previous}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Forecast:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{event.forecast}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Actual:</span>
                        {event.actual ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{event.actual}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {event.actual && (
                      <div className="flex items-center space-x-1">
                        {parseFloat(event.actual) > parseFloat(event.forecast) ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {parseFloat(event.actual) > parseFloat(event.forecast) ? 'Better than expected' : 'Worse than expected'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              High Impact Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {events.filter(e => e.impact === 'High').length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Events today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Completed Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {events.filter(e => e.actual !== null).length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Results released
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Pending Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {events.filter(e => e.actual === null).length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Awaiting results
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
