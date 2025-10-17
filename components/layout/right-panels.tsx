'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Activity, AlertCircle, BarChart3, Bell, BookOpen, Building, Calculator, Calendar, CheckCircle, CheckSquare, Crown, DollarSign, Eye, EyeOff, Gift, Globe, GraduationCap, Hand, Headphones, Heart, HelpCircle, Home, Info, Lock, Megaphone, MessageCircle, MessageSquare, Settings, Shield, Star, Target, TrendingUp, Trophy, Users, X } from 'lucide-react'
import { useTheme } from '@/lib/optimized-theme-context'
import { useNotifications } from '@/lib/notifications-context'
import { useSession } from 'next-auth/react'

interface RightPanelsProps {
  isForecastOpen: boolean
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
  isForecastOpen, 
  isCalculatorOpen, 
  isSettingsOpen, 
  isNotificationsOpen, 
  onClose,
  user,
  notifications = 0
}: RightPanelsProps) {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { notifications: userNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { data: session } = useSession()

  // Helper functions for notification display
  const getNotificationIcon = (type: string) => {
    switch (type) {
      // Student notification types
      case 'LOGIN':
        return CheckCircle
      case 'WELCOME':
        return Info
      case 'SYSTEM':
        return AlertCircle
      case 'UPDATE':
        return CheckCircle
      case 'SECURITY':
        return Shield
      case 'PROMOTION':
        return Gift
      case 'SIGNAL':
        return Bell
      case 'COURSE':
        return Calendar
      case 'BOOKING':
        return Calendar
      case 'PAYMENT':
        return CheckCircle
      // Admin notification types
      case 'STUDENT_PURCHASE':
        return Gift
      case 'STUDENT_ENROLLMENT':
        return CheckCircle
      case 'STUDENT_REGISTRATION':
        return Calendar
      case 'STUDENT_ENQUIRY':
        return Info
      case 'STUDENT_ACTIVITY':
        return Bell
      default:
        return Bell
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      // Student notification types
      case 'LOGIN': return 'default'
      case 'WELCOME': return 'secondary'
      case 'SYSTEM': return 'destructive'
      case 'UPDATE': return 'outline'
      case 'SECURITY': return 'destructive'
      case 'PROMOTION': return 'secondary'
      case 'SIGNAL': return 'signal'
      case 'COURSE': return 'outline'
      case 'BOOKING': return 'outline'
      case 'PAYMENT': return 'default'
      // Admin notification types
      case 'STUDENT_PURCHASE': return 'secondary'
      case 'STUDENT_ENROLLMENT': return 'default'
      case 'STUDENT_REGISTRATION': return 'outline'
      case 'STUDENT_ENQUIRY': return 'secondary'
      case 'STUDENT_ACTIVITY': return 'default'
      default: return 'default'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      // Student notification types
      case 'LOGIN': return 'text-theme-success'
      case 'WELCOME': return 'text-theme-primary'
      case 'SYSTEM': return 'text-theme-warning'
      case 'UPDATE': return 'text-theme-info'
      case 'SECURITY': return 'text-theme-error'
      case 'PROMOTION': return 'text-theme-accent'
      case 'SIGNAL': return 'text-theme-primary'
      case 'COURSE': return 'text-theme-info'
      case 'BOOKING': return 'text-theme-info'
      case 'PAYMENT': return 'text-theme-success'
      // Admin notification types
      case 'STUDENT_PURCHASE': return 'text-theme-accent'
      case 'STUDENT_ENROLLMENT': return 'text-theme-success'
      case 'STUDENT_REGISTRATION': return 'text-theme-info'
      case 'STUDENT_ENQUIRY': return 'text-theme-warning'
      case 'STUDENT_ACTIVITY': return 'text-theme-primary'
      default: return 'text-theme-primary'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }
  
  // Use session user or fallback to user prop
  const currentUser = session?.user || user
  const isLoggedIn = !!currentUser
  
  // Debug logging
  console.log('RightPanels - currentUser:', currentUser);
  console.log('RightPanels - session:', session);
  console.log('RightPanels - user prop:', user);
  console.log('RightPanels - isLoggedIn:', isLoggedIn);
  const [showPassword, setShowPassword] = useState(false)
  
  // Calculator form state
  const [calculatorForm, setCalculatorForm] = useState({
    accountBalance: 10000,
    accountCurrency: 'USD',
    riskPercentage: 2,
    currencyPair: 'EURUSD',
    entryPrice: 1.0850,
    stopLossPrice: 1.0800,
    takeProfitPrice: 1.0950,
    leverage: 100,
    profitRatio: '1:2',
    stopLossMethod: 'price'
  });

  // Forecast panel state
  const [forecastTab, setForecastTab] = useState<'public' | 'premium'>('public')
  const [publicForecasts, setPublicForecasts] = useState<any[]>([])
  const [premiumForecasts, setPremiumForecasts] = useState<any[]>([])
  const [isLoadingForecasts, setIsLoadingForecasts] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [hasPremiumAccess, setHasPremiumAccess] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('corefx-premium-access');
      return stored === 'true';
    }
    return false;
  })
  const [premiumForecastsLoaded, setPremiumForecastsLoaded] = useState(false)
  
  // Debug state changes
  console.log('RightPanels - State:', {
    hasSubscription,
    hasPremiumAccess,
    premiumForecastsLoaded,
    premiumForecastsCount: premiumForecasts.length,
    isForecastOpen
  });

  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedForecast, setSelectedForecast] = useState<any>(null)
  const [forecastComments, setForecastComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Fetch forecasts function
  const fetchForecasts = async (type: 'public' | 'premium') => {
    if (isLoadingForecasts) return;
    
    console.log(`Fetching ${type} forecasts...`);
    setIsLoadingForecasts(true);
    try {
      const response = await fetch(`/api/forecasts?type=${type}&limit=20&t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Received ${type} forecasts:`, data.forecasts?.length || 0);
        if (type === 'public') {
          setPublicForecasts(data.forecasts || []);
        } else {
          setPremiumForecasts(data.forecasts || []);
          setPremiumForecastsLoaded(true);
        }
      } else {
        console.error(`Failed to fetch ${type} forecasts:`, response.status);
      }
    } catch (error) {
      console.error('Failed to fetch forecasts:', error);
    } finally {
      setIsLoadingForecasts(false);
    }
  };

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    console.log('Checking subscription status - currentUser:', currentUser);
    
    // Don't return early if currentUser is not available - the API should work with session
    
    try {
      // Use the same access control system as the signals page
      const accessResponse = await fetch('/api/user/access', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (accessResponse.ok) {
        const accessData = await accessResponse.json();
        const userAccess = accessData.data;
        
        console.log('User access data:', userAccess);
        
        // Check if user has premium access (mentorship) or signal subscription
        if (userAccess.subscriptionType === 'PREMIUM') {
          // Premium user - has infinite access
          console.log('Setting premium access: true');
          setHasSubscription(true);
          setHasPremiumAccess(true);
          // Persist to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('corefx-premium-access', 'true');
          }
        } else if (userAccess.subscriptionType === 'SIGNALS') {
          // Signal subscriber - check signal subscription details
          const signalsResponse = await fetch('/api/payments/signals', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (signalsResponse.ok) {
            const signalsData = await signalsResponse.json();
            const hasActiveSubscription = signalsData.subscription?.hasActiveSubscription || false;
            console.log('Signals subscription data:', signalsData);
            console.log('Setting subscription access:', hasActiveSubscription);
            setHasSubscription(hasActiveSubscription);
            setHasPremiumAccess(hasActiveSubscription);
            // Persist to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('corefx-premium-access', hasActiveSubscription.toString());
            }
          } else {
            console.log('Signals API failed, setting no access');
            setHasSubscription(false);
            setHasPremiumAccess(false);
          }
        } else {
          // No subscription
          console.log('No subscription, setting no access');
          setHasSubscription(false);
          setHasPremiumAccess(false);
          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('corefx-premium-access');
          }
        }
      } else {
        console.log('Access API failed, setting no access');
        setHasSubscription(false);
        setHasPremiumAccess(false);
        // Clear localStorage on API failure
        if (typeof window !== 'undefined') {
          localStorage.removeItem('corefx-premium-access');
        }
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      setHasSubscription(false);
      setHasPremiumAccess(false);
      // Clear localStorage on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('corefx-premium-access');
      }
    }
  };

  // Like/unlike forecast function
  const handleLikeForecast = async (forecastId: string, isLiked: boolean) => {
    try {
      const response = await fetch(`/api/forecasts/${forecastId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update local state with actual response data
        const updateForecast = (forecasts: any[]) => 
          forecasts.map(forecast => 
            forecast.id === forecastId 
              ? { 
                  ...forecast, 
                  isLiked: data.liked,
                  likes: data.likes 
                }
              : forecast
          );
        
        setPublicForecasts(updateForecast(publicForecasts));
        setPremiumForecasts(updateForecast(premiumForecasts));
        
        console.log('Like updated:', data);
      } else {
        const errorData = await response.json();
        console.error('Like failed:', errorData);
        alert('Failed to like forecast. Please try again.');
      }
    } catch (error) {
      console.error('Failed to like/unlike forecast:', error);
      alert('Failed to like forecast. Please try again.');
    }
  };

  // Handle comment click
  const handleCommentClick = async (forecast: any) => {
    setSelectedForecast(forecast);
    setCommentModalOpen(true);
    setNewComment('');
    
    // Fetch existing comments
    try {
      const response = await fetch(`/api/forecasts/${forecast.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setForecastComments(data.comments || []);
      } else {
        console.error('Failed to fetch comments');
        setForecastComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setForecastComments([]);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !selectedForecast) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/forecasts/${selectedForecast.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          isAdmin: false, // Let API determine admin status
          userInfo: currentUser ? {
            name: currentUser.name,
            email: currentUser.email,
            role: (currentUser as any).role
          } : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setForecastComments(prev => [data.comment, ...prev]);
        setNewComment('');
        
        // Update forecast comment count
        const updateForecast = (forecasts: any[]) => 
          forecasts.map(forecast => 
            forecast.id === selectedForecast.id 
              ? { 
                  ...forecast, 
                  comments: (forecast.comments || 0) + 1
                }
              : forecast
          );
        
        setPublicForecasts(updateForecast(publicForecasts));
        setPremiumForecasts(updateForecast(premiumForecasts));
        
        console.log('Comment added successfully');
      } else {
        const errorData = await response.json();
        console.error('Comment failed:', errorData);
        alert('Failed to add comment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Load forecasts when panel opens
  useEffect(() => {
    if (isForecastOpen) {
      fetchForecasts('public');
      // Always check subscription status when panel opens, even if currentUser is not yet available
      checkSubscriptionStatus();
    } else {
      // Reset state when panel closes
      setPremiumForecastsLoaded(false);
    }
  }, [isForecastOpen]);

  // Initialize premium access from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAccess = localStorage.getItem('corefx-premium-access');
      if (storedAccess === 'true') {
        console.log('Initializing premium access from localStorage');
        setHasPremiumAccess(true);
        setHasSubscription(true);
        // If panel is open, load premium forecasts immediately
        if (isForecastOpen) {
          console.log('Loading premium forecasts from localStorage initialization');
          fetchForecasts('premium');
        }
      }
    }
  }, [isForecastOpen]);

  // Cleanup localStorage when user logs out
  useEffect(() => {
    if (!currentUser && !session) {
      console.log('User logged out, clearing premium access from localStorage');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('corefx-premium-access');
      }
      setHasPremiumAccess(false);
      setHasSubscription(false);
    }
  }, [currentUser, session]);

  // Check subscription when currentUser becomes available
  useEffect(() => {
    if (currentUser && isForecastOpen) {
      console.log('CurrentUser became available, checking subscription status');
      checkSubscriptionStatus();
    }
  }, [currentUser, isForecastOpen]);

  // Fallback: Check subscription status periodically if not set
  useEffect(() => {
    if (isForecastOpen && !hasPremiumAccess && !isLoadingForecasts) {
      const interval = setInterval(() => {
        console.log('Fallback: Checking subscription status');
        checkSubscriptionStatus();
      }, 2000); // Check every 2 seconds

      // Clear interval after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isForecastOpen, hasPremiumAccess, isLoadingForecasts]);

  // Fetch premium forecasts when user gains premium access
  useEffect(() => {
    if (isForecastOpen && hasPremiumAccess && !premiumForecastsLoaded) {
      console.log('Loading premium forecasts for user with premium access');
      fetchForecasts('premium');
    }
  }, [isForecastOpen, hasPremiumAccess, premiumForecastsLoaded]);

  // Reset premium forecasts when access is lost
  useEffect(() => {
    if (isForecastOpen && !hasPremiumAccess) {
      console.log('Clearing premium forecasts - no premium access');
      setPremiumForecasts([]);
      setPremiumForecastsLoaded(false);
    }
  }, [isForecastOpen, hasPremiumAccess]);

  // Helper function for lot size calculation
  const calculateLotSize = React.useCallback(() => {
    const { accountBalance, riskPercentage, entryPrice, stopLossPrice } = calculatorForm;
    
    if (!entryPrice || !stopLossPrice || entryPrice <= 0 || stopLossPrice <= 0) {
      return {
        lotSize: 0,
        riskAmount: 0,
        pipValue: 0,
        stopLossPips: 0,
        positionValue: 0,
        marginRequired: 0,
        marginLevel: 0,
        maxLoss: 0,
        takeProfitPips: 0,
        riskRewardRatio: 0,
        maxProfit: 0
      };
    }
    
    const riskAmount = (accountBalance * riskPercentage) / 100;
    const stopLossPips = Math.abs(entryPrice - stopLossPrice) * 10000;
    const pipValue = 10;
    const lotSize = riskAmount / (stopLossPips * pipValue);
    const positionValue = lotSize * 100000;
    const marginRequired = (positionValue * entryPrice) / calculatorForm.leverage;
    const marginLevel = (accountBalance / marginRequired) * 100;
    const maxLoss = riskAmount;
    
    return {
      lotSize: Math.round(lotSize * 100) / 100,
      riskAmount: Math.round(riskAmount * 100) / 100,
      pipValue,
      stopLossPips: Math.round(stopLossPips * 10) / 10,
      positionValue: Math.round(positionValue * 100) / 100,
      marginRequired: Math.round(marginRequired * 100) / 100,
      marginLevel: Math.round(marginLevel * 100) / 100,
      maxLoss: Math.round(maxLoss * 100) / 100,
      takeProfitPips: 100,
      riskRewardRatio: 2,
      maxProfit: riskAmount * 2
    };
  }, [calculatorForm]);

  return (
    <>
      {/* Forecast Panel */}
      {isForecastOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => onClose('forecast')}>
          <div 
            className={`fixed right-0 top-0 h-full w-full sm:w-[500px] shadow-xl transform transition-all duration-300 ease-in-out flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-3 sm:p-4 border-b transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <TrendingUp className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-base sm:text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Market Forecasts</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClose('forecast')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Tab Navigation */}
            <div className={`flex border-b transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setForecastTab('public')}
                className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  forecastTab === 'public'
                    ? `${isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'}`
                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <Globe className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Public</span>
              </button>
              <button
                onClick={() => setForecastTab('premium')}
                className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  forecastTab === 'premium'
                    ? `${isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'}`
                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <Crown className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Premium</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {isLoadingForecasts ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {forecastTab === 'public' ? (
                    <div className="space-y-3 sm:space-y-4">
                      {publicForecasts.length > 0 ? (
                        publicForecasts.map((forecast) => (
                          <Card key={forecast.id} className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                                <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                                  <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                    {forecast.type === 'signal' ? 'Signal' : 'Forecast'}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                                    {forecast.pair || 'N/A'}
                                  </Badge>
                                </div>
                                <span className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(forecast.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <h3 className={`text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {forecast.title}
                              </h3>
                              
                              <p className={`text-xs sm:text-sm mb-2 sm:mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {forecast.description}
                              </p>

                              {/* Trading Details for Signals */}
                              {forecast.type === 'signal' && (
                                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                  {forecast.entryPrice && (
                                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Entry:</span>
                                      <span className={`ml-1 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{forecast.entryPrice}</span>
                                    </div>
                                  )}
                                  {forecast.stopLoss && (
                                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>SL:</span>
                                      <span className={`ml-1 font-medium text-red-500`}>{forecast.stopLoss}</span>
                                    </div>
                                  )}
                                  {forecast.takeProfit && (
                                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>TP:</span>
                                      <span className={`ml-1 font-medium text-green-500`}>{forecast.takeProfit}</span>
                                    </div>
                                  )}
                                  {forecast.action && (
                                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Action:</span>
                                      <span className={`ml-1 font-medium ${forecast.action === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{forecast.action}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Chart Image */}
                              {forecast.imageUrl && (
                                <div className="mb-2 sm:mb-3">
                                  <img 
                                    src={forecast.imageUrl} 
                                    alt="Chart" 
                                    className="w-full h-28 sm:h-32 object-cover rounded"
                                  />
                                </div>
                              )}

                              {/* Engagement Stats */}
                              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                  <button
                                    onClick={() => handleLikeForecast(forecast.id, forecast.isLiked)}
                                    className={`flex items-center transition-colors duration-200 ${
                                      forecast.isLiked 
                                        ? 'text-red-500' 
                                        : `${isDarkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-500 hover:text-red-500'}`
                                    } cursor-pointer`}
                                  >
                                    <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1 ${forecast.isLiked ? 'fill-current' : ''}`} />
                                    {forecast.likes || 0}
                                  </button>
                                  <button
                                    onClick={() => handleCommentClick(forecast)}
                                    className={`flex items-center transition-colors duration-200 ${
                                      `${isDarkMode ? 'text-gray-400 hover:text-blue-500' : 'text-gray-500 hover:text-blue-600'}`
                                    } cursor-pointer`}
                                  >
                                    <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />
                                    {forecast.comments || 0}
                                  </button>
                                </div>
                                <Badge variant="outline" className="text-[10px] sm:text-xs">
                                  {forecast.isPublic ? 'Public' : 'Premium'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <TrendingUp className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          <h3 className={`text-base sm:text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Public Forecasts</h3>
                          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Check back later for new trading signals and market forecasts.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {!currentUser ? (
                        <div className="text-center py-6 sm:py-8 px-4">
                          <Lock className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          <h3 className={`text-base sm:text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Login Required</h3>
                          <p className={`text-xs sm:text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Please log in to view premium forecasts and trading signals.
                          </p>
                        </div>
                      ) : !hasPremiumAccess ? (
                        <div className="text-center py-6 sm:py-8 px-4">
                          <Crown className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
                          <h3 className={`text-base sm:text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Premium Access Required</h3>
                          <p className={`text-xs sm:text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Subscribe to access exclusive premium forecasts and advanced trading signals.
                          </p>
                          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm">
                            <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Subscribe Now
                          </Button>
                        </div>
                      ) : premiumForecasts.length > 0 ? (
                        premiumForecasts.map((forecast) => (
                          <Card key={forecast.id} className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                                <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                                  <Badge variant="secondary" className={`text-[10px] sm:text-xs ${isDarkMode ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-100 text-yellow-800'}`}>
                                    <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                    Premium
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                                    {forecast.pair || 'N/A'}
                                  </Badge>
                                </div>
                                <span className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(forecast.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <h3 className={`text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {forecast.title}
                              </h3>
                              
                              <p className={`text-xs sm:text-sm mb-2 sm:mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {forecast.description}
                              </p>

                              {/* Trading Details for Signals */}
                              {forecast.type === 'signal' && (
                                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                  {forecast.entryPrice && (
                                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Entry:</span>
                                      <span className={`ml-1 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{forecast.entryPrice}</span>
                                    </div>
                                  )}
                                  {forecast.stopLoss && (
                                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>SL:</span>
                                      <span className={`ml-1 font-medium text-red-500`}>{forecast.stopLoss}</span>
                                    </div>
                                  )}
                                  {forecast.takeProfit && (
                                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>TP:</span>
                                      <span className={`ml-1 font-medium text-green-500`}>{forecast.takeProfit}</span>
                                    </div>
                                  )}
                                  {forecast.action && (
                                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Action:</span>
                                      <span className={`ml-1 font-medium ${forecast.action === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{forecast.action}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Chart Image */}
                              {forecast.imageUrl && (
                                <div className="mb-2 sm:mb-3">
                                  <img 
                                    src={forecast.imageUrl} 
                                    alt="Chart" 
                                    className="w-full h-28 sm:h-32 object-cover rounded"
                                  />
                                </div>
                              )}

                              {/* Engagement Stats */}
                              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                  <button
                                    onClick={() => handleLikeForecast(forecast.id, forecast.isLiked)}
                                    className={`flex items-center transition-colors duration-200 ${
                                      forecast.isLiked 
                                        ? 'text-red-500' 
                                        : `${isDarkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-500 hover:text-red-500'}`
                                    } cursor-pointer`}
                                  >
                                    <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1 ${forecast.isLiked ? 'fill-current' : ''}`} />
                                    {forecast.likes || 0}
                                  </button>
                                  <button
                                    onClick={() => handleCommentClick(forecast)}
                                    className={`flex items-center transition-colors duration-200 ${
                                      `${isDarkMode ? 'text-gray-400 hover:text-blue-500' : 'text-gray-500 hover:text-blue-600'}`
                                    } cursor-pointer`}
                                  >
                                    <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />
                                    {forecast.comments || 0}
                                  </button>
                                </div>
                                <Badge variant="outline" className={`text-[10px] sm:text-xs ${isDarkMode ? 'bg-yellow-600 text-yellow-100 border-yellow-600' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                                  Premium
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 px-4">
                          <Crown className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          <h3 className={`text-base sm:text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Premium Forecasts</h3>
                          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No premium forecasts available at the moment. Check back later for exclusive content.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClose('settings')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <div className={`h-4 w-4 rounded-full ${isDarkMode ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Theme</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Currently using {isDarkMode ? 'Dark' : 'Light'} mode
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <Input 
                      value={currentUser?.name || ''}
                      className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <Input 
                      value={currentUser?.email || ''}
                      className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      disabled
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Features</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Additional settings like profile picture uploads, notifications, and two-factor authentication are coming soon. Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClose('notifications')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4">
              <div className="text-center mb-4">
                <h3 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                <p className={`text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>You have {unreadCount} unread notifications</p>
              </div>
              
              {/* Notifications List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  userNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        } ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                        onClick={() => markAsRead([notification.id])}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-full ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              <Icon className={`h-4 w-4 ${getTypeColor(notification.type)}`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <h4 className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {notification.title}
                                </h4>
                                <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                                  {notification.type}
                                </Badge>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className={`text-xs mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            <p className={`text-xs mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              
              {/* Mark All as Read Button */}
              {unreadCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={markAllAsRead}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark all as read
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lot Size Calculator Panel */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className={`fixed right-0 top-0 h-full w-96 shadow-xl transform transition-all duration-300 ease-in-out flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b transition-colors duration-200 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Calculator className={`h-5 w-5 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lot Size Calculator</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClose('calculator')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6 pb-20">
                <div className="text-center">
                  <h3 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lot Size Calculator</h3>
                  <p className={`text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Calculate optimal position size based on risk management</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Account Balance</label>
                      <Input 
                        type="number"
                        value={calculatorForm.accountBalance}
                        onChange={(e) => setCalculatorForm({...calculatorForm, accountBalance: Number(e.target.value)})}
                        className={`mt-1 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        placeholder="10000"
                      />
                    </div>
                    
                    <div>
                      <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Account Currency</label>
                      <select 
                        value={calculatorForm.accountCurrency}
                        onChange={(e) => setCalculatorForm({...calculatorForm, accountCurrency: e.target.value})}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="AUD">AUD</option>
                        <option value="CAD">CAD</option>
                        <option value="CHF">CHF</option>
                        <option value="NZD">NZD</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Risk Percentage (%)</label>
                    <Input 
                      type="number"
                      value={calculatorForm.riskPercentage}
                      onChange={(e) => setCalculatorForm({...calculatorForm, riskPercentage: Number(e.target.value)})}
                      className={`mt-1 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="2"
                      min="0.1"
                      max="10"
                      step="0.1"
                    />
                    <p className={`text-xs mt-1 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recommended: 1-2% per trade</p>
                  </div>
                  
                  <div>
                    <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Currency Pair</label>
                    <select 
                      value={calculatorForm.currencyPair}
                      onChange={(e) => setCalculatorForm({...calculatorForm, currencyPair: e.target.value})}
                      className={`mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <optgroup label="Major Pairs">
                        <option value="EURUSD">EUR/USD</option>
                        <option value="GBPUSD">GBP/USD</option>
                        <option value="AUDUSD">AUD/USD</option>
                        <option value="NZDUSD">NZD/USD</option>
                        <option value="USDCAD">USD/CAD</option>
                        <option value="USDCHF">USD/CHF</option>
                      </optgroup>
                      <optgroup label="JPY Pairs">
                        <option value="USDJPY">USD/JPY</option>
                        <option value="EURJPY">EUR/JPY</option>
                        <option value="GBPJPY">GBP/JPY</option>
                        <option value="AUDJPY">AUD/JPY</option>
                      </optgroup>
                      <optgroup label="Cross Pairs">
                        <option value="EURGBP">EUR/GBP</option>
                        <option value="EURAUD">EUR/AUD</option>
                        <option value="GBPAUD">GBP/AUD</option>
                        <option value="AUDNZD">AUD/NZD</option>
                      </optgroup>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Entry Price</label>
                      <Input 
                        type="number"
                        value={calculatorForm.entryPrice}
                        onChange={(e) => setCalculatorForm({...calculatorForm, entryPrice: Number(e.target.value)})}
                        className={`mt-1 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        placeholder="1.0850"
                        step="0.0001"
                      />
                    </div>
                    
                    <div>
                      <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stop Loss Price</label>
                      <Input 
                        type="number"
                        value={calculatorForm.stopLossPrice}
                        onChange={(e) => setCalculatorForm({...calculatorForm, stopLossPrice: Number(e.target.value)})}
                        className={`mt-1 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        placeholder="1.0800"
                        step="0.0001"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Take Profit Price</label>
                      <Input 
                        type="number"
                        value={calculatorForm.takeProfitPrice}
                        onChange={(e) => setCalculatorForm({...calculatorForm, takeProfitPrice: Number(e.target.value)})}
                        className={`mt-1 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        placeholder="1.0950"
                        step="0.0001"
                      />
                    </div>
                    
                    <div>
                      <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Leverage</label>
                      <select 
                        value={calculatorForm.leverage}
                        onChange={(e) => setCalculatorForm({...calculatorForm, leverage: Number(e.target.value)})}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="50">1:50</option>
                        <option value="100">1:100</option>
                        <option value="200">1:200</option>
                        <option value="300">1:300</option>
                        <option value="400">1:400</option>
                        <option value="500">1:500</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Profit Ratio</label>
                    <select 
                      value={calculatorForm.profitRatio}
                      onChange={(e) => setCalculatorForm({...calculatorForm, profitRatio: e.target.value})}
                      className={`mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="1:1">1:1 (Conservative)</option>
                      <option value="1:2">1:2 (Balanced)</option>
                      <option value="1:3">1:3 (Aggressive)</option>
                      <option value="1:4">1:4 (Very Aggressive)</option>
                    </select>
                  </div>
                </div>
                
                {/* Validation Warnings */}
                {(() => {
                  const calc = calculateLotSize()
                  const warnings: Array<{ type: string; message: string; icon: string }> = []
                  
                  if (calc.marginLevel < 200) {
                    warnings.push({
                      type: 'warning',
                      message: 'Low margin level - consider reducing position size',
                      icon: '⚠️'
                    })
                  }
                  
                  if (calculatorForm.riskPercentage > 5) {
                    warnings.push({
                      type: 'danger',
                      message: 'High risk percentage - maximum recommended is 5%',
                      icon: '🚨'
                    })
                  }
                  
                  if (calc.lotSize > 10) {
                    warnings.push({
                      type: 'warning',
                      message: 'Large position size - ensure you have sufficient margin',
                      icon: '⚠️'
                    })
                  }
                  
                  return warnings.length > 0 ? (
                    <div className="space-y-2">
                      {warnings.map((warning, index) => (
                        <div key={index} className={`p-3 rounded-md border-l-4 ${
                          warning.type === 'danger' 
                            ? 'bg-red-50 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-300'
                            : 'bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-500 dark:text-yellow-300'
                        }`}>
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{warning.icon}</span>
                            <span className="text-sm font-medium">{warning.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null
                })()}

                <div className="space-y-3">
                  <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'}`}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Recommended Lot Size</h3>
                        <div className={`text-3xl font-bold mt-2 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {calculateLotSize().lotSize}
                        </div>
                        <p className={`text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Standard lots</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Risk Amount</p>
                          <p className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {calculatorForm.accountCurrency} {calculateLotSize().riskAmount}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Stop Loss (Pips)</p>
                          <p className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {calculateLotSize().stopLossPips}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Margin Required</p>
                          <p className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {calculatorForm.accountCurrency} {calculateLotSize().marginRequired}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Margin Level</p>
                          <p className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {calculateLotSize().marginLevel}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Max Loss</p>
                          <p className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                            {calculatorForm.accountCurrency} {calculateLotSize().maxLoss}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className={`text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Max Profit</p>
                          <p className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {calculatorForm.accountCurrency} {calculateLotSize().maxProfit || 0}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentModalOpen && selectedForecast && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl max-h-[80vh] ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-xl flex flex-col`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <MessageCircle className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Comments - {selectedForecast.title}
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCommentModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {forecastComments.length > 0 ? (
                forecastComments.map((comment) => (
                  <div key={comment.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {comment.user?.name || 'Anonymous'}
                        </span>
                        {comment.isAdmin && (
                          <Badge variant="secondary" className="text-xs bg-theme-primary text-white">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Comments Yet</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Be the first to comment on this forecast!
                  </p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            {currentUser && (
              <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex space-x-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="px-4"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}