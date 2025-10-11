#!/usr/bin/env node

/**
 * Migration script to update existing signal subscriptions
 * This script updates existing subscriptions to use the new billing system
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateSubscriptions() {
  console.log('🔄 Starting subscription migration...')
  
  try {
    // Update existing signal subscriptions to have proper billing data
    const updateResult = await prisma.$executeRaw`
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
    `
    
    console.log(`✅ Updated ${updateResult} subscription records`)

    // Update user roles for active subscriptions
    const userUpdateResult = await prisma.$executeRaw`
      UPDATE users 
      SET role = 'SIGNALS'::user_role
      WHERE id IN (
        SELECT user_id 
        FROM signal_subscriptions 
        WHERE status = 'ACTIVE'
      );
    `
    
    console.log(`✅ Updated ${userUpdateResult} user roles to SIGNALS`)

    // Verify migration
    const activeSubscriptions = await prisma.signalSubscription.count({
      where: { status: 'ACTIVE' }
    })
    
    const canceledSubscriptions = await prisma.signalSubscription.count({
      where: { status: 'CANCELED' }
    })

    console.log(`📊 Migration Summary:`)
    console.log(`   Active subscriptions: ${activeSubscriptions}`)
    console.log(`   Canceled subscriptions: ${canceledSubscriptions}`)
    console.log(`   Total subscriptions: ${activeSubscriptions + canceledSubscriptions}`)

    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateSubscriptions().catch(console.error)
}

module.exports = { migrateSubscriptions }
