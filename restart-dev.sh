#!/bin/bash

echo "🔄 Clearing Next.js cache..."
rm -rf .next

echo "✅ Cache cleared!"
echo ""
echo "Please restart your dev server with: npm run dev"
echo "Then refresh your browser with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
