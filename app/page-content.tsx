'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  X,
  User,
  Shield,
  Zap,
  TrendingUp,
  BarChart3,
  Gift
} from 'lucide-react'
import { getCountryFromPhoneNumber } from '@/lib/country-utils'
import { useSettings } from '@/lib/settings-context'
import { InteractiveParticles } from '@/components/ui/interactive-particles'

export default function HomePage() {
  // ALL HOOKS MUST BE DECLARED FIRST - NO EARLY RETURNS BEFORE THIS POINT
  const { settings, loading } = useSettings()
  const searchParams = useSearchParams()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [referralCode, setReferralCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Debug: Log when component re-renders
  console.log('HomePage re-render:', { isInitialized, loading, settings: !!settings })
  
  // Prevent re-renders from settings changes by using refs
  const settingsRef = useRef(settings)
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  
  // Signup form state
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsappNumber: '',
    password: '',
    countryCode: '',
    country: 'Ghana'
  })

  // Country codes data
  const countryCodes = [
    { code: '+233', flag: '🇬🇭', country: 'Ghana' },
    { code: '+1', flag: '🇺🇸', country: 'USA' },
    { code: '+44', flag: '🇬🇧', country: 'UK' },
    { code: '+49', flag: '🇩🇪', country: 'Germany' },
    { code: '+91', flag: '🇮🇳', country: 'India' },
    { code: '+27', flag: '🇿🇦', country: 'South Africa' },
    { code: '+234', flag: '🇳🇬', country: 'Nigeria' },
    { code: '+254', flag: '🇰🇪', country: 'Kenya' },
    { code: '+256', flag: '🇺🇬', country: 'Uganda' },
    { code: '+250', flag: '🇷🇼', country: 'Rwanda' },
    { code: '+255', flag: '🇹🇿', country: 'Tanzania' },
    { code: '+263', flag: '🇿🇼', country: 'Zimbabwe' },
    { code: '+260', flag: '🇿🇲', country: 'Zambia' },
    { code: '+267', flag: '🇧🇼', country: 'Botswana' },
    { code: '+268', flag: '🇸🇿', country: 'Eswatini' },
    { code: '+266', flag: '🇱🇸', country: 'Lesotho' },
    { code: '+264', flag: '🇳🇦', country: 'Namibia' },
    { code: '+971', flag: '🇦🇪', country: 'UAE' },
    { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' },
    { code: '+965', flag: '🇰🇼', country: 'Kuwait' },
    { code: '+968', flag: '🇴🇲', country: 'Oman' },
    { code: '+973', flag: '🇧🇭', country: 'Bahrain' },
    { code: '+974', flag: '🇶🇦', country: 'Qatar' },
    { code: '+33', flag: '🇫🇷', country: 'France' },
    { code: '+39', flag: '🇮🇹', country: 'Italy' },
    { code: '+34', flag: '🇪🇸', country: 'Spain' },
    { code: '+31', flag: '🇳🇱', country: 'Netherlands' },
    { code: '+32', flag: '🇧🇪', country: 'Belgium' },
    { code: '+41', flag: '🇨🇭', country: 'Switzerland' },
    { code: '+43', flag: '🇦🇹', country: 'Austria' },
    { code: '+45', flag: '🇩🇰', country: 'Denmark' },
    { code: '+46', flag: '🇸🇪', country: 'Sweden' },
    { code: '+47', flag: '🇳🇴', country: 'Norway' },
    { code: '+358', flag: '🇫🇮', country: 'Finland' },
    { code: '+48', flag: '🇵🇱', country: 'Poland' },
    { code: '+420', flag: '🇨🇿', country: 'Czech Republic' },
    { code: '+421', flag: '🇸🇰', country: 'Slovakia' },
    { code: '+36', flag: '🇭🇺', country: 'Hungary' },
    { code: '+40', flag: '🇷🇴', country: 'Romania' },
    { code: '+359', flag: '🇧🇬', country: 'Bulgaria' },
    { code: '+385', flag: '🇭🇷', country: 'Croatia' },
    { code: '+386', flag: '🇸🇮', country: 'Slovenia' },
    { code: '+372', flag: '🇪🇪', country: 'Estonia' },
    { code: '+371', flag: '🇱🇻', country: 'Latvia' },
    { code: '+370', flag: '🇱🇹', country: 'Lithuania' },
    { code: '+7', flag: '🇷🇺', country: 'Russia' },
    { code: '+86', flag: '🇨🇳', country: 'China' },
    { code: '+81', flag: '🇯🇵', country: 'Japan' },
    { code: '+82', flag: '🇰🇷', country: 'South Korea' },
    { code: '+65', flag: '🇸🇬', country: 'Singapore' },
    { code: '+60', flag: '🇲🇾', country: 'Malaysia' },
    { code: '+66', flag: '🇹🇭', country: 'Thailand' },
    { code: '+63', flag: '🇵🇭', country: 'Philippines' },
    { code: '+62', flag: '🇮🇩', country: 'Indonesia' },
    { code: '+84', flag: '🇻🇳', country: 'Vietnam' },
    { code: '+61', flag: '🇦🇺', country: 'Australia' },
    { code: '+64', flag: '🇳🇿', country: 'New Zealand' },
    { code: '+55', flag: '🇧🇷', country: 'Brazil' },
    { code: '+54', flag: '🇦🇷', country: 'Argentina' },
    { code: '+56', flag: '🇨🇱', country: 'Chile' },
    { code: '+57', flag: '🇨🇴', country: 'Colombia' },
    { code: '+51', flag: '🇵🇪', country: 'Peru' },
    { code: '+52', flag: '🇲🇽', country: 'Mexico' },
    { code: '+1', flag: '🇨🇦', country: 'Canada' }
  ]

  // Capture referral code from URL
  useEffect(() => {
    const ref = searchParams.get('ref')
    const mode = searchParams.get('mode')
    
    if (ref) {
      setReferralCode(ref)
      setIsLoginMode(false) // Switch to signup mode
    } else if (mode === 'signup') {
      setIsLoginMode(false)
    }
  }, [searchParams])

  // Initialize component - let the main theme script handle dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Don't manipulate DOM directly - let the main theme script handle it
      setIsDarkMode(true) // Assume dark mode for login page
      
      // Set initialized after a short delay to prevent flash
      const timeoutId = setTimeout(() => {
        setIsInitialized(true)
      }, 100)
      
      // Fallback timeout to prevent infinite loading
      const fallbackTimeoutId = setTimeout(() => {
        setIsInitialized(true)
      }, 2000)
      
      return () => {
        clearTimeout(timeoutId)
        clearTimeout(fallbackTimeoutId)
      }
    } else {
      // Server-side: initialize immediately
      setIsInitialized(true)
    }
  }, [])

  // Check if user is already logged in (only once)
  useEffect(() => {
    if (!isInitialized) return
    
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          // Redirect based on role
          if (['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR', 'SUPPORT'].includes(data.user.role)) {
            window.location.href = '/admin'
          } else {
            window.location.href = '/dashboard'
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    
    checkAuthStatus()
  }, [isInitialized])

  // ALL EVENT HANDLERS
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        // Redirect based on role
        if (['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR', 'SUPPORT'].includes(data.user.role)) {
          window.location.href = '/admin'
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        alert(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...signupForm,
          whatsappNumber: `${signupForm.countryCode}${signupForm.whatsappNumber}`,
          referralCode: referralCode || undefined // Include referral code if present
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Account created successfully! Please login.')
        setIsLoginMode(true)
        setLoginForm({
          email: signupForm.email,
          password: ''
        })
        setReferralCode('') // Clear referral code after successful signup
      } else {
        alert(data.error || 'Signup failed')
      }
    } catch (error) {
      console.error('Signup error:', error)
      alert('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Quick login with demo credentials
  const handleQuickLogin = async (email: string, password: string) => {
    setLoginForm({ email, password })
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        // Redirect based on role
        if (['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR', 'SUPPORT'].includes(data.user.role)) {
          window.location.href = '/admin'
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        alert(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Get theme colors for particles (memoized to prevent re-renders)
  const getThemeColors = useMemo(() => {
    // Use static colors to prevent re-renders from settings changes
    return {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981'
    }
  }, [])

  // Get consistent input styles for dark mode
  const getInputStyles = () => ({
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderColor: '#475569',
    color: 'white',
    boxShadow: 'none'
  })

  // Get consistent text styles for dark mode (memoized)
  const getTextStyles = useMemo(() => (isPrimary = false) => ({
    color: isPrimary ? 'white' : '#d1d5db',
    fontWeight: isPrimary ? '600' : '400',
    textShadow: 'none'
  }), [])

  // Memoize site information to prevent re-renders
  const siteInfo = useMemo(() => ({
    siteName: settings.siteName || 'XEN TradeHub',
    siteDescription: settings.siteDescription || 'Professional Trading Education Platform'
  }), [settings.siteName, settings.siteDescription])

  // NOW WE CAN HAVE EARLY RETURNS AFTER ALL HOOKS ARE DECLARED
  // Show loading state only if not initialized yet
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">X</span>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is logged in, show welcome message
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={`${settings.siteName} Logo`}
                  className="w-16 h-16 object-contain rounded-full shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">X</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Welcome back, {user.name}!</h1>
            <p className="text-gray-400 mb-6">You are already logged in.</p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR', 'SUPPORT'].includes(user.role) ? '/admin' : '/dashboard'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // MAIN RENDER - NO MORE EARLY RETURNS AFTER THIS POINT
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Interactive Particles Background */}
      <InteractiveParticles 
        theme="dark"
        particleCount={60}
        colors={getThemeColors}
      />

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse bg-blue-500/30"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse bg-purple-500/30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl bg-orange-500/20"></div>
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'float 20s ease-in-out infinite'
        }}></div>
      </div>


      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Enhanced Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={`${settings.siteName} Logo`}
                className="w-20 h-20 object-contain rounded-2xl shadow-2xl transition-all duration-500 shadow-blue-500/25"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-500 via-purple-600 to-orange-500 shadow-blue-500/25">
                <span className="text-white font-bold text-3xl">X</span>
              </div>
            )}
          </div>
          <h1 
            className="text-4xl font-bold mb-2 transition-colors duration-500"
            style={getTextStyles(true)}
          >
            {siteInfo.siteName}
          </h1>
          <p 
            className="text-sm transition-colors duration-500"
            style={getTextStyles(false)}
          >
            {siteInfo.siteDescription}
          </p>
        </div>

        {/* Enhanced Auth Card */}
        <Card className="backdrop-blur-xl shadow-2xl bg-slate-800/60 border-slate-700/50 shadow-black/20">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 
                className="text-2xl font-bold mb-2 transition-colors duration-500"
                style={getTextStyles(true)}
              >
                {isLoginMode ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p 
                className="transition-colors duration-500"
                style={getTextStyles(false)}
              >
                {isLoginMode 
                  ? `Sign in to your ${settings.siteName} account` 
                  : `Create your ${settings.siteName} account`
                }
              </p>
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
            </div>

            {/* Login Form */}
            {isLoginMode ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors duration-500"
                    style={getTextStyles(true)}
                  >
                    Email Address
                  </label>
                  <Input 
                    type="email" 
                    placeholder="Enter your email"
                    className="transition-all duration-500 bg-slate-700/80 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700"
                    style={getInputStyles()}
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors duration-500"
                    style={getTextStyles(true)}
                  >
                    Password
                  </label>
                  <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pr-10 transition-all duration-500 bg-slate-700/80 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700"
                    style={getInputStyles()}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          required
                        />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-500 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : 'Sign In'}
                </Button>

                <div className="text-center">
                  <a 
                    href="#" 
                    className="text-sm transition-colors duration-500"
                    style={{
                      color: '#60a5fa',
                      textShadow: 'none'
                    }}
                  >
                    Forgot your password?
                  </a>
                </div>

                <div 
                  className="text-center text-sm transition-colors duration-500"
                  style={getTextStyles(false)}
                >
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setIsLoginMode(false)}
                    className="transition-colors duration-500 font-medium"
                    style={{
                      color: '#60a5fa',
                      textShadow: 'none'
                    }}
                  >
                    Sign up
                  </button>
                </div>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors duration-500"
                    style={getTextStyles(true)}>
                      First Name
                    </label>
                    <Input 
                      placeholder="First name"
                      className="transition-all duration-500 bg-slate-700/80 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700"
                    style={getInputStyles()}
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({...signupForm, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors duration-500"
                    style={getTextStyles(true)}>
                      Last Name
                    </label>
                    <Input 
                      placeholder="Last name"
                      className="transition-all duration-500 bg-slate-700/80 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({...signupForm, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label                     className="block text-sm font-medium mb-2 transition-colors duration-500 text-gray-300"
                    style={getTextStyles(true)}>
                    Email Address
                  </label>
                  <Input 
                    type="email" 
                    placeholder="Enter your email"
                    className="transition-all duration-500 bg-slate-700/80 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label                     className="block text-sm font-medium mb-2 transition-colors duration-500 text-gray-300"
                    style={getTextStyles(true)}>
                    Country
                  </label>
                  <select
                    className="w-full text-sm rounded-md px-3 py-2 transition-all duration-500 bg-slate-700/80 border border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700"
                    value={signupForm.country}
                    onChange={(e) => setSignupForm({...signupForm, country: e.target.value})}
                    required
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.country} className="bg-slate-700 text-white">
                        {country.flag} {country.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors duration-500 text-gray-300"
                    style={getTextStyles(true)}
                  >
                    WhatsApp Number
                  </label>
                  <div className="flex">
                    <Input 
                      type="text"
                      placeholder="+xxx"
                      className="rounded-l-md px-3 py-2 w-24 text-center transition-all duration-500 bg-slate-700/80 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700"
                      value={signupForm.countryCode}
                      onChange={(e) => {
                        setSignupForm({
                          ...signupForm, 
                          countryCode: e.target.value
                        })
                      }}
                      required
                    />
                    <Input 
                      type="tel"
                      placeholder="Enter your WhatsApp number"
                      className="rounded-l-none flex-1 transition-all duration-500 bg-slate-700/80 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700"
                      value={signupForm.whatsappNumber}
                      onChange={(e) => {
                        setSignupForm({...signupForm, whatsappNumber: e.target.value})
                      }}
                      required
                    />
                  </div>
                  <p className="text-xs mt-1 transition-colors duration-500 text-gray-400">
                    We'll use this for important updates and support. Enter your country code (e.g., +233, +1, +44).
                  </p>
                </div>

                <div>
                  <label                     className="block text-sm font-medium mb-2 transition-colors duration-500 text-gray-300"
                    style={getTextStyles(true)}>
                    Password
                  </label>
                  <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className="pr-10 transition-all duration-500 bg-slate-700/80 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                          required
                        />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-500 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-500 bg-slate-700 border-slate-600"
                    required
                  />
                  <p className="text-xs transition-colors duration-500 text-gray-400">
                    I agree to the{' '}
                    <a href="#" className="transition-colors duration-500 text-blue-400 hover:text-blue-300">
                      Terms & Conditions
                    </a>
                    ,{' '}
                    <a href="#" className="transition-colors duration-500 text-blue-400 hover:text-blue-300">
                      Privacy Policy
                    </a>
                    {' '}and{' '}
                    <a href="#" className="transition-colors duration-500 text-blue-400 hover:text-blue-300">
                      Email Policy
                    </a>
                    . including opting in to receive marketing & campaign emails.
                  </p>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : 'Create Account'}
                </Button>

                <div className="text-center text-sm transition-colors duration-500 text-gray-400">
                  Already have an account?{' '}
                  <button 
                    onClick={() => setIsLoginMode(true)}
                    className="transition-colors duration-500 font-medium text-blue-400 hover:text-blue-300"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Demo Credentials */}
        <div className="mt-6 p-4 rounded-xl backdrop-blur-sm transition-all duration-500 bg-slate-800/40 border border-slate-700/50">
          <h3 
            className="text-sm font-medium mb-4 flex items-center transition-colors duration-500"
            style={getTextStyles(true)}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Quick Demo Access
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {/* Super Admin Demo */}
            <button
              onClick={() => handleQuickLogin('admin@corefx.com', 'admin123')}
              disabled={isLoading}
              className="p-3 rounded-lg border transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-blue-500"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Shield className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <div 
                    className="font-medium text-sm transition-colors duration-500"
                    style={getTextStyles(true)}
                  >
                    Super Admin Account
                  </div>
                  <div 
                    className="text-xs transition-colors duration-500"
                    style={getTextStyles(false)}
                  >
                    Full system access
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 transition-colors duration-500 text-gray-400" />
              </div>
            </button>

            {/* Affiliate Demo */}
            <button
              onClick={() => handleQuickLogin('brian@corefx.com', 'admin123')}
              disabled={isLoading}
              className="p-3 rounded-lg border transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-blue-500"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <div 
                    className="font-medium text-sm transition-colors duration-500"
                    style={getTextStyles(true)}
                  >
                    Affiliate Account
                  </div>
                  <div 
                    className="text-xs transition-colors duration-500"
                    style={getTextStyles(false)}
                  >
                    Benefits of an affiliate
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 transition-colors duration-500 text-gray-400" />
              </div>
            </button>

            {/* Referral Demo */}
            <button
              onClick={() => handleQuickLogin('signal@corefx.com', 'admin123')}
              disabled={isLoading}
              className="p-3 rounded-lg border transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-blue-500"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <div 
                    className="font-medium text-sm transition-colors duration-500"
                    style={getTextStyles(true)}
                  >
                    Referral Account
                  </div>
                  <div 
                    className="text-xs transition-colors duration-500"
                    style={getTextStyles(false)}
                  >
                    Referral account testing
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 transition-colors duration-500 text-gray-400" />
              </div>
            </button>

            {/* Admin Demo */}
            <button
              onClick={() => handleQuickLogin('basic@corefx.com', 'admin123')}
              disabled={isLoading}
              className="p-3 rounded-lg border transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-blue-500"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <BarChart3 className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1 text-left">
                  <div 
                    className="font-medium text-sm transition-colors duration-500"
                    style={getTextStyles(true)}
                  >
                    Admin Account
                  </div>
                  <div 
                    className="text-xs transition-colors duration-500"
                    style={getTextStyles(false)}
                  >
                    Basic Admin features
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 transition-colors duration-500 text-gray-400" />
              </div>
            </button>
          </div>

          
        </div>
      </div>
    </div>
  )
}