import fs from 'fs'
import path from 'path'

const PAYMENT_INTENTS_FILE = path.join(process.cwd(), 'data', 'mock-payment-intents.json')

// Ensure data directory exists
const dataDir = path.dirname(PAYMENT_INTENTS_FILE)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export interface MockPaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: string
  metadata: any
  created: number
  payment_method_types: string[]
  automatic_payment_methods: any
  payment_method?: any
  last_payment_error?: any
  next_action?: any
}

export function savePaymentIntent(paymentIntent: MockPaymentIntent): void {
  try {
    const intents = getPaymentIntents()
    intents[paymentIntent.id] = paymentIntent
    fs.writeFileSync(PAYMENT_INTENTS_FILE, JSON.stringify(intents, null, 2))
    console.log('Payment intent saved:', paymentIntent.id)
  } catch (error) {
    console.error('Error saving payment intent:', error)
    throw error
  }
}

export function getPaymentIntent(id: string): MockPaymentIntent | null {
  try {
    const intents = getPaymentIntents()
    return intents[id] || null
  } catch (error) {
    console.error('Error getting payment intent:', error)
    return null
  }
}

export function getPaymentIntents(): Record<string, MockPaymentIntent> {
  try {
    if (!fs.existsSync(PAYMENT_INTENTS_FILE)) {
      return {}
    }
    const data = fs.readFileSync(PAYMENT_INTENTS_FILE, 'utf8')
    return JSON.parse(data) || {}
  } catch (error) {
    console.error('Error reading payment intents:', error)
    return {}
  }
}

export function updatePaymentIntent(id: string, updates: Partial<MockPaymentIntent>): void {
  try {
    const intents = getPaymentIntents()
    if (intents[id]) {
      intents[id] = { ...intents[id], ...updates }
      fs.writeFileSync(PAYMENT_INTENTS_FILE, JSON.stringify(intents, null, 2))
      console.log('Payment intent updated:', id)
    }
  } catch (error) {
    console.error('Error updating payment intent:', error)
    throw error
  }
}

export function deletePaymentIntent(id: string): void {
  try {
    const intents = getPaymentIntents()
    delete intents[id]
    fs.writeFileSync(PAYMENT_INTENTS_FILE, JSON.stringify(intents, null, 2))
    console.log('Payment intent deleted:', id)
  } catch (error) {
    console.error('Error deleting payment intent:', error)
    throw error
  }
}
