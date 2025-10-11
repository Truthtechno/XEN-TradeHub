import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'mentorship-registrations.json')
const PAYMENTS_FILE = path.join(DATA_DIR, 'mentorship-payments.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize files if they don't exist
if (!fs.existsSync(REGISTRATIONS_FILE)) {
  fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([], null, 2))
}

if (!fs.existsSync(PAYMENTS_FILE)) {
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify([], null, 2))
}

export interface MentorshipRegistration {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  fullPhone: string
  schedulingPreferences: string
  registrationDate: string
  paymentStatus: 'pending' | 'completed' | 'failed'
  sessionType: string
  price: number
  currency: string
  status: 'registered' | 'paid' | 'scheduled' | 'completed'
  createdAt: string
  updatedAt?: string
}

export interface MentorshipPayment {
  id: string
  registrationId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  paymentMethod: string
  transactionId: string
  processedAt: string
  createdAt: string
}

export function saveMentorshipRegistration(registration: MentorshipRegistration): void {
  try {
    const registrations = getMentorshipRegistrations()
    registrations.push(registration)
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2))
    console.log('Mentorship registration saved:', registration.id)
  } catch (error) {
    console.error('Error saving mentorship registration:', error)
    throw error
  }
}

export function getMentorshipRegistrations(): MentorshipRegistration[] {
  try {
    const data = fs.readFileSync(REGISTRATIONS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading mentorship registrations:', error)
    return []
  }
}

export function getMentorshipRegistrationById(id: string): MentorshipRegistration | null {
  const registrations = getMentorshipRegistrations()
  return registrations.find(reg => reg.id === id) || null
}

export function updateMentorshipRegistrationStatus(id: string, status: MentorshipRegistration['status']): void {
  try {
    const registrations = getMentorshipRegistrations()
    const index = registrations.findIndex(reg => reg.id === id)
    if (index !== -1) {
      registrations[index].status = status
      registrations[index].updatedAt = new Date().toISOString()
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2))
      console.log('Mentorship registration status updated:', id, status)
    }
  } catch (error) {
    console.error('Error updating mentorship registration status:', error)
    throw error
  }
}

export function saveMentorshipPayment(payment: MentorshipPayment): void {
  try {
    const payments = getMentorshipPayments()
    payments.push(payment)
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2))
    console.log('Mentorship payment saved:', payment.id)
  } catch (error) {
    console.error('Error saving mentorship payment:', error)
    throw error
  }
}

export function getMentorshipPayments(): MentorshipPayment[] {
  try {
    const data = fs.readFileSync(PAYMENTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading mentorship payments:', error)
    return []
  }
}

export function getMentorshipPaymentById(id: string): MentorshipPayment | null {
  const payments = getMentorshipPayments()
  return payments.find(payment => payment.id === id) || null
}

export function getMentorshipStats() {
  const registrations = getMentorshipRegistrations()
  const payments = getMentorshipPayments()
  
  return {
    totalRegistrations: registrations.length,
    totalPayments: payments.length,
    completedPayments: payments.filter(p => p.status === 'completed').length,
    pendingRegistrations: registrations.filter(r => r.status === 'registered').length,
    totalRevenue: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  }
}
