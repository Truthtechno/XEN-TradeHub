'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// Theme-aware className utilities
export const themeClasses = {
  // Background colors
  bg: {
    primary: 'bg-theme-primary',
    secondary: 'bg-theme-secondary',
    accent: 'bg-theme-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
    card: 'bg-theme-card',
    'card-hover': 'bg-theme-card-hover',
    theme: 'bg-theme',
    'theme-secondary': 'bg-theme-secondary',
    'theme-tertiary': 'bg-theme-tertiary',
  },
  
  // Text colors
  text: {
    primary: 'text-theme-primary',
    secondary: 'text-theme-secondary',
    accent: 'text-theme-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
    theme: 'text-theme',
    'theme-secondary': 'text-theme-secondary',
    'theme-tertiary': 'text-theme-tertiary',
  },
  
  // Border colors
  border: {
    primary: 'border-theme-primary',
    secondary: 'border-theme-secondary',
    accent: 'border-theme-accent',
    success: 'border-success',
    warning: 'border-warning',
    error: 'border-error',
    info: 'border-info',
    theme: 'border-theme',
    'theme-secondary': 'border-theme-secondary',
    card: 'border-theme-card-border',
  },
  
  // Typography
  typography: {
    heading: 'font-heading',
    body: 'font-body',
    mono: 'font-mono tabular-nums',
  },
  
  // Shadows
  shadow: {
    sm: 'shadow-theme-sm',
    md: 'shadow-theme-md',
    lg: 'shadow-theme-lg',
    xl: 'shadow-theme-xl',
  },
}

// Financial data formatting with theme-aware styling
export function formatCurrency(
  amount: number, 
  currency: string = 'USD',
  className?: string
) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {formatted}
    </span>
  )
}

// Percentage formatting with color coding
export function formatPercentage(
  value: number,
  className?: string
) {
  const isPositive = value >= 0
  const colorClass = isPositive ? 'text-success' : 'text-error'
  const sign = isPositive ? '+' : ''
  
  return (
    <span className={cn('font-mono tabular-nums', colorClass, className)}>
      {sign}{value.toFixed(2)}%
    </span>
  )
}

// Price change formatting
export function formatPriceChange(
  current: number,
  previous: number,
  className?: string
) {
  const change = current - previous
  const changePercent = (change / previous) * 100
  const isPositive = change >= 0
  
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className={cn('font-mono tabular-nums', isPositive ? 'text-success' : 'text-error')}>
        {isPositive ? '+' : ''}{change.toFixed(2)}
      </span>
      <span className={cn('text-sm font-mono tabular-nums', isPositive ? 'text-success' : 'text-error')}>
        ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
      </span>
    </div>
  )
}

// Status badge component
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  const statusClasses = {
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    error: 'bg-error/10 text-error border border-error/20',
    info: 'bg-info/10 text-info border border-info/20',
    neutral: 'bg-theme-neutral-100 text-theme-neutral-800 border border-theme-neutral-200',
  }
  
  return (
    <span className={cn(baseClasses, statusClasses[status], className)}>
      {children}
    </span>
  )
}

// Theme-aware card component
interface ThemeCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  variant?: 'default' | 'outlined' | 'elevated'
}

export function ThemeCard({ 
  children, 
  className, 
  hover = false, 
  variant = 'default' 
}: ThemeCardProps) {
  const baseClasses = 'rounded-lg border transition-all duration-200'
  
  const variantClasses = {
    default: 'bg-theme-card border-theme-card-border',
    outlined: 'bg-transparent border-theme',
    elevated: 'bg-theme-card border-theme-card-border shadow-theme-md',
  }
  
  const hoverClasses = hover ? 'hover:bg-theme-card-hover hover:shadow-theme-lg' : ''
  
  return (
    <div className={cn(baseClasses, variantClasses[variant], hoverClasses, className)}>
      {children}
    </div>
  )
}

// Financial metric display component
interface FinancialMetricProps {
  label: string
  value: number
  currency?: string
  change?: number
  changePercent?: number
  className?: string
}

export function FinancialMetric({
  label,
  value,
  currency = 'USD',
  change,
  changePercent,
  className
}: FinancialMetricProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="text-sm text-theme-secondary font-body">{label}</div>
      <div className="text-lg font-semibold font-mono tabular-nums text-theme">
        {formatCurrency(value, currency)}
      </div>
      {change !== undefined && changePercent !== undefined && (
        <div className="text-sm">
          {formatPriceChange(value, value - change)}
        </div>
      )}
    </div>
  )
}

// Trading signal component
interface TradingSignalProps {
  pair: string
  action: 'BUY' | 'SELL' | 'HOLD'
  price: number
  target?: number
  stopLoss?: number
  confidence: number
  className?: string
}

export function TradingSignal({
  pair,
  action,
  price,
  target,
  stopLoss,
  confidence,
  className
}: TradingSignalProps) {
  const actionColor = action === 'BUY' ? 'success' : action === 'SELL' ? 'error' : 'warning'
  
  return (
    <ThemeCard className={cn('p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="font-mono tabular-nums text-lg font-semibold text-theme">
          {pair}
        </div>
        <StatusBadge status={actionColor}>
          {action}
        </StatusBadge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-theme-secondary">Price:</span>
          <span className="font-mono tabular-nums text-theme">
            {formatCurrency(price)}
          </span>
        </div>
        
        {target && (
          <div className="flex justify-between text-sm">
            <span className="text-theme-secondary">Target:</span>
            <span className="font-mono tabular-nums text-success">
              {formatCurrency(target)}
            </span>
          </div>
        )}
        
        {stopLoss && (
          <div className="flex justify-between text-sm">
            <span className="text-theme-secondary">Stop Loss:</span>
            <span className="font-mono tabular-nums text-error">
              {formatCurrency(stopLoss)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-theme-secondary">Confidence:</span>
          <span className="font-mono tabular-nums text-theme">
            {confidence}%
          </span>
        </div>
      </div>
    </ThemeCard>
  )
}
