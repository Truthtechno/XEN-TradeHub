'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Settings } from 'lucide-react'

interface ThemePreviewProps {
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    neutralColor: string
    successColor: string
    warningColor: string
    errorColor: string
    infoColor: string
    headingFont: string
    bodyFont: string
    monoFont: string
    theme?: 'light' | 'dark' | 'auto'
    lightModeColors?: {
      primaryColor: string
      secondaryColor: string
      accentColor: string
      neutralColor: string
      successColor: string
      warningColor: string
      errorColor: string
      infoColor: string
    }
    darkModeColors?: {
      primaryColor: string
      secondaryColor: string
      accentColor: string
      neutralColor: string
      successColor: string
      warningColor: string
      errorColor: string
      infoColor: string
    }
  }
  isDark: boolean
}

export function ThemePreview({ theme, isDark }: ThemePreviewProps) {
  // Use mode-specific colors if available, otherwise fall back to default colors
  const colors = isDark 
    ? (theme.darkModeColors || {
        primaryColor: '#3B82F6',
        secondaryColor: '#F87171',
        accentColor: '#34D399',
        neutralColor: '#9CA3AF',
        successColor: '#34D399',
        warningColor: '#FBBF24',
        errorColor: '#F87171',
        infoColor: '#60A5FA',
      })
    : (theme.lightModeColors || {
        primaryColor: '#1E40AF',
        secondaryColor: '#DC2626',
        accentColor: '#10B981',
        neutralColor: '#6B7280',
        successColor: '#10B981',
        warningColor: '#F59E0B',
        errorColor: '#EF4444',
        infoColor: '#3B82F6',
      })

  // Helper function to get contrasting text color
  const getContrastTextColor = (backgroundColor: string) => {
    // Simple luminance calculation
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-theme">Theme Preview</h3>
      
      {/* Dashboard Preview */}
      <Card className="overflow-hidden">
        <CardHeader 
          className="pb-3"
          style={{ 
            backgroundColor: colors.primaryColor,
            color: getContrastTextColor(colors.primaryColor)
          }}
        >
          <CardTitle 
            className="text-lg"
            style={{ fontFamily: `'${theme.headingFont}', sans-serif` }}
          >
            Trading Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent 
          className="space-y-4"
          style={{ 
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            color: isDark ? '#F9FAFB' : '#111827'
          }}
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className="p-3 rounded-lg border"
              style={{ 
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                borderColor: isDark ? '#4B5563' : '#E5E7EB'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm"
                    style={{ 
                      color: isDark ? '#D1D5DB' : '#6B7280',
                      fontFamily: `'${theme.bodyFont}', sans-serif`
                    }}
                  >
                    Total P&L
                  </p>
                  <p 
                    className="text-lg font-semibold"
                    style={{ 
                      color: colors.successColor,
                      fontFamily: `'${theme.monoFont}', monospace`
                    }}
                  >
                    +$12,345.67
                  </p>
                </div>
                <TrendingUp 
                  className="h-5 w-5" 
                  style={{ color: colors.successColor }}
                />
              </div>
            </div>

            <div 
              className="p-3 rounded-lg border"
              style={{ 
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                borderColor: isDark ? '#4B5563' : '#E5E7EB'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm"
                    style={{ 
                      color: isDark ? '#D1D5DB' : '#6B7280',
                      fontFamily: `'${theme.bodyFont}', sans-serif`
                    }}
                  >
                    Win Rate
                  </p>
                  <p 
                    className="text-lg font-semibold"
                    style={{ 
                      color: colors.primaryColor,
                      fontFamily: `'${theme.monoFont}', monospace`
                    }}
                  >
                    78.5%
                  </p>
                </div>
                <BarChart3 
                  className="h-5 w-5" 
                  style={{ color: colors.primaryColor }}
                />
              </div>
            </div>

            <div 
              className="p-3 rounded-lg border"
              style={{ 
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                borderColor: isDark ? '#4B5563' : '#E5E7EB'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm"
                    style={{ 
                      color: isDark ? '#D1D5DB' : '#6B7280',
                      fontFamily: `'${theme.bodyFont}', sans-serif`
                    }}
                  >
                    Active Trades
                  </p>
                  <p 
                    className="text-lg font-semibold"
                    style={{ 
                      color: colors.infoColor,
                      fontFamily: `'${theme.monoFont}', monospace`
                    }}
                  >
                    12
                  </p>
                </div>
                <DollarSign 
                  className="h-5 w-5" 
                  style={{ color: colors.infoColor }}
                />
              </div>
            </div>

            <div 
              className="p-3 rounded-lg border"
              style={{ 
                backgroundColor: isDark ? '#374151' : '#F9FAFB',
                borderColor: isDark ? '#4B5563' : '#E5E7EB'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm"
                    style={{ 
                      color: isDark ? '#D1D5DB' : '#6B7280',
                      fontFamily: `'${theme.bodyFont}', sans-serif`
                    }}
                  >
                    Followers
                  </p>
                  <p 
                    className="text-lg font-semibold"
                    style={{ 
                      color: colors.secondaryColor,
                      fontFamily: `'${theme.monoFont}', monospace`
                    }}
                  >
                    1,234
                  </p>
                </div>
                <Users 
                  className="h-5 w-5" 
                  style={{ color: colors.secondaryColor }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              style={{ 
                backgroundColor: colors.primaryColor,
                color: getContrastTextColor(colors.primaryColor)
              }}
              className="hover:opacity-90"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              New Trade
            </Button>
            <Button
              variant="outline"
              style={{ 
                borderColor: colors.secondaryColor,
                color: colors.secondaryColor,
                backgroundColor: isDark ? 'transparent' : '#FFFFFF'
              }}
              className="hover:bg-opacity-10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              style={{ 
                backgroundColor: colors.accentColor,
                color: getContrastTextColor(colors.accentColor)
              }}
              className="hover:opacity-90"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              style={{ 
                backgroundColor: colors.successColor,
                color: getContrastTextColor(colors.successColor)
              }}
            >
              Live Trading
            </Badge>
            <Badge 
              variant="outline"
              style={{ 
                borderColor: colors.warningColor,
                color: colors.warningColor,
                backgroundColor: isDark ? 'transparent' : '#FFFFFF'
              }}
            >
              Risk: Medium
            </Badge>
            <Badge 
              variant="outline"
              style={{ 
                borderColor: colors.infoColor,
                color: colors.infoColor,
                backgroundColor: isDark ? 'transparent' : '#FFFFFF'
              }}
            >
              Premium
            </Badge>
          </div>

          {/* Sample Text */}
          <div className="space-y-2">
            <h4 
              className="text-md font-semibold"
              style={{ 
                color: isDark ? '#F9FAFB' : '#111827',
                fontFamily: `'${theme.headingFont}', sans-serif`
              }}
            >
              Recent Activity
            </h4>
            <p 
              className="text-sm"
              style={{ 
                color: isDark ? '#D1D5DB' : '#6B7280',
                fontFamily: `'${theme.bodyFont}', sans-serif`
              }}
            >
              Your trading performance has been exceptional this month. The new strategy implementation 
              is showing promising results with a consistent win rate above 75%.
            </p>
            <div 
              className="text-xs font-mono p-2 rounded"
              style={{ 
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                color: isDark ? '#D1D5DB' : '#6B7280',
                fontFamily: `'${theme.monoFont}', monospace`
              }}
            >
              EUR/USD: 1.0845 → 1.0867 (+22 pips) | GBP/USD: 1.2654 → 1.2631 (-23 pips)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
