'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, AlertCircle, CreditCard } from 'lucide-react'
import { useSettings } from '@/lib/settings-context'

interface PaymentStatusIndicatorProps {
  status: 'succeeded' | 'failed' | 'pending' | 'requires_action' | 'payment_failed'
  paymentMethod?: string
  className?: string
}

const PaymentStatusIndicator = ({ 
  status, 
  paymentMethod, 
  className = '' 
}: PaymentStatusIndicatorProps) => {
  const { settings } = useSettings()

  const getStatusConfig = () => {
    switch (status) {
      case 'succeeded':
        return {
          icon: CheckCircle,
          text: 'Payment Successful',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          iconClassName: 'text-green-600'
        }
      case 'failed':
      case 'payment_failed':
        return {
          icon: XCircle,
          text: 'Payment Failed',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          iconClassName: 'text-red-600'
        }
      case 'pending':
        return {
          icon: Clock,
          text: 'Payment Pending',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconClassName: 'text-yellow-600'
        }
      case 'requires_action':
        return {
          icon: AlertCircle,
          text: 'Action Required',
          variant: 'outline' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          iconClassName: 'text-orange-600'
        }
      default:
        return {
          icon: CreditCard,
          text: 'Unknown Status',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          iconClassName: 'text-gray-600'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const Icon = statusConfig.icon

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge 
        variant={statusConfig.variant}
        className={`${statusConfig.className} flex items-center space-x-1`}
      >
        <Icon className={`h-3 w-3 ${statusConfig.iconClassName}`} />
        <span className="text-xs font-medium">{statusConfig.text}</span>
      </Badge>
      
      {settings.useMockPayment && (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <span className="text-xs">Mock</span>
        </Badge>
      )}
      
      {paymentMethod && (
        <span className="text-xs text-gray-500">
          via {paymentMethod === 'mock_card' ? 'Mock Card' : paymentMethod}
        </span>
      )}
    </div>
  )
}

export default PaymentStatusIndicator
