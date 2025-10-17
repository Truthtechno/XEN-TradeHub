'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3, 
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap
} from 'lucide-react'

interface ThemeShowcaseProps {
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

export function ThemeShowcase({ theme, isDark }: ThemeShowcaseProps) {
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
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-theme mb-2" style={{ fontFamily: theme.headingFont }}>
          Theme Showcase
        </h2>
        <p className="text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
          See how your theme looks across different components and layouts
        </p>
      </div>

      {/* Trading Dashboard Preview */}
      <Card className="card-elevated">
        <CardHeader 
          className="pb-4"
          style={{ 
            backgroundColor: colors.primaryColor,
            color: getContrastTextColor(colors.primaryColor)
          }}
        >
          <CardTitle 
            className="text-xl flex items-center gap-2"
            style={{ fontFamily: theme.headingFont, color: '#FFFFFa' }}
          >
            <Activity className="w-5 h-5" />
            Trading Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent 
          className="space-y-6"
          style={{ 
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            color: isDark ? '#F8FAFC' : '#0F172A'
          }}
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-theme bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
                  Portfolio Value
                </span>
                <TrendingUp className="w-4 h-4" style={{ color: colors.successColor }} />
              </div>
              <div className="text-2xl font-bold" style={{ 
                color: colors.successColor,
                fontFamily: theme.monoFont 
              }}>
                $127,543.21
              </div>
              <div className="text-sm text-theme-secondary" style={{ fontFamily: theme.monoFont }}>
                +2.34% (+$2,891.45)
              </div>
            </div>

            <div className="p-4 rounded-lg border border-theme bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
                  Win Rate
                </span>
                <Target className="w-4 h-4" style={{ color: colors.primaryColor }} />
              </div>
              <div className="text-2xl font-bold" style={{ 
                color: colors.primaryColor,
                fontFamily: theme.monoFont 
              }}>
                78.5%
              </div>
              <div className="text-sm text-theme-secondary" style={{ fontFamily: theme.monoFont }}>
                47 wins / 13 losses
              </div>
            </div>

            <div className="p-4 rounded-lg border border-theme bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
                  Active Trades
                </span>
                <Zap className="w-4 h-4" style={{ color: colors.infoColor }} />
              </div>
              <div className="text-2xl font-bold" style={{ 
                color: colors.infoColor,
                fontFamily: theme.monoFont 
              }}>
                12
              </div>
              <div className="text-sm text-theme-secondary" style={{ fontFamily: theme.monoFont }}>
                8 long / 4 short
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="theme-primary"
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              New Trade
            </Button>
            <Button
              variant="theme-secondary"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button
              variant="theme-accent"
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            <Button
              variant="outline"
              className="border-theme-primary text-theme-primary hover:bg-theme-primary/10"
            >
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="success"
              className="flex items-center gap-1"
            >
              <div className="w-2 h-2 rounded-full bg-white" />
              Live Trading
            </Badge>
            <Badge 
              variant="outline"
              className="border-theme-warning text-theme-warning"
            >
              Risk: Medium
            </Badge>
            <Badge 
              variant="outline"
              className="border-theme-info text-theme-info"
            >
              Premium Member
            </Badge>
            <Badge 
              variant="outline"
              className="border-theme-error text-theme-error"
            >
              High Volatility
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Financial Data Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: theme.headingFont }}>
            <BarChart3 className="w-5 h-5" />
            Recent Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme">
                  <th className="text-left py-3 px-4 text-sm font-medium text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
                    Symbol
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
                    Entry
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
                    Exit
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
                    P&L
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { symbol: 'EUR/USD', type: 'Long', entry: '1.0845', exit: '1.0867', pnl: '+$1,234.56', status: 'Won' },
                  { symbol: 'GBP/USD', type: 'Short', entry: '1.2654', exit: '1.2631', pnl: '+$892.34', status: 'Won' },
                  { symbol: 'USD/JPY', type: 'Long', entry: '149.23', exit: '148.87', pnl: '-$456.78', status: 'Lost' },
                  { symbol: 'AUD/USD', type: 'Long', entry: '0.6523', exit: '0.6545', pnl: '+$567.89', status: 'Won' },
                ].map((trade, index) => (
                  <tr key={index} className="border-b border-theme-secondary hover:bg-theme-tertiary/50">
                    <td className="py-3 px-4 font-medium text-theme" style={{ fontFamily: theme.monoFont }}>
                      {trade.symbol}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={trade.type === 'Long' ? 'success' : 'destructive'}
                        className="text-xs"
                      >
                        {trade.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-theme" style={{ fontFamily: theme.monoFont }}>
                      {trade.entry}
                    </td>
                    <td className="py-3 px-4 text-right text-theme" style={{ fontFamily: theme.monoFont }}>
                      {trade.exit}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span 
                        className={`font-medium ${trade.pnl.startsWith('+') ? 'text-theme-success' : 'text-theme-error'}`}
                        style={{ fontFamily: theme.monoFont }}
                      >
                        {trade.pnl}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant={trade.status === 'Won' ? 'success' : 'destructive'}
                        className="text-xs"
                      >
                        {trade.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Typography Showcase */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle style={{ fontFamily: theme.headingFont }}>
            Typography Showcase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-theme" style={{ fontFamily: theme.headingFont }}>
              Heading 1 - {theme.headingFont}
            </h1>
            <h2 className="text-2xl font-semibold text-theme" style={{ fontFamily: theme.headingFont }}>
              Heading 2 - {theme.headingFont}
            </h2>
            <h3 className="text-xl font-semibold text-theme" style={{ fontFamily: theme.headingFont }}>
              Heading 3 - {theme.headingFont}
            </h3>
            <p className="text-base text-theme" style={{ fontFamily: theme.bodyFont }}>
              Body text - {theme.bodyFont}. This is how your content will look with the selected font. 
              It should be highly readable and professional for financial data.
            </p>
            <p className="text-sm text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
              Small text - {theme.bodyFont}. Used for captions, labels, and secondary information.
            </p>
            <div className="bg-theme-tertiary p-3 rounded-lg">
              <code className="text-sm text-theme" style={{ fontFamily: theme.monoFont }}>
                Code text - {theme.monoFont}<br/>
                EUR/USD: 1.0845 → 1.0867 (+22 pips)<br/>
                GBP/USD: 1.2654 → 1.2631 (-23 pips)
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle style={{ fontFamily: theme.headingFont }}>
            Color Palette
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Primary', color: colors.primaryColor, description: 'Main brand color' },
              { name: 'Secondary', color: colors.secondaryColor, description: 'Secondary actions' },
              { name: 'Accent', color: colors.accentColor, description: 'Success states' },
              { name: 'Success', color: colors.successColor, description: 'Positive feedback' },
              { name: 'Warning', color: colors.warningColor, description: 'Caution alerts' },
              { name: 'Error', color: colors.errorColor, description: 'Error states' },
              { name: 'Info', color: colors.infoColor, description: 'Information' },
              { name: 'Neutral', color: colors.neutralColor, description: 'Text & subtle UI' },
            ].map((color) => (
              <div key={color.name} className="text-center">
                <div 
                  className="w-full h-16 rounded-lg border border-theme mb-2"
                  style={{ backgroundColor: color.color }}
                />
                <div className="text-sm font-medium text-theme" style={{ fontFamily: theme.bodyFont }}>
                  {color.name}
                </div>
                <div className="text-xs text-theme-secondary" style={{ fontFamily: theme.bodyFont }}>
                  {color.description}
                </div>
                <div className="text-xs text-theme-tertiary font-mono" style={{ fontFamily: theme.monoFont }}>
                  {color.color}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
