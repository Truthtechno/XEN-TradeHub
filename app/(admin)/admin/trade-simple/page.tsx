'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Loader2, CheckCircle, Clock } from 'lucide-react'

interface BrokerRegistration {
  id: string
  user: {
    name: string
    email: string
  }
  broker: string
  link: {
    label: string
  }
  verified: boolean
  verifiedAt: string | null
  createdAt: string
  verificationData: {
    email: string
    fullName: string
    phoneNumber?: string
    exnessAccountId?: string
  }
}

export default function SimpleTradePage() {
  const [registrations, setRegistrations] = useState<BrokerRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    console.log('🔄 Fetching registrations...')
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/trade/registrations?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Fetched registrations:', data.registrations?.length || 0)
        setRegistrations(data.registrations || [])
      } else {
        console.error('❌ Failed to fetch:', response.status)
        setError(`Failed to fetch data: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return 'Invalid Date'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading registrations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trade & Broker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track broker registrations and conversions
          </p>
        </div>
        <Button
          onClick={fetchData}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

      <div className="mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📊 Total Registrations: {registrations.length}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {registrations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No registrations found.</p>
            </CardContent>
          </Card>
        ) : (
          registrations.map((reg) => (
            <Card key={reg.id} className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {reg.verificationData?.fullName || reg.user.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reg.verificationData?.email || reg.user.email}
                    </p>
                  </div>
                  <Badge variant={reg.verified ? 'default' : 'secondary'}>
                    {reg.verified ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Submitted:</strong> {formatDate(reg.createdAt)}
                  </div>
                  <div>
                    <strong>Broker:</strong> {reg.broker}
                  </div>
                  {reg.verificationData?.phoneNumber && (
                    <div>
                      <strong>Phone:</strong> {reg.verificationData.phoneNumber}
                    </div>
                  )}
                  {reg.verificationData?.exnessAccountId && (
                    <div>
                      <strong>Exness ID:</strong> {reg.verificationData.exnessAccountId}
                    </div>
                  )}
                  {reg.verifiedAt && (
                    <div>
                      <strong>Verified At:</strong> {formatDate(reg.verifiedAt)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
