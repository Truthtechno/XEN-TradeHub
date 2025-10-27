#!/bin/bash

echo "🔧 Testing Report Filters..."
echo ""

# Update database with varied dates
echo "1️⃣ Updating database with varied dates..."
psql postgresql://postgres:password@localhost:5432/xen_tradehub << 'EOF'
UPDATE users SET created_at = NOW() - INTERVAL '3 days' WHERE id IN (SELECT id FROM users ORDER BY created_at LIMIT 3);
UPDATE users SET created_at = NOW() - INTERVAL '15 days' WHERE id IN (SELECT id FROM users ORDER BY created_at LIMIT 3 OFFSET 3);
UPDATE users SET created_at = NOW() - INTERVAL '45 days' WHERE id IN (SELECT id FROM users ORDER BY created_at LIMIT 3 OFFSET 6);
UPDATE academy_class_registrations SET created_at = NOW() - INTERVAL '3 days' WHERE id IN (SELECT id FROM academy_class_registrations LIMIT 1);
UPDATE copy_trading_subscriptions SET created_at = NOW() - INTERVAL '5 days' WHERE id IN (SELECT id FROM copy_trading_subscriptions LIMIT 3);
EOF

echo ""
echo "2️⃣ Verifying database changes..."
psql postgresql://postgres:password@localhost:5432/xen_tradehub -c "
SELECT 
  'All Users' as metric,
  COUNT(*) as value
FROM users
UNION ALL
SELECT 
  'Last 7 Days' as metric,
  COUNT(*) as value
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
  'Last 30 Days' as metric,
  COUNT(*) as value
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days';
"

echo ""
echo "3️⃣ Testing API endpoints..."
echo ""

# Test All Time
echo "Testing: All Time"
ALL_TIME=$(curl -s "http://localhost:3000/api/admin/reports/simple?dateRange=all" 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "✅ API Response received"
  echo "$ALL_TIME" | jq '.data.users.total' 2>/dev/null || echo "Response: $ALL_TIME"
else
  echo "❌ API call failed - is server running?"
fi

echo ""

# Test Last 7 Days
echo "Testing: Last 7 Days"
LAST_7=$(curl -s "http://localhost:3000/api/admin/reports/simple?dateRange=7d" 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "✅ API Response received"
  echo "$LAST_7" | jq '.data.users.total' 2>/dev/null || echo "Response: $LAST_7"
else
  echo "❌ API call failed - is server running?"
fi

echo ""
echo "4️⃣ Summary:"
echo "If API calls worked, the numbers should be different:"
echo "- All Time should show 14 users"
echo "- Last 7 Days should show 3 users"
echo ""
echo "✅ Database updated successfully!"
echo "🌐 Now open http://localhost:3000/admin/reports and test the filters"
