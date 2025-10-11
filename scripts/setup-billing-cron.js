#!/usr/bin/env node

/**
 * Setup script for billing cron job
 * This script helps configure the automatic billing system
 */

const fs = require('fs')
const path = require('path')

const CRON_SECRET = process.env.CRON_SECRET || 'your-secure-cron-secret-here'
const BILLING_URL = process.env.BILLING_URL || 'https://your-domain.com/api/cron/billing'

console.log('🔧 Setting up billing cron job...\n')

// Create environment variables file if it doesn't exist
const envPath = path.join(process.cwd(), '.env.local')
let envContent = ''

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
}

// Add or update cron secret
if (!envContent.includes('CRON_SECRET=')) {
  envContent += `\n# Billing Cron Job Secret\nCRON_SECRET=${CRON_SECRET}\n`
} else {
  envContent = envContent.replace(/CRON_SECRET=.*/, `CRON_SECRET=${CRON_SECRET}`)
}

// Add or update billing URL
if (!envContent.includes('BILLING_URL=')) {
  envContent += `BILLING_URL=${BILLING_URL}\n`
} else {
  envContent = envContent.replace(/BILLING_URL=.*/, `BILLING_URL=${BILLING_URL}`)
}

fs.writeFileSync(envPath, envContent)

console.log('✅ Environment variables updated')

// Create cron job examples
const cronExamples = `
# Billing Cron Job Examples
# Add these to your server's crontab or use a service like Vercel Cron

# Process due subscriptions every hour
0 * * * * curl -X POST "${BILLING_URL}" -H "Authorization: Bearer ${CRON_SECRET}" -H "Content-Type: application/json"

# Process grace period expirations every 6 hours
0 */6 * * * curl -X POST "${BILLING_URL}" -H "Authorization: Bearer ${CRON_SECRET}" -H "Content-Type: application/json"

# Retry failed payments every 12 hours
0 */12 * * * curl -X POST "${BILLING_URL}" -H "Authorization: Bearer ${CRON_SECRET}" -H "Content-Type: application/json"

# For Vercel Cron Jobs, add this to vercel.json:
{
  "crons": [
    {
      "path": "/api/cron/billing",
      "schedule": "0 * * * *"
    }
  ]
}
`

const cronPath = path.join(process.cwd(), 'billing-cron-examples.txt')
fs.writeFileSync(cronPath, cronExamples)

console.log('✅ Cron job examples created at billing-cron-examples.txt')

// Create database migration script
const migrationScript = `
-- Run this SQL to update existing signal subscriptions to use the new billing system
-- This is a one-time migration script

-- Update existing signal subscriptions to have proper billing data
UPDATE signal_subscriptions 
SET 
  status = CASE 
    WHEN active = true THEN 'ACTIVE'::signal_subscription_status
    ELSE 'CANCELED'::signal_subscription_status
  END,
  plan = 'MONTHLY'::signal_plan,
  amount_usd = 50.0,
  currency = 'USD',
  billing_cycle = 'MONTHLY'::billing_cycle,
  current_period_start = COALESCE(started_at, created_at),
  current_period_end = COALESCE(started_at, created_at) + INTERVAL '1 month',
  next_billing_date = COALESCE(started_at, created_at) + INTERVAL '1 month',
  max_failed_payments = 3
WHERE 
  current_period_start IS NULL 
  OR current_period_end IS NULL 
  OR next_billing_date IS NULL;

-- Update user roles for active subscriptions
UPDATE users 
SET role = 'SIGNALS'::user_role
WHERE id IN (
  SELECT user_id 
  FROM signal_subscriptions 
  WHERE status = 'ACTIVE'
);
`

const migrationPath = path.join(process.cwd(), 'migrate-subscriptions.sql')
fs.writeFileSync(migrationPath, migrationScript)

console.log('✅ Database migration script created at migrate-subscriptions.sql')

console.log('\n🎉 Billing system setup complete!')
console.log('\nNext steps:')
console.log('1. Run the database migration: psql -d your_database -f migrate-subscriptions.sql')
console.log('2. Set up your cron job using the examples in billing-cron-examples.txt')
console.log('3. Test the billing endpoint: curl -X POST "' + BILLING_URL + '" -H "Authorization: Bearer ' + CRON_SECRET + '"')
console.log('4. Deploy your application with the new environment variables')
console.log('\n⚠️  Make sure to change the CRON_SECRET to a secure random string in production!')
