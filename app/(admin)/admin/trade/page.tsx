'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RefreshCw, Loader2, CheckCircle, Clock, Eye, Phone, Mail, User, Calendar, Building, Hash } from 'lucide-react'

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

export default function TradePage() {
  const [registrations, setRegistrations] = useState<BrokerRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedRegistration, setSelectedRegistration] = useState<BrokerRegistration | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const fetchData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    }
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
        setRegistrations(data.registrations || [])
        setLastUpdated(new Date())
      } else {
        setError(`Failed to fetch data: ${response.status}`)
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every 60 seconds (silent refresh - no loading spinner)
    const interval = setInterval(() => fetchData(false), 60000)
    
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return 'Invalid Date'
    }
  }

  const handleViewDetails = (registration: BrokerRegistration) => {
    setSelectedRegistration(registration)
    setShowDetailsModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailsModal(false)
    setSelectedRegistration(null)
  }

  const handleVerifyRegistration = async () => {
    if (!selectedRegistration) return

    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/admin/trade/registrations/${selectedRegistration.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Update the registration in the local state
        setRegistrations(prev => 
          prev.map(reg => 
            reg.id === selectedRegistration.id 
              ? { ...reg, verified: true, verifiedAt: new Date().toISOString() }
              : reg
          )
        )
        
        // Update the selected registration
        setSelectedRegistration(prev => 
          prev ? { ...prev, verified: true, verifiedAt: new Date().toISOString() } : null
        )
        
        alert('Registration verified successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to verify registration: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error verifying registration:', error)
      alert('Failed to verify registration. Please try again.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self')
  }

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self')
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
          <Button onClick={() => fetchData()} className="bg-blue-600 hover:bg-blue-700">
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
          onClick={() => fetchData()}
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
            Last updated: {lastUpdated.toLocaleString()}
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
                  <Badge variant={reg.verified ? 'success' : 'secondary'}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
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
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleViewDetails(reg)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Registration Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Registration Details
            </DialogTitle>
            <DialogDescription>
              View and manage registration information
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-sm">{selectedRegistration.verificationData?.fullName || selectedRegistration.user.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{selectedRegistration.verificationData?.email || selectedRegistration.user.email}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEmail(selectedRegistration.verificationData?.email || selectedRegistration.user.email)}
                        className="h-6 px-2"
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {selectedRegistration.verificationData?.phoneNumber && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{selectedRegistration.verificationData.phoneNumber}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCall(selectedRegistration.verificationData.phoneNumber!)}
                          className="h-6 px-2"
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Broker Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Broker Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Broker</label>
                    <p className="text-sm">{selectedRegistration.broker}</p>
                  </div>
                  {selectedRegistration.verificationData?.exnessAccountId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Exness Account ID
                      </label>
                      <p className="text-sm font-mono">{selectedRegistration.verificationData.exnessAccountId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Registration Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Submitted</label>
                    <p className="text-sm">{formatDate(selectedRegistration.createdAt)}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedRegistration.verified ? 'success' : 'secondary'}>
                        {selectedRegistration.verified ? (
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
                  </div>
                  {selectedRegistration.verifiedAt && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Verified At</label>
                      <p className="text-sm">{formatDate(selectedRegistration.verifiedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  {selectedRegistration.verificationData?.phoneNumber && (
                    <Button
                      onClick={() => handleCall(selectedRegistration.verificationData.phoneNumber!)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  )}
                  <Button
                    onClick={() => handleEmail(selectedRegistration.verificationData?.email || selectedRegistration.user.email)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </div>
                
                {!selectedRegistration.verified && (
                  <Button
                    onClick={handleVerifyRegistration}
                    disabled={isUpdatingStatus}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Mark as Verified
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}