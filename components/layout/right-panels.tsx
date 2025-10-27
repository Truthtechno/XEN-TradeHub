'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Bell, Calculator, Settings, X, CheckCircle, Info, AlertCircle, Shield, Gift, Calendar } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useNotifications } from '@/lib/notifications-context'

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
  
  const [calculatorForm, setCalculatorForm] = useState({
    accountBalance: 10000,
    riskPercentage: 2,
    stopLossPips: 50
  })

  const calculateLotSize = () => {
    const { accountBalance, riskPercentage, stopLossPips } = calculatorForm
    const riskAmount = (accountBalance * riskPercentage) / 100
    const pipValue = 10
    const lotSize = riskAmount / (stopLossPips * pipValue)
    return {
      lotSize: Math.round(lotSize * 100) / 100,
      riskAmount: Math.round(riskAmount * 100) / 100
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LOGIN': return CheckCircle
      case 'WELCOME': return Info
      case 'SYSTEM': return AlertCircle
      case 'SECURITY': return Shield
      case 'PROMOTION': return Gift
      case 'COURSE': return Calendar
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

  return (
    <div>
      {/* Calculator Panel */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => onClose('calculator')}>
          <div className={`fixed right-0 top-0 h-full w-96 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Calculator className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lot Size Calculator</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClose('calculator')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Account Balance</label>
                <Input
                  type="number"
                  value={calculatorForm.accountBalance}
                  onChange={(e) => setCalculatorForm({...calculatorForm, accountBalance: Number(e.target.value)})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Risk %</label>
                <Input
                  type="number"
                  value={calculatorForm.riskPercentage}
                  onChange={(e) => setCalculatorForm({...calculatorForm, riskPercentage: Number(e.target.value)})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stop Loss (Pips)</label>
                <Input
                  type="number"
                  value={calculatorForm.stopLossPips}
                  onChange={(e) => setCalculatorForm({...calculatorForm, stopLossPips: Number(e.target.value)})}
                  className="mt-1"
                />
              </div>
              
              <Card className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recommended Lot Size</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {calculateLotSize().lotSize}
                    </p>
                  </div>
                </CardContent>
              </Card>
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
                  return (
                    <Card key={notification.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
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
