'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Calendar, Download, Filter, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface CurrencyData {
  currency: string
  strength: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

interface HeatmapData {
  pair: string
  strength: number
  change: number
}

export default function AnalyticsPage() {
  const [currencyData, setCurrencyData] = useState<CurrencyData[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('24h')

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with actual data from API
      setCurrencyData([
        { currency: 'USD', strength: 85.2, change: 2.1, trend: 'up' },
        { currency: 'EUR', strength: 78.5, change: -1.3, trend: 'down' },
        { currency: 'GBP', strength: 72.8, change: 0.8, trend: 'up' },
        { currency: 'JPY', strength: 65.4, change: -2.5, trend: 'down' },
        { currency: 'AUD', strength: 71.2, change: 1.7, trend: 'up' },
        { currency: 'CAD', strength: 68.9, change: -0.9, trend: 'down' },
        { currency: 'CHF', strength: 74.3, change: 0.5, trend: 'up' },
        { currency: 'NZD', strength: 69.8, change: 1.2, trend: 'up' }
      ])

      setHeatmapData([
        { pair: 'EUR/USD', strength: 78.5, change: -1.3 },
        { pair: 'GBP/USD', strength: 72.8, change: 0.8 },
        { pair: 'USD/JPY', strength: 85.2, change: 2.1 },
        { pair: 'AUD/USD', strength: 71.2, change: 1.7 },
        { pair: 'USD/CAD', strength: 68.9, change: -0.9 },
        { pair: 'USD/CHF', strength: 74.3, change: 0.5 },
        { pair: 'NZD/USD', strength: 69.8, change: 1.2 },
        { pair: 'EUR/GBP', strength: 75.6, change: -0.4 },
        { pair: 'EUR/JPY', strength: 81.7, change: 0.9 },
        { pair: 'GBP/JPY', strength: 79.1, change: 1.3 }
      ])
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'bg-green-500'
    if (strength >= 70) return 'bg-yellow-500'
    if (strength >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xen-red"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Currency Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live currency strength analysis and market insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-xen-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="1h">1 Hour</option>
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </select>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-xen-red hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Currency Strength Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currencyData.slice(0, 4).map((currency) => (
          <Card key={currency.currency} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{currency.currency}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{currency.strength}</p>
                  <p className={`text-sm ${getChangeColor(currency.change)}`}>
                    {currency.change >= 0 ? '+' : ''}{currency.change}%
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  {getTrendIcon(currency.trend)}
                  <div className={`w-3 h-3 rounded-full ${getStrengthColor(currency.strength)}`}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Currency Heatmap */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Currency Heatmap</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Real-time currency strength visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {heatmapData.map((pair) => (
              <div key={pair.pair} className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">{pair.pair}</div>
                <div className={`w-full h-16 rounded-lg ${getStrengthColor(pair.strength)} flex items-center justify-center mb-2`}>
                  <span className="text-white font-bold">{pair.strength}</span>
                </div>
                <div className={`text-xs ${getChangeColor(pair.change)}`}>
                  {pair.change >= 0 ? '+' : ''}{pair.change}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currency Strength Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Currency Strength Trend</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Last 24 hours performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currencyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="currency" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="strength" stroke="#dc2626" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Top Performers</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Best performing currencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currencyData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="currency" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="strength" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Currency Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Detailed Analysis</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Complete currency strength breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Currency</th>
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Strength</th>
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Change</th>
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Trend</th>
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {currencyData.map((currency) => (
                  <tr key={currency.currency} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{currency.currency}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{currency.strength}</td>
                    <td className={`py-3 px-4 ${getChangeColor(currency.change)}`}>
                      {currency.change >= 0 ? '+' : ''}{currency.change}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(currency.trend)}
                        <span className="text-sm capitalize">{currency.trend}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={currency.strength >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}>
                        {currency.strength >= 75 ? 'Strong' : 'Moderate'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
