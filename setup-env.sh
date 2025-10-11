#!/bin/bash

echo "🔧 Setting up environment variables..."

# Create .env.local file
cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/corefx"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-development-only"

# JWT
JWT_SECRET="your-jwt-secret-here-development-only-very-long-and-secure-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Exness API
EXNESS_API_KEY="your-exness-api-key"
EXNESS_API_SECRET="your-exness-api-secret"

# TradingView API
TRADINGVIEW_API_KEY="your-tradingview-api-key"

# Economic Calendar API
ECONOMIC_CALENDAR_API_KEY="your-economic-calendar-api-key"
EOF

echo "✅ Environment variables set up!"
echo "📝 Please update the values in .env.local with your actual credentials"
echo "🚀 Restart the development server after updating the environment variables"
