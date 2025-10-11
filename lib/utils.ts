import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(date)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function calculateRiskReward(entry: number, stopLoss: number, takeProfit: number): number {
  const risk = Math.abs(entry - stopLoss)
  const reward = Math.abs(takeProfit - entry)
  return reward / risk
}

export function calculateLotSize(
  accountBalance: number,
  riskPercentage: number,
  entryPrice: number,
  stopLoss: number,
  pair: string,
  accountCurrency: string = 'USD',
  leverage: number = 100,
  takeProfit?: number
): {
  lotSize: number
  riskAmount: number
  pipValue: number
  stopLossPips: number
  positionValue: number
  marginRequired: number
  marginLevel: number
  takeProfitPips?: number
  riskRewardRatio?: number
  maxLoss: number
  maxProfit?: number
} {
  const riskAmount = accountBalance * (riskPercentage / 100)
  const pipValue = getPipValue(pair, accountCurrency)
  const stopLossPips = calculateStopLossPips(entryPrice, stopLoss, pair)
  const lotSize = riskAmount / (stopLossPips * pipValue)
  const positionValue = lotSize * 100000 // Standard lot size is 100,000 units
  const marginRequired = (lotSize * entryPrice * 100000) / leverage
  const marginLevel = (accountBalance / marginRequired) * 100
  const maxLoss = lotSize * stopLossPips * pipValue
  
  let takeProfitPips: number | undefined
  let riskRewardRatio: number | undefined
  let maxProfit: number | undefined
  
  if (takeProfit) {
    takeProfitPips = calculateStopLossPips(entryPrice, takeProfit, pair)
    riskRewardRatio = takeProfitPips / stopLossPips
    maxProfit = lotSize * takeProfitPips * pipValue
  }
  
  return {
    lotSize: Math.round(lotSize * 100) / 100,
    riskAmount: Math.round(riskAmount * 100) / 100,
    pipValue: Math.round(pipValue * 100) / 100,
    stopLossPips: Math.round(stopLossPips * 10) / 10,
    positionValue: Math.round(positionValue * 100) / 100,
    marginRequired: Math.round(marginRequired * 100) / 100,
    marginLevel: Math.round(marginLevel * 100) / 100,
    takeProfitPips: takeProfitPips ? Math.round(takeProfitPips * 10) / 10 : undefined,
    riskRewardRatio: riskRewardRatio ? Math.round(riskRewardRatio * 100) / 100 : undefined,
    maxLoss: Math.round(maxLoss * 100) / 100,
    maxProfit: maxProfit ? Math.round(maxProfit * 100) / 100 : undefined
  }
}

export function getPipValue(pair: string, accountCurrency: string = 'USD'): number {
  // Normalize pair format (remove slashes)
  const normalizedPair = pair.replace('/', '').toUpperCase()
  
  const majorPairs = ['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF']
  const jpyPairs = ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY', 'NZDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY']
  const crossPairs = ['EURGBP', 'EURAUD', 'EURNZD', 'EURCAD', 'EURCHF', 'GBPAUD', 'GBPNZD', 'GBPCAD', 'GBPCHF', 'AUDNZD', 'AUDCAD', 'AUDCHF', 'NZDCAD', 'NZDCHF', 'CADCHF']
  
  // For major pairs (USD as quote currency) - 1 pip = $10 per standard lot
  if (majorPairs.includes(normalizedPair)) {
    if (accountCurrency === 'USD') return 10
    return 10 / getExchangeRate('USD', accountCurrency)
  }
  
  // For JPY pairs - 1 pip = ¥1000 per standard lot
  if (jpyPairs.includes(normalizedPair)) {
    if (accountCurrency === 'JPY') return 1000
    return 1000 / getExchangeRate('JPY', accountCurrency)
  }
  
  // For cross pairs, calculate based on quote currency
  if (crossPairs.includes(normalizedPair)) {
    const quoteCurrency = normalizedPair.slice(3)
    
    if (quoteCurrency === 'JPY') {
      // JPY quote currency
      if (accountCurrency === 'JPY') return 1000
      return 1000 / getExchangeRate('JPY', accountCurrency)
    } else if (quoteCurrency === 'USD') {
      // USD quote currency
      if (accountCurrency === 'USD') return 10
      return 10 / getExchangeRate('USD', accountCurrency)
    } else {
      // Other quote currencies (EUR, GBP, AUD, etc.)
      if (accountCurrency === quoteCurrency) return 10
      return 10 / getExchangeRate(quoteCurrency, accountCurrency)
    }
  }
  
  // Default pip value for unknown pairs
  return accountCurrency === 'USD' ? 10 : 10 / getExchangeRate('USD', accountCurrency)
}

export function calculateStopLossPips(entryPrice: number, stopLoss: number, pair: string): number {
  // Normalize pair format (remove slashes)
  const normalizedPair = pair.replace('/', '').toUpperCase()
  
  const jpyPairs = ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY', 'NZDJPY', 'CADJPY', 'CHFJPY']
  
  if (jpyPairs.includes(normalizedPair)) {
    // For JPY pairs, 1 pip = 0.01
    return Math.abs(entryPrice - stopLoss) * 100
  } else {
    // For other pairs, 1 pip = 0.0001
    return Math.abs(entryPrice - stopLoss) * 10000
  }
}

export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  // This is a simplified exchange rate - in a real app, you'd fetch live rates
  const rates: { [key: string]: number } = {
    'USD': 1,
    'EUR': 0.85,
    'GBP': 0.73,
    'JPY': 110,
    'AUD': 1.35,
    'CAD': 1.25,
    'CHF': 0.92,
    'NZD': 1.45
  }
  
  if (fromCurrency === toCurrency) return 1
  return rates[toCurrency] / rates[fromCurrency]
}

export function getSpread(pair: string): number {
  // Typical spreads for major pairs (in pips)
  const spreads: { [key: string]: number } = {
    'EURUSD': 0.8,
    'GBPUSD': 1.2,
    'USDJPY': 0.9,
    'AUDUSD': 1.1,
    'USDCAD': 1.3,
    'USDCHF': 1.4,
    'NZDUSD': 1.5,
    'EURGBP': 1.6,
    'EURJPY': 1.1,
    'GBPJPY': 1.8,
    'AUDJPY': 1.7,
    'EURAUD': 2.1,
    'GBPAUD': 2.3,
    'AUDNZD': 2.5
  }
  
  const normalizedPair = pair.replace('/', '').toUpperCase()
  return spreads[normalizedPair] || 2.0 // Default spread
}

export function calculateSwapCost(
  pair: string, 
  lotSize: number, 
  days: number = 1,
  accountCurrency: string = 'USD'
): number {
  // Simplified swap calculation - in reality, this would depend on interest rates
  const normalizedPair = pair.replace('/', '').toUpperCase()
  const pipValue = getPipValue(normalizedPair, accountCurrency)
  
  // Typical swap rates (in pips per day per lot)
  const swapRates: { [key: string]: number } = {
    'EURUSD': -0.5,
    'GBPUSD': -1.2,
    'USDJPY': 0.3,
    'AUDUSD': -0.8,
    'USDCAD': 0.2,
    'USDCHF': -0.4,
    'NZDUSD': -1.5,
    'EURGBP': -0.3,
    'EURJPY': -0.2,
    'GBPJPY': -0.9,
    'AUDJPY': -0.5,
    'EURAUD': -0.7,
    'GBPAUD': -1.0,
    'AUDNZD': -1.3
  }
  
  const swapRate = swapRates[normalizedPair] || -0.5
  return (swapRate * pipValue * lotSize * days) / 10 // Convert to account currency
}

export function calculatePositionMetrics(
  accountBalance: number,
  lotSize: number,
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  pair: string,
  accountCurrency: string = 'USD',
  leverage: number = 100
): {
  positionValue: number
  marginRequired: number
  marginLevel: number
  spreadCost: number
  swapCost: number
  totalCosts: number
  netProfitPotential: number
  riskRewardRatio: number
} {
  const positionValue = lotSize * 100000
  const marginRequired = (lotSize * entryPrice * 100000) / leverage
  const marginLevel = (accountBalance / marginRequired) * 100
  const spreadCost = (getSpread(pair) * getPipValue(pair, accountCurrency) * lotSize) / 10
  const swapCost = calculateSwapCost(pair, lotSize, 1, accountCurrency)
  const totalCosts = spreadCost + swapCost
  
  const stopLossPips = calculateStopLossPips(entryPrice, stopLoss, pair)
  const takeProfitPips = calculateStopLossPips(entryPrice, takeProfit, pair)
  const riskRewardRatio = takeProfitPips / stopLossPips
  
  const maxLoss = lotSize * stopLossPips * getPipValue(pair, accountCurrency)
  const maxProfit = lotSize * takeProfitPips * getPipValue(pair, accountCurrency)
  const netProfitPotential = maxProfit - totalCosts
  
  return {
    positionValue: Math.round(positionValue * 100) / 100,
    marginRequired: Math.round(marginRequired * 100) / 100,
    marginLevel: Math.round(marginLevel * 100) / 100,
    spreadCost: Math.round(spreadCost * 100) / 100,
    swapCost: Math.round(swapCost * 100) / 100,
    totalCosts: Math.round(totalCosts * 100) / 100,
    netProfitPotential: Math.round(netProfitPotential * 100) / 100,
    riskRewardRatio: Math.round(riskRewardRatio * 100) / 100
  }
}

export function getCurrencyStrength(pair: string, price: number): 'strong' | 'moderate' | 'weak' {
  // This is a simplified calculation - in real app, you'd use actual market data
  const random = Math.random()
  if (random > 0.7) return 'strong'
  if (random > 0.3) return 'moderate'
  return 'weak'
}

export function getSentimentColor(sentiment: 'bullish' | 'bearish', percentage: number): string {
  if (sentiment === 'bullish') {
    if (percentage >= 80) return 'bg-green-600'
    if (percentage >= 60) return 'bg-green-500'
    if (percentage >= 40) return 'bg-green-400'
    return 'bg-green-300'
  } else {
    if (percentage >= 80) return 'bg-red-600'
    if (percentage >= 60) return 'bg-red-500'
    if (percentage >= 40) return 'bg-red-400'
    return 'bg-red-300'
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase()
  return cleanName.substr(0, 6) + randomSuffix
}
