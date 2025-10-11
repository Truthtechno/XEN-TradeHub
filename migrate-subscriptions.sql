
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
