'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, CheckCircle, TrendingUp, Shield, HeadphonesIcon, Briefcase } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { AccountOpeningDialog } from '@/components/brokers/account-opening-dialog'

interface Broker {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  referralLink: string
  benefits: string[]
  newAccountSteps: any[] | null
  existingAccountSteps: any[] | null
  isActive: boolean
  displayOrder: number
}

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    fetchBrokers()
  }, [])

  const fetchBrokers = async () => {
    try {
      const response = await fetch('/api/brokers')
      if (response.ok) {
        const data = await response.json()
        setBrokers(data.brokers || [])
      }
    } catch (error) {
      console.error('Error fetching brokers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAccount = (broker: Broker) => {
    setSelectedBroker(broker)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading brokers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Trade Through Us</h1>
        <p className="text-muted-foreground">
          Open a trading account with our trusted partner brokers and get access to exclusive benefits, daily support, and professional signals.
        </p>
      </div>

      {/* Benefits Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Why Trade With Our Partners?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <HeadphonesIcon className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Daily Support</h3>
                <p className="text-sm text-muted-foreground">Get dedicated support from our team</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Trading Signals</h3>
                <p className="text-sm text-muted-foreground">Access to premium trading signals</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">DIFC Verified Brokers</h3>
                <p className="text-sm text-muted-foreground">All partners are regulated and trusted</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Broker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brokers.map((broker) => (
          <Card key={broker.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                {broker.logoUrl ? (
                  <img src={broker.logoUrl} alt={broker.name} className="h-12 object-contain" />
                ) : (
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                )}
                <Badge variant="secondary">Trusted Partner</Badge>
              </div>
              <CardTitle>{broker.name}</CardTitle>
              <CardDescription>{broker.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Benefits */}
              {broker.benefits && broker.benefits.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Key Benefits:</h4>
                  <ul className="space-y-1">
                    {broker.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <Button className="w-full bg-theme-primary hover:bg-theme-primary-700 text-white" onClick={() => handleOpenAccount(broker)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Account
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {brokers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Brokers Available</h3>
            <p className="text-muted-foreground text-center">
              We're currently setting up our broker partnerships. Check back soon!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Account Opening Dialog */}
      <AccountOpeningDialog
        broker={selectedBroker}
        open={!!selectedBroker}
        onOpenChange={(open) => !open && setSelectedBroker(null)}
        userEmail={session?.user?.email || ''}
        userName={session?.user?.name || ''}
      />
    </div>
  )
}
