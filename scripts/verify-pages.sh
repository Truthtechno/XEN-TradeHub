#!/bin/bash

echo "🔍 Verifying Affiliate System Pages..."
echo ""

BASE_URL="http://localhost:3001"

# Check if server is running
if ! curl -s "$BASE_URL" > /dev/null; then
    echo "❌ Server is not running at $BASE_URL"
    echo "Please run: npm run dev"
    exit 1
fi

echo "✅ Server is running"
echo ""

# List of pages to verify
declare -a pages=(
    "/affiliates"
    "/auth/signup"
    "/dashboard/affiliates"
    "/admin/affiliates"
    "/admin/affiliates/commissions"
)

echo "📄 Checking pages..."
echo ""

for page in "${pages[@]}"
do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page")
    if [ "$status" -eq 200 ] || [ "$status" -eq 401 ] || [ "$status" -eq 302 ]; then
        echo "✅ $page - OK (Status: $status)"
    else
        echo "❌ $page - ERROR (Status: $status)"
    fi
done

echo ""
echo "🔗 API Endpoints..."
echo ""

# List of API endpoints
declare -a apis=(
    "/api/affiliates/program"
    "/api/affiliates/register"
    "/api/admin/affiliates/commissions"
)

for api in "${apis[@]}"
do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$api")
    if [ "$status" -eq 200 ] || [ "$status" -eq 401 ]; then
        echo "✅ $api - OK (Status: $status)"
    else
        echo "❌ $api - ERROR (Status: $status)"
    fi
done

echo ""
echo "✅ Page verification complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Open browser: $BASE_URL"
echo "2. Test affiliate registration"
echo "3. Test admin panel"
echo ""
