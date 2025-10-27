-- Check current data distribution
SELECT 'Current Data Distribution' as info;
SELECT 
  'Users' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
FROM users;

SELECT 
  'Academy Registrations' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
FROM academy_class_registrations WHERE status = 'CONFIRMED';

-- Update some users to have different creation dates for testing
UPDATE users 
SET created_at = NOW() - INTERVAL '3 days'
WHERE id IN (SELECT id FROM users ORDER BY created_at DESC LIMIT 3);

UPDATE users 
SET created_at = NOW() - INTERVAL '15 days'
WHERE id IN (SELECT id FROM users ORDER BY created_at DESC LIMIT 3 OFFSET 3);

UPDATE users 
SET created_at = NOW() - INTERVAL '45 days'
WHERE id IN (SELECT id FROM users ORDER BY created_at DESC LIMIT 3 OFFSET 6);

-- Update some academy registrations
UPDATE academy_class_registrations
SET created_at = NOW() - INTERVAL '3 days'
WHERE id IN (SELECT id FROM academy_class_registrations LIMIT 1);

-- Verify the changes
SELECT 'After Update' as info;
SELECT 
  'Users' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
FROM users;

SELECT 
  'Academy Registrations' as table_name,
  COUNT(*) as total,
  SUM("amountUSD") as total_revenue,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
  SUM("amountUSD") FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as revenue_7_days
FROM academy_class_registrations WHERE status = 'CONFIRMED';
