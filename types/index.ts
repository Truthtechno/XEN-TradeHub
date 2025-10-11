import { User, Course, Signal, Resource, Event, Forecast, Booking, Notification, Subscription, BrokerAccount, UserProfile } from '@prisma/client'

export type {
  User,
  Course,
  Signal,
  Resource,
  Event,
  Forecast,
  Booking,
  Notification,
  Subscription,
  BrokerAccount,
  UserProfile
} from '@prisma/client'

export interface UserWithProfile extends User {
  profile?: UserProfile | null
  subscription?: Subscription | null
  brokerAccount?: BrokerAccount | null
}

export interface CourseWithProgress extends Course {
  progress?: number
  completed?: boolean
  enrolledAt?: Date
}

export interface SignalWithSubscription extends Signal {
  isSubscribed?: boolean
}

export interface ResourceWithEngagement extends Resource {
  isLiked?: boolean
  isBookmarked?: boolean
}

export interface DashboardStats {
  totalCourses: number
  completedCourses: number
  activeSignals: number
  totalEarnings: number
  subscriptionStatus: string
  nextPaymentDate?: Date
}

export interface MarketData {
  pair: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  close: number
}

export interface CurrencyStrength {
  currency: string
  strength: number
  change: number
  pairs: string[]
}

export interface HeatmapData {
  [key: string]: {
    [key: string]: {
      change: number
      price: number
      strength: 'strong' | 'moderate' | 'weak'
    }
  }
}

export interface SentimentData {
  pair: string
  bullish: number
  bearish: number
  total: number
  bullishPercent: number
  bearishPercent: number
}

export interface AffiliateStats {
  totalClicks: number
  totalConversions: number
  conversionRate: number
  totalEarnings: number
  monthlyEarnings: number
  topReferrers: Array<{
    code: string
    clicks: number
    conversions: number
    earnings: number
  }>
}

export interface NotificationData {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
}

export interface BookingSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
  isAvailable: boolean
  type: string
  price?: number
}

export interface CourseModule {
  id: string
  title: string
  description: string
  duration: number
  videoUrl?: string
  isCompleted: boolean
  order: number
}

export interface TradingSignal {
  id: string
  pair: string
  action: 'BUY' | 'SELL'
  entryPrice: number
  stopLoss: number
  takeProfit: number
  riskReward: number
  lotSize: number
  description: string
  chartImage?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EconomicEvent {
  id: string
  title: string
  country: string
  impact: 'High' | 'Medium' | 'Low'
  previous: string
  forecast: string
  actual?: string
  date: Date
  currency: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SearchFilters {
  query?: string
  category?: string
  level?: string
  type?: string
  isPremium?: boolean
  isFree?: boolean
  dateFrom?: Date
  dateTo?: Date
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  notifications: {
    signals: boolean
    courses: boolean
    bookings: boolean
    payments: boolean
    system: boolean
  }
  trading: {
    defaultLotSize: number
    riskPercentage: number
    preferredPairs: string[]
    timezone: string
  }
  display: {
    currency: string
    dateFormat: string
    timeFormat: '12h' | '24h'
  }
}
