'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Pause, 
  Play, 
  Download, 
  Copy, 
  Globe, 
  BarChart3, 
  Activity,
  AlertTriangle,
  Clock,
  Database,
  Signal,
  Calendar,
  Gauge,
  LineChart,
  PieChart,
  Target,
  Zap
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts'

// Types
interface ForexRate {
  pair: string
  rate: number
  change: number
  changePercent: number
  timestamp: number
}

interface CurrencyData {
  code: string
  name: string
  rate: number
  change: number
  changePercent: number
  trend: number[]
}

interface MarketSentiment {
  bullish: number
  bearish: number
  neutral: number
  overall: 'bullish' | 'bearish' | 'neutral'
}

interface SessionData {
  name: string
  active: boolean
  volume: number
  timezone: string
}

interface VolatilityData {
  pair: string
  volatility: number
  level: 'low' | 'medium' | 'high'
  trend: number[]
}

interface CorrelationData {
  pair1: string
  pair2: string
  correlation: number
  strength: 'strong' | 'moderate' | 'weak'
}

// Mock data generators
const generateForexRates = (): ForexRate[] => {
  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'CAD/JPY', 'CHF/JPY', 'NZD/JPY', 'EUR/AUD', 'EUR/CAD', 'EUR/CHF', 'EUR/NZD', 'GBP/AUD', 'GBP/CAD']
  
  return pairs.map(pair => {
    const baseRate = Math.random() * 2 + 0.5
    const change = (Math.random() - 0.5) * 0.01
    const changePercent = (change / baseRate) * 100
    
    return {
      pair,
      rate: baseRate + change,
      change,
      changePercent,
      timestamp: Date.now()
    }
  })
}

const generateCurrencyData = (): CurrencyData[] => {
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'NZD', name: 'New Zealand Dollar' }
  ]
  
  return currencies.map(currency => {
    const rate = Math.random() * 2 + 0.5
    const change = (Math.random() - 0.5) * 0.01
    const changePercent = (change / rate) * 100
    const trend = Array.from({ length: 60 }, () => Math.random() * 0.02 - 0.01)
    
    return {
      ...currency,
      rate,
      change,
      changePercent,
      trend
    }
  })
}

const generateMarketSentiment = (): MarketSentiment => {
  const bullish = Math.random() * 40 + 30
  const bearish = Math.random() * 30 + 20
  const neutral = 100 - bullish - bearish
  
  let overall: 'bullish' | 'bearish' | 'neutral' = 'neutral'
  if (bullish > bearish + 10) overall = 'bullish'
  else if (bearish > bullish + 10) overall = 'bearish'
  
  return { bullish, bearish, neutral, overall }
}

const generateSessionData = (): SessionData[] => {
  const now = new Date()
  const hour = now.getUTCHours()
  
  return [
    { name: 'Sydney', active: hour >= 21 || hour < 6, volume: Math.random() * 100, timezone: 'UTC+10' },
    { name: 'Tokyo', active: hour >= 0 && hour < 9, volume: Math.random() * 100, timezone: 'UTC+9' },
    { name: 'London', active: hour >= 8 && hour < 17, volume: Math.random() * 100, timezone: 'UTC+0' },
    { name: 'New York', active: hour >= 13 && hour < 22, volume: Math.random() * 100, timezone: 'UTC-5' }
  ]
}

const generateVolatilityData = (): VolatilityData[] => {
  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'EUR/GBP']
  
  return pairs.map(pair => {
    const volatility = Math.random() * 3
    let level: 'low' | 'medium' | 'high' = 'low'
    if (volatility > 2) level = 'high'
    else if (volatility > 1) level = 'medium'
    
    const trend = Array.from({ length: 60 }, () => Math.random() * 0.05)
    
    return {
      pair,
      volatility,
      level,
      trend
    }
  })
}

const generateCorrelationData = (): CorrelationData[] => {
  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'EUR/GBP']
  const correlations: CorrelationData[] = []
  
  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) {
      const correlation = Math.random() * 2 - 1
      let strength: 'strong' | 'moderate' | 'weak' = 'weak'
      if (Math.abs(correlation) > 0.7) strength = 'strong'
      else if (Math.abs(correlation) > 0.3) strength = 'moderate'
      
      correlations.push({
        pair1: pairs[i],
        pair2: pairs[j],
        correlation,
        strength
      })
    }
  }
  
  return correlations
}

// Utility functions
const formatCurrency = (value: number, decimals: number = 4): string => {
  return value.toFixed(decimals)
}

const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

const getChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-600 dark:text-green-300'
  if (change < 0) return 'text-red-600 dark:text-red-300'
  return 'text-gray-600 dark:text-gray-400'
}

const getChangeBgColor = (change: number): string => {
  if (change > 0.5) return 'bg-green-100 dark:bg-green-500/20'
  if (change > 0) return 'bg-green-50 dark:bg-green-500/15'
  if (change < -0.5) return 'bg-red-100 dark:bg-red-500/20'
  if (change < 0) return 'bg-red-50 dark:bg-red-500/15'
  return 'bg-gray-50 dark:bg-gray-800'
}

const getVolatilityColor = (level: string): string => {
  switch (level) {
    case 'high': return 'text-red-600 dark:text-red-300'
    case 'medium': return 'text-yellow-600 dark:text-yellow-300'
    case 'low': return 'text-green-600 dark:text-green-300'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

const getVolatilityBgColor = (level: string): string => {
  switch (level) {
    case 'high': return 'bg-red-100 dark:bg-red-500/20'
    case 'medium': return 'bg-yellow-100 dark:bg-yellow-500/20'
    case 'low': return 'bg-green-100 dark:bg-green-500/20'
    default: return 'bg-gray-100 dark:bg-gray-800'
  }
}

const getCorrelationColor = (correlation: number): string => {
  if (correlation > 0.7) return 'text-green-600 dark:text-green-300'
  if (correlation < -0.7) return 'text-red-600 dark:text-red-300'
  return 'text-gray-600 dark:text-gray-400'
}

const getCorrelationBgColor = (correlation: number): string => {
  if (correlation > 0.7) return 'bg-green-100 dark:bg-green-500/20'
  if (correlation < -0.7) return 'bg-red-100 dark:bg-red-500/20'
  return 'bg-gray-100 dark:bg-gray-800'
}

// Main component
export default function AdminMarketAnalysisPage() {
  const [activeTab, setActiveTab] = useState('currency')
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [forexRates, setForexRates] = useState<ForexRate[]>([])
  const [currencyData, setCurrencyData] = useState<CurrencyData[]>([])
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment>({ bullish: 0, bearish: 0, neutral: 0, overall: 'neutral' })
  const [sessionData, setSessionData] = useState<SessionData[]>([])
  const [volatilityData, setVolatilityData] = useState<VolatilityData[]>([])
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update data function
  const updateData = useCallback(() => {
    try {
      setForexRates(generateForexRates())
      setCurrencyData(generateCurrencyData())
      setMarketSentiment(generateMarketSentiment())
      setSessionData(generateSessionData())
      setVolatilityData(generateVolatilityData())
      setCorrelationData(generateCorrelationData())
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      setError('Failed to update market data')
      console.error('Data update error:', err)
    }
  }, [])

  // Initial data load
  useEffect(() => {
    updateData()
    setLoading(false)
  }, [updateData])

  // Auto-refresh every second
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(updateData, 1000)
    return () => clearInterval(interval)
  }, [isLive, updateData])

  // Export CSV function
  const exportCSV = useCallback((data: any[], filename: string) => {
    const csv = data.map(item => Object.values(item).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }, [])

  // Copy data function
  const copyData = useCallback((data: any[]) => {
    const text = data.map(item => Object.values(item).join('\t')).join('\n')
    navigator.clipboard.writeText(text)
  }, [])

  // Currency strength heatmap
  const CurrencyHeatmap = () => {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD']
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Currency Strength Heatmap</h3>
            <p className="text-sm text-muted-foreground">Real-time currency pair performance and strength analysis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">1D</Button>
            <Button variant="outline" size="sm">1W</Button>
            <Button variant="outline" size="sm">1M</Button>
            <Button variant="outline" size="sm" onClick={updateData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-9 gap-1 text-xs">
          {/* Header row */}
          <div></div>
          {currencies.map(currency => (
            <div key={currency} className="text-center font-semibold p-2 bg-muted rounded">
              {currency}
            </div>
          ))}
          
          {/* Data rows */}
          {currencies.map(currency1 => (
            <React.Fragment key={currency1}>
              <div className="text-center font-semibold p-2 bg-muted rounded flex items-center justify-center">
                {currency1}
              </div>
              {currencies.map(currency2 => {
                if (currency1 === currency2) {
                  return <div key={`${currency1}-${currency2}`} className="p-2 text-center text-muted-foreground">-</div>
                }
                
                const pair = `${currency1}/${currency2}`
                const rate = forexRates.find(r => r.pair === pair)
                const change = rate?.changePercent || 0
                
                return (
                  <div
                    key={`${currency1}-${currency2}`}
                    className={`p-2 text-center rounded ${getChangeBgColor(change)}`}
                  >
                    <div className={`font-semibold ${getChangeColor(change)}`}>
                      {formatPercent(change)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {rate ? formatCurrency(rate.rate) : 'N/A'}
                    </div>
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-500/30 rounded"></div>
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 dark:bg-red-500/30 rounded"></div>
            <span>Negative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <span>Neutral</span>
          </div>
        </div>
      </div>
    )
  }

  // Mini line chart component
  const MiniLineChart = ({ data, color = '#3b82f6' }: { data: number[], color?: string }) => {
    const chartData = data.map((value, index) => ({ x: index, y: value }))
    
    return (
      <div className="h-8 w-16">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData}>
            <Line 
              type="monotone" 
              dataKey="y" 
              stroke={color} 
              strokeWidth={1.5}
              dot={false}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Sentiment gauge component
  const SentimentGauge = ({ sentiment }: { sentiment: MarketSentiment }) => {
  const data = [
    { name: 'Bullish', value: sentiment.bullish, color: '#22c55e' },
    { name: 'Bearish', value: sentiment.bearish, color: '#f87171' },
    { name: 'Neutral', value: sentiment.neutral, color: '#6b7280' }
  ]
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">Market Sentiment</div>
          <div className={`text-2xl font-semibold ${
            sentiment.overall === 'bullish' ? 'text-green-500 dark:text-green-300' : 
            sentiment.overall === 'bearish' ? 'text-red-500 dark:text-red-300' : 
            'text-gray-600 dark:text-gray-400'
          }`}>
            {sentiment.overall.toUpperCase()}
          </div>
        </div>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <RechartsPieChart
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </RechartsPieChart>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm">
          {data.map((item) => (
            <div key={item.name} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="font-bold">{item.value.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading market data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Market Analysis
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Real-time currency market insights and analysis tools
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Live Data</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-2"
          >
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isLive ? 'Pause' : 'Resume'}
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="volatility">Volatility</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
        </TabsList>

        {/* Currency Tab */}
        <TabsContent value="currency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Currency Strength Analysis
              </CardTitle>
              <CardDescription>
                Real-time currency pair performance and strength analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CurrencyHeatmap />
            </CardContent>
          </Card>

          {/* Currency cards with mini charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currencyData.map((currency) => (
              <Card key={currency.code}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{currency.code}</div>
                    <MiniLineChart 
                      data={currency.trend} 
                      color={currency.changePercent >= 0 ? '#22c55e' : '#f87171'} 
                    />
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {formatCurrency(currency.rate)}
                  </div>
                  <div className={`text-sm ${getChangeColor(currency.changePercent)}`}>
                    {formatPercent(currency.changePercent)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {currency.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4" />
                  <span className="font-semibold">Pairs Loaded</span>
                </div>
                <div className="text-2xl font-bold">{forexRates.length}</div>
                <div className="text-xs text-muted-foreground">Active currency pairs</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">Last Update</span>
                </div>
                <div className="text-2xl font-bold">{lastUpdate.toLocaleTimeString()}</div>
                <div className="text-xs text-muted-foreground">Real-time data</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Signal className="h-4 w-4" />
                  <span className="font-semibold">Auto-refresh</span>
                </div>
                <div className="text-2xl font-bold">1s</div>
                <div className="text-xs text-muted-foreground">Update interval</div>
              </CardContent>
            </Card>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button onClick={() => exportCSV(forexRates, 'currency-data')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => copyData(forexRates)} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copy Data
            </Button>
          </div>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Market Sentiment
                </CardTitle>
                <CardDescription>
                  Real-time analysis of market sentiment based on currency strength
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SentimentGauge sentiment={marketSentiment} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>
                  Major currency pair trends over the last hour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={currencyData.slice(0, 3).map(c => ({
                      name: c.code,
                      rate: c.rate,
                      change: c.changePercent
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Trading Sessions
              </CardTitle>
              <CardDescription>
                Current trading session activity and volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {sessionData.map((session) => (
                  <div key={session.name} className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      session.active ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        session.active ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="font-semibold">{session.name}</div>
                    <div className="text-sm text-muted-foreground">{session.timezone}</div>
                    <div className="text-xs text-muted-foreground">
                      Volume: {session.volume.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volatility Tab */}
        <TabsContent value="volatility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Volatility Analysis
              </CardTitle>
              <CardDescription>
                Real-time volatility tracking and risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {volatilityData.map((vol) => (
                    <div key={vol.pair} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{vol.pair}</div>
                        <Badge 
                          variant="outline" 
                          className={`${getVolatilityColor(vol.level)} ${getVolatilityBgColor(vol.level)}`}
                        >
                          {vol.level.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {vol.volatility.toFixed(2)}%
                      </div>
                      <div className="h-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={vol.trend.map((v, i) => ({ x: i, y: v }))}>
                            <Line 
                              type="monotone" 
                              dataKey="y" 
                              stroke={vol.level === 'high' ? '#f87171' : vol.level === 'medium' ? '#fbbf24' : '#22c55e'} 
                              strokeWidth={2}
                              dot={false}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Global Risk Index
              </CardTitle>
              <CardDescription>
                Overall market volatility and risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {(volatilityData.reduce((sum, vol) => sum + vol.volatility, 0) / volatilityData.length).toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground mb-4">Average Volatility</div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={volatilityData.map(vol => ({
                      pair: vol.pair,
                      volatility: vol.volatility
                    }))}>
                      <Bar dataKey="volatility" fill="#3b82f6" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlations Tab */}
        <TabsContent value="correlations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Currency Correlations
              </CardTitle>
              <CardDescription>
                Real-time correlation analysis between currency pairs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {correlationData.slice(0, 12).map((corr, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-sm">
                          {corr.pair1} / {corr.pair2}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getCorrelationColor(corr.correlation)} ${getCorrelationBgColor(corr.correlation)}`}
                        >
                          {corr.strength.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {corr.correlation.toFixed(3)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {corr.correlation > 0 ? 'Positive' : 'Negative'} correlation
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Positive Correlations
                </CardTitle>
                <CardDescription>
                  Strongest positive relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {correlationData
                    .filter(corr => corr.correlation > 0.7)
                    .slice(0, 5)
                    .map((corr, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-500/20 rounded">
                        <span className="font-medium">{corr.pair1} / {corr.pair2}</span>
                        <span className="text-green-600 dark:text-green-300 font-bold">{corr.correlation.toFixed(3)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Top Negative Correlations
                </CardTitle>
                <CardDescription>
                  Strongest negative relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {correlationData
                    .filter(corr => corr.correlation < -0.7)
                    .slice(0, 5)
                    .map((corr, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-500/20 rounded">
                        <span className="font-medium">{corr.pair1} / {corr.pair2}</span>
                        <span className="text-red-600 dark:text-red-300 font-bold">{corr.correlation.toFixed(3)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
