'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calculator, DollarSign, Download, Info, Percent, RefreshCw, TrendingUp } from 'lucide-react'

interface CalculationResult {
  lotSize: number
  pipValue: number
  marginRequired: number
  riskAmount: number
  positionSize: number
}

export default function ToolsPage() {
  const [accountBalance, setAccountBalance] = useState(10000)
  const [riskPercentage, setRiskPercentage] = useState(2)
  const [stopLoss, setStopLoss] = useState(50)
  const [entryPrice, setEntryPrice] = useState(1.2000)
  const [currencyPair, setCurrencyPair] = useState('EUR/USD')
  const [leverage, setLeverage] = useState(100)
  const [calculation, setCalculation] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currencyPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD',
    'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'CAD/JPY', 'CHF/JPY', 'NZD/JPY'
  ]

  const calculateLotSize = () => {
    setIsCalculating(true)
    
    // Simulate calculation delay
    setTimeout(() => {
      const riskAmount = (accountBalance * riskPercentage) / 100
      const pipValue = 10 // Standard pip value for major pairs
      const lotSize = riskAmount / (stopLoss * pipValue)
      const marginRequired = (lotSize * entryPrice * 100000) / leverage
      const positionSize = lotSize * 100000

      setCalculation({
        lotSize: Math.round(lotSize * 100) / 100,
        pipValue: pipValue,
        marginRequired: Math.round(marginRequired * 100) / 100,
        riskAmount: Math.round(riskAmount * 100) / 100,
        positionSize: Math.round(positionSize * 100) / 100
      })
      
      setIsCalculating(false)
    }, 500)
  }

  useEffect(() => {
    calculateLotSize()
  }, [accountBalance, riskPercentage, stopLoss, entryPrice, leverage])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trading Tools</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Advanced calculators and tools for position sizing and risk management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={calculateLotSize} variant="outline" size="sm" disabled={isCalculating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
          <Button className="bg-xen-red hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lot Size Calculator */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Lot Size Calculator
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Calculate optimal position size based on risk management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Balance
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(Number(e.target.value))}
                    className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Percentage
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={riskPercentage}
                    onChange={(e) => setRiskPercentage(Number(e.target.value))}
                    className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stop Loss (Pips)
                </label>
                <Input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entry Price
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="1.2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency Pair
                </label>
                <select
                  value={currencyPair}
                  onChange={(e) => setCurrencyPair(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-xen-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {currencyPairs.map((pair) => (
                    <option key={pair} value={pair}>{pair}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Leverage
                </label>
                <Input
                  type="number"
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculation Results */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Calculation Results
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Your optimal trading parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCalculating ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xen-red"></div>
              </div>
            ) : calculation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Lot Size:</span>
                    <Badge className="bg-xen-red text-white text-lg px-3 py-1">
                      {calculation.lotSize}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Risk Amount:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(calculation.riskAmount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Margin Required:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(calculation.marginRequired)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Position Size:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(calculation.positionSize)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Pip Value:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(calculation.pipValue)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium">Risk Management Tips:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Never risk more than 2% of your account per trade</li>
                        <li>• Always use stop losses to limit your risk</li>
                        <li>• Consider your leverage carefully</li>
                        <li>• Monitor your margin requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Additional Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Pip Calculator</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Calculate pip values for different currency pairs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-xen-red hover:bg-red-700">
              Open Calculator
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Margin Calculator</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Calculate required margin for your positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-xen-red hover:bg-red-700">
              Open Calculator
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Profit Calculator</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Calculate potential profits and losses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-xen-red hover:bg-red-700">
              Open Calculator
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
