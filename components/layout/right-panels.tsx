'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Calculator, Settings, X, CheckCircle, Info, AlertCircle, Shield, Gift, Calendar, DollarSign, Eye, RefreshCw } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useNotifications } from '@/lib/notifications-context'
import { useRouter } from 'next/navigation'

interface RightPanelsProps {
  isCalculatorOpen: boolean
  isSettingsOpen: boolean
  isNotificationsOpen: boolean
  onClose: (panel: string) => void
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
  notifications?: number
}

export function RightPanels({ 
  isCalculatorOpen, 
  isSettingsOpen, 
  isNotificationsOpen, 
  onClose,
  user,
  notifications = 0
}: RightPanelsProps) {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { notifications: userNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const router = useRouter()
  
  const [calculatorForm, setCalculatorForm] = useState({
    accountBalance: 10000,
    accountCurrency: 'USD',
    riskPercentage: 2,
    currencyPair: 'EURUSD',
    profitRatio: '1:2',
    stopLossMethod: 'pips', // 'pips' or 'price'
    stopLossPips: 50,
    entryPrice: 1.1000,
    stopLossPrice: 1.0950
  })

  const calculateLotSize = () => {
    const { accountBalance, riskPercentage, stopLossPips, entryPrice, stopLossPrice, stopLossMethod } = calculatorForm
    const riskAmount = (accountBalance * riskPercentage) / 100
    
    let lotSize = 0
    if (stopLossMethod === 'pips') {
      const pipValue = 10
      lotSize = riskAmount / (stopLossPips * pipValue)
    } else {
      // Price-based calculation
      const priceDifference = Math.abs(entryPrice - stopLossPrice)
      const pipValue = 10
      const pips = priceDifference * 10000 // Convert to pips for major pairs
      lotSize = riskAmount / (pips * pipValue)
    }
    
    return {
      lotSize: Math.round(lotSize * 100) / 100,
      riskAmount: Math.round(riskAmount * 100) / 100,
      pipValue: 10
    }
  }

  const resetCalculator = () => {
    setCalculatorForm({
      accountBalance: 10000,
      accountCurrency: 'USD',
      riskPercentage: 2,
      currencyPair: 'EURUSD',
      profitRatio: '1:2',
      stopLossMethod: 'pips',
      stopLossPips: 50,
      entryPrice: 1.1000,
      stopLossPrice: 1.0950
    })
  }

  const getCurrencyPairName = (pair: string) => {
    const pairs: { [key: string]: string } = {
      'EURUSD': 'EUR/USD',
      'GBPUSD': 'GBP/USD',
      'USDJPY': 'USD/JPY',
      'AUDUSD': 'AUD/USD',
      'USDCAD': 'USD/CAD',
      'USDCHF': 'USD/CHF',
      'NZDUSD': 'NZD/USD'
    }
    return pairs[pair] || pair
  }

  const getProfitRatioLabel = (ratio: string) => {
    const ratioMap: { [key: string]: string } = {
      '1:1': '1x reward ratio',
      '1:2': '2x reward ratio',
      '1:3': '3x reward ratio'
    }
    return ratioMap[ratio] || ratio
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LOGIN': return CheckCircle
      case 'WELCOME': return Info
      case 'SYSTEM': return AlertCircle
      case 'SECURITY': return Shield
      case 'PROMOTION': return Gift
      case 'COURSE': return Calendar
      case 'NEW_ACADEMY_CLASS': return Calendar
      default: return Bell
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  const recentNotifications = userNotifications.slice(0, 5)

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead([notification.id])
    }
    
    // Close the panel
    onClose('notifications')
    
    // Navigate to the action URL if it exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  return (
    <div>
      {/* Calculator Panel */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => onClose('calculator')}>
          <div className={`fixed right-0 top-0 h-full w-96 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Calculator className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lot Size Calculator</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Calculate optimal position size</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClose('calculator')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
              {/* Account Information Section */}
              <div className="space-y-4">
                <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Account Information</h3>
                
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Account Balance</label>
                  <div className="relative mt-1.5">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={calculatorForm.accountBalance}
                      onChange={(e) => setCalculatorForm({...calculatorForm, accountBalance: Number(e.target.value)})}
                      className={`pl-9 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="10000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Account Currency</label>
                  <Select 
                    value={calculatorForm.accountCurrency} 
                    onValueChange={(value) => setCalculatorForm({...calculatorForm, accountCurrency: value})}
                  >
                    <SelectTrigger className={`mt-1.5 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Base currency: {calculatorForm.accountCurrency}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Risk Percentage (%)</label>
                  <div className="relative mt-1.5">
                    <Input
                      type="number"
                      value={calculatorForm.riskPercentage}
                      onChange={(e) => setCalculatorForm({...calculatorForm, riskPercentage: Number(e.target.value)})}
                      className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="2"
                    />
                    <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Trading Information Section */}
              <div className="space-y-4">
                <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Trading Information</h3>
                
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Currency Pair</label>
                  <Select 
                    value={calculatorForm.currencyPair} 
                    onValueChange={(value) => setCalculatorForm({...calculatorForm, currencyPair: value})}
                  >
                    <SelectTrigger className={`mt-1.5 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EURUSD">EURUSD</SelectItem>
                      <SelectItem value="GBPUSD">GBPUSD</SelectItem>
                      <SelectItem value="USDJPY">USDJPY</SelectItem>
                      <SelectItem value="AUDUSD">AUDUSD</SelectItem>
                      <SelectItem value="USDCAD">USDCAD</SelectItem>
                      <SelectItem value="USDCHF">USDCHF</SelectItem>
                      <SelectItem value="NZDUSD">NZDUSD</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {getCurrencyPairName(calculatorForm.currencyPair)}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Profit Ratio</label>
                  <Select 
                    value={calculatorForm.profitRatio} 
                    onValueChange={(value) => setCalculatorForm({...calculatorForm, profitRatio: value})}
                  >
                    <SelectTrigger className={`mt-1.5 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">1:1</SelectItem>
                      <SelectItem value="1:2">1:2</SelectItem>
                      <SelectItem value="1:3">1:3</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {getProfitRatioLabel(calculatorForm.profitRatio)}
                  </p>
                </div>
              </div>

              {/* Stop Loss Method Section */}
              <div className="space-y-4">
                <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Stop Loss Method</h3>
                
                <div className="flex gap-2">
                  <Button
                    variant={calculatorForm.stopLossMethod === 'pips' ? 'default' : 'outline'}
                    className={`flex-1 ${calculatorForm.stopLossMethod === 'pips' ? '' : isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    onClick={() => setCalculatorForm({...calculatorForm, stopLossMethod: 'pips'})}
                  >
                    Pips
                  </Button>
                  <Button
                    variant={calculatorForm.stopLossMethod === 'price' ? 'default' : 'outline'}
                    className={`flex-1 ${calculatorForm.stopLossMethod === 'price' ? '' : isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    onClick={() => setCalculatorForm({...calculatorForm, stopLossMethod: 'price'})}
                  >
                    Price
                  </Button>
                </div>
                
                {calculatorForm.stopLossMethod === 'pips' ? (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stop Loss (Pips)</label>
                    <Input
                      type="number"
                      value={calculatorForm.stopLossPips}
                      onChange={(e) => setCalculatorForm({...calculatorForm, stopLossPips: Number(e.target.value)})}
                      className={`mt-1.5 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="50"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Entry Price</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={calculatorForm.entryPrice}
                        onChange={(e) => setCalculatorForm({...calculatorForm, entryPrice: Number(e.target.value)})}
                        className={`mt-1.5 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="1.1000"
                      />
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stop Loss Price</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={calculatorForm.stopLossPrice}
                        onChange={(e) => setCalculatorForm({...calculatorForm, stopLossPrice: Number(e.target.value)})}
                        className={`mt-1.5 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="1.0950"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Result Card */}
              <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recommended Lot Size</p>
                    <p className={`text-4xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {calculateLotSize().lotSize}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Risk Amount: ${calculateLotSize().riskAmount.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => calculateLotSize()}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
                <Button 
                  variant="outline"
                  className={`flex-1 ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
                  onClick={resetCalculator}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => onClose('settings')}>
          <div className={`fixed right-0 top-0 h-full w-96 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Settings className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClose('settings')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-6">
              <div className="space-y-4">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Toggle dark mode</p>
                  </div>
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h3>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                  <Input value={user?.name || ''} className="mt-1" disabled />
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <Input value={user?.email || ''} className="mt-1" disabled />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => onClose('notifications')}>
          <div className={`fixed right-0 top-0 h-full w-96 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Bell className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h2>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClose('notifications')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notification: any) => {
                  const Icon = getNotificationIcon(notification.type)
                  const isClickable = notification.actionUrl && notification.actionUrl.trim() !== ''
                  return (
                    <Card 
                      key={notification.id} 
                      className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''} ${isClickable ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''}`}
                      onClick={() => isClickable && handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notification.title}</h4>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{notification.message}</p>
                            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatTimeAgo(notification.createdAt)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <Bell className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  onClose('notifications')
                  window.location.href = '/notifications'
                }}
              >
                View All Notifications
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
