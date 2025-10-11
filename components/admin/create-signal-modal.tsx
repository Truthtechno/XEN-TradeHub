'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Plus, TrendingUp, TrendingDown, Target, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'

interface CreateSignalModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface SignalFormData {
  title: string
  description: string
  symbol: string
  action: 'BUY' | 'SELL'
  entryPrice: string
  stopLoss: string
  takeProfit: string
  notes: string
  visibility: 'DRAFT' | 'EVERYONE' | 'PREMIUM'
  imageUrl?: string
}

const CURRENCY_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURJPY', 'GBPJPY', 'AUDJPY', 'CHFJPY', 'CADJPY', 'NZDJPY',
  'EURGBP', 'EURAUD', 'EURCHF', 'EURCAD', 'EURNZD',
  'GBPAUD', 'GBPCHF', 'GBPCAD', 'GBPNZD',
  'AUDCHF', 'AUDCAD', 'AUDNZD', 'CHFCAD', 'CHFNZD', 'CADNZD'
]

export default function CreateSignalModal({ isOpen, onClose, onSuccess }: CreateSignalModalProps) {
  const [formData, setFormData] = useState<SignalFormData>({
    title: '',
    description: '',
    symbol: '',
    action: 'BUY',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    visibility: 'DRAFT',
    imageUrl: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<SignalFormData>>({})

  const handleInputChange = (field: keyof SignalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<SignalFormData> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.symbol.trim()) newErrors.symbol = 'Currency pair is required'
    if (!formData.entryPrice.trim()) newErrors.entryPrice = 'Entry price is required'
    if (!formData.stopLoss.trim()) newErrors.stopLoss = 'Stop loss is required'
    if (!formData.takeProfit.trim()) newErrors.takeProfit = 'Take profit is required'

    // Validate numeric values
    if (formData.entryPrice && isNaN(Number(formData.entryPrice))) {
      newErrors.entryPrice = 'Entry price must be a valid number'
    }
    if (formData.stopLoss && isNaN(Number(formData.stopLoss))) {
      newErrors.stopLoss = 'Stop loss must be a valid number'
    }
    if (formData.takeProfit && isNaN(Number(formData.takeProfit))) {
      newErrors.takeProfit = 'Take profit must be a valid number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/signals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          symbol: formData.symbol,
          action: formData.action,
          entryPrice: parseFloat(formData.entryPrice),
          stopLoss: parseFloat(formData.stopLoss),
          takeProfit: parseFloat(formData.takeProfit),
          notes: formData.notes,
          visibility: formData.visibility,
          imageUrl: formData.imageUrl || undefined,
          publishedAt: formData.visibility !== 'DRAFT' ? new Date().toISOString() : undefined
        }),
      })

      if (response.ok) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          title: '',
          description: '',
          symbol: '',
          action: 'BUY',
          entryPrice: '',
          stopLoss: '',
          takeProfit: '',
          notes: '',
          visibility: 'DRAFT',
          imageUrl: ''
        })
      } else {
        const error = await response.json()
        console.error('Error creating signal:', error)
        alert('Failed to create signal. Please try again.')
      }
    } catch (error) {
      console.error('Error creating signal:', error)
      alert('Failed to create signal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Trading Signal</h2>
            <p className="text-gray-600 dark:text-gray-400">Create a new trading signal for your students</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Basic Information</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter the basic details for your trading signal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Signal Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., EURUSD Breakout Signal"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the signal and market conditions..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency Pair *
                  </label>
                  <select
                    value={formData.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.symbol ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select currency pair</option>
                    {CURRENCY_PAIRS.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>
                  {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Action *
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.action === 'BUY' ? 'default' : 'outline'}
                      onClick={() => handleInputChange('action', 'BUY')}
                      className={`flex-1 ${formData.action === 'BUY' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      BUY
                    </Button>
                    <Button
                      type="button"
                      variant={formData.action === 'SELL' ? 'default' : 'outline'}
                      onClick={() => handleInputChange('action', 'SELL')}
                      className={`flex-1 ${formData.action === 'SELL' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    >
                      <TrendingDown className="h-4 w-4 mr-2" />
                      SELL
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trading Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Trading Parameters</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Set the entry, stop loss, and take profit levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Entry Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.entryPrice}
                      onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                      placeholder="1.0850"
                      className={`pl-10 ${errors.entryPrice ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.entryPrice && <p className="text-red-500 text-sm mt-1">{errors.entryPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stop Loss *
                  </label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-400" />
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.stopLoss}
                      onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                      placeholder="1.0800"
                      className={`pl-10 ${errors.stopLoss ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.stopLoss && <p className="text-red-500 text-sm mt-1">{errors.stopLoss}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Take Profit *
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.takeProfit}
                      onChange={(e) => handleInputChange('takeProfit', e.target.value)}
                      placeholder="1.0950"
                      className={`pl-10 ${errors.takeProfit ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.takeProfit && <p className="text-red-500 text-sm mt-1">{errors.takeProfit}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional notes, market analysis, or trading tips..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Distribution Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Distribution Settings</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Choose who can see this signal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.visibility === 'DRAFT'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('visibility', 'DRAFT')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Draft</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Save as draft, not visible to anyone</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.visibility === 'EVERYONE'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('visibility', 'EVERYONE')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Everyone</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Visible to all students</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.visibility === 'PREMIUM'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('visibility', 'PREMIUM')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Premium Only</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Visible only to premium subscribers</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Signal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
