import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultSettings = [
  { key: 'siteName', value: 'XEN Forex', category: 'general' },
  { key: 'siteDescription', value: 'Professional Trading Education Platform', category: 'general' },
  { key: 'siteUrl', value: 'https://xenforex.com', category: 'general' },
  { key: 'supportEmail', value: 'support@xenforex.com', category: 'general' },
  { key: 'supportPhone', value: '+1-555-0123', category: 'general' },
  { key: 'supportAddress', value: '123 Trading Street, New York, NY 10001', category: 'general' },
  { key: 'defaultBrokerLink', value: 'https://exness.com/register?ref=xenforex', category: 'general' },
  { key: 'timezone', value: 'UTC', category: 'general' },
  { key: 'currency', value: 'USD', category: 'general' },
  { key: 'primaryColor', value: '#dc2626', category: 'appearance' }, // Red color matching XEN Forex branding
  { key: 'secondaryColor', value: '#1e40af', category: 'appearance' }, // Dark blue color
  { key: 'logoUrl', value: '/logo.png', category: 'appearance' },
  { key: 'faviconUrl', value: '/favicon.ico', category: 'appearance' },
  { key: 'theme', value: 'light', category: 'appearance' },
  { key: 'stripePublishableKey', value: '', category: 'payments' },
  { key: 'stripeSecretKey', value: '', category: 'payments' },
  { key: 'stripeWebhookSecret', value: '', category: 'payments' },
]

async function seedSettings() {
  console.log('🌱 Seeding settings...')
  
  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    })
  }
  
  console.log('✅ Settings seeded successfully!')
}

export default seedSettings
