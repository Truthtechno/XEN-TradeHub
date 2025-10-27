-- Update users with varied dates
UPDATE users 
SET created_at = NOW() - INTERVAL '3 days'
WHERE id IN (SELECT id FROM users ORDER BY created_at LIMIT 3);

UPDATE users 
SET created_at = NOW() - INTERVAL '15 days'
WHERE id IN (SELECT id FROM users ORDER BY created_at LIMIT 3 OFFSET 3);

UPDATE users 
SET created_at = NOW() - INTERVAL '45 days'
WHERE id IN (SELECT id FROM users ORDER BY created_at LIMIT 3 OFFSET 6);

UPDATE users 
SET created_at = NOW() - INTERVAL '100 days'
WHERE id IN (SELECT id FROM users ORDER BY created_at LIMIT 3 OFFSET 9);

-- Update academy registrations
UPDATE academy_class_registrations
SET created_at = NOW() - INTERVAL '3 days'
WHERE id IN (SELECT id FROM academy_class_registrations ORDER BY created_at LIMIT 1);

UPDATE academy_class_registrations
SET created_at = NOW() - INTERVAL '50 days'
WHERE id IN (SELECT id FROM academy_class_registrations ORDER BY created_at LIMIT 1 OFFSET 1);

-- Update copy trading subscriptions
UPDATE copy_trading_subscriptions
SET created_at = NOW() - INTERVAL '5 days'
WHERE id IN (SELECT id FROM copy_trading_subscriptions ORDER BY created_at LIMIT 3);

UPDATE copy_trading_subscriptions
SET created_at = NOW() - INTERVAL '20 days'
WHERE id IN (SELECT id FROM copy_trading_subscriptions ORDER BY created_at LIMIT 3 OFFSET 3);

UPDATE copy_trading_subscriptions
SET created_at = NOW() - INTERVAL '60 days'
WHERE id IN (SELECT id FROM copy_trading_subscriptions ORDER BY created_at LIMIT 3 OFFSET 6);

-- Verify the changes
SELECT '=== Users Distribution ===' as info;
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '90 days') as last_90_days
FROM users;

SELECT '=== Academy Registrations ===' as info;
SELECT 
  COUNT(*) as total,
  COALESCE(SUM("amountUSD"), 0) as total_revenue,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
  COALESCE(SUM("amountUSD") FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'), 0) as revenue_7_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days,
  COALESCE(SUM("amountUSD") FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0) as revenue_30_days
FROM academy_class_registrations WHERE status = 'CONFIRMED';

SELECT '=== Copy Trading Subscriptions ===' as info;
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
FROM copy_trading_subscriptions;
