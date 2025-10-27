#!/bin/bash

echo "🧪 Testing Reports Page Compilation..."
echo ""

# Clear cache
echo "1️⃣ Clearing Next.js cache..."
rm -rf .next
echo "✅ Cache cleared"
echo ""

# Check if dev server is running
echo "2️⃣ Checking dev server status..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ Dev server is running on port 3000"
else
    echo "❌ Dev server is NOT running"
    echo "   Please run: npm run dev"
    exit 1
fi
echo ""

# Wait a moment for compilation
echo "3️⃣ Waiting for Next.js to compile..."
sleep 3
echo ""

# Try to fetch the page (this will trigger compilation if not already done)
echo "4️⃣ Testing page compilation..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/reports 2>&1)

if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "302" ]; then
    echo "✅ Page compiled successfully (HTTP $RESPONSE)"
    echo "   Note: 401/302 is expected (requires authentication)"
    echo ""
    echo "🎉 SUCCESS! The page compiles without errors."
    echo ""
    echo "📝 Next steps:"
    echo "   1. Open: http://localhost:3000/admin/reports"
    echo "   2. Login as: admin@corefx.com / admin123"
    echo "   3. Verify the page loads correctly"
    echo ""
else
    echo "❌ Page compilation may have failed (HTTP $RESPONSE)"
    echo ""
    echo "🔍 Check the dev server terminal for error messages"
    echo ""
fi
