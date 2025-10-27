const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedMoreForecasts() {
  console.log('🌱 Seeding more test forecasts...\n')

  try {
    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@corefx.com' }
    })

    if (!adminUser) {
      console.error('Admin user not found. Please run seed-test-data.js first.')
      return
    }

    // Create more public forecasts
    const publicForecasts = [
      {
        title: 'AUD/USD Technical Analysis',
        description: 'Australian dollar showing strong support at 0.6500 level. Expecting bounce towards 0.6600 resistance.',
        pair: 'AUD/USD',
        chartImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 23,
        likes: 5,
        comments: 1
      },
      {
        title: 'NZD/USD Market Outlook',
        description: 'New Zealand dollar consolidating after recent gains. Watch for breakout above 0.6200.',
        pair: 'NZD/USD',
        chartImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 18,
        likes: 3,
        comments: 0
      },
      {
        title: 'USD/CAD Weekly Analysis',
        description: 'Canadian dollar showing weakness against USD. Potential for further decline towards 1.3800.',
        pair: 'USD/CAD',
        chartImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 31,
        likes: 7,
        comments: 2
      },
      {
        title: 'EUR/GBP Cross Analysis',
        description: 'Euro vs Pound showing interesting price action. Key level at 0.8600 to watch.',
        pair: 'EUR/GBP',
        chartImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 15,
        likes: 2,
        comments: 1
      },
      {
        title: 'USD/CHF Safe Haven Analysis',
        description: 'Swiss Franc showing strength as safe haven. Potential for further appreciation.',
        pair: 'USD/CHF',
        chartImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 27,
        likes: 6,
        comments: 1
      },
      {
        title: 'GBP/JPY Volatility Update',
        description: 'Pound vs Yen showing high volatility. Risk management crucial for this pair.',
        pair: 'GBP/JPY',
        chartImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 19,
        likes: 4,
        comments: 0
      },
      {
        title: 'EUR/JPY Technical Setup',
        description: 'Euro vs Yen showing bullish divergence. Potential for upward movement.',
        pair: 'EUR/JPY',
        chartImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 22,
        likes: 5,
        comments: 1
      },
      {
        title: 'AUD/JPY Risk Sentiment',
        description: 'Australian dollar vs Yen reflecting risk appetite. Watch for correlation with equity markets.',
        pair: 'AUD/JPY',
        chartImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 16,
        likes: 3,
        comments: 0
      }
    ]

    // Create more premium forecasts
    const premiumForecasts = [
      {
        title: 'EUR/USD Premium Analysis',
        description: 'Exclusive deep dive into EUR/USD market structure. Institutional level analysis with key levels and targets.',
        pair: 'EUR/USD',
        chartImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        isPublic: false,
        authorId: adminUser.id,
        views: 12,
        likes: 8,
        comments: 3
      },
      {
        title: 'GBP/USD Premium Forecast',
        description: 'Advanced technical analysis for GBP/USD with proprietary indicators and market sentiment analysis.',
        pair: 'GBP/USD',
        chartImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        isPublic: false,
        authorId: adminUser.id,
        views: 9,
        likes: 6,
        comments: 2
      },
      {
        title: 'USD/JPY Institutional Analysis',
        description: 'Institutional level analysis of USD/JPY with order flow insights and central bank policy implications.',
        pair: 'USD/JPY',
        chartImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        isPublic: false,
        authorId: adminUser.id,
        views: 7,
        likes: 4,
        comments: 1
      },
      {
        title: 'Gold Premium Technical Setup',
        description: 'Exclusive gold analysis with key support and resistance levels. Risk management strategies included.',
        pair: 'XAU/USD',
        chartImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        isPublic: false,
        authorId: adminUser.id,
        views: 11,
        likes: 7,
        comments: 2
      },
      {
        title: 'Oil Market Premium Update',
        description: 'Crude oil analysis with supply and demand factors. Key levels for WTI and Brent.',
        pair: 'WTI/USD',
        chartImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        isPublic: false,
        authorId: adminUser.id,
        views: 8,
        likes: 5,
        comments: 1
      },
      {
        title: 'Crypto Premium Analysis',
        description: 'Bitcoin and Ethereum analysis with institutional adoption trends and regulatory updates.',
        pair: 'ETH/USD',
        chartImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        isPublic: false,
        authorId: adminUser.id,
        views: 6,
        likes: 3,
        comments: 0
      }
    ]

    // Create all forecasts
    for (const forecast of [...publicForecasts, ...premiumForecasts]) {
      await prisma.forecast.create({ data: forecast })
    }

    console.log('✅ Additional forecasts created')
    console.log(`- ${publicForecasts.length} more public forecasts`)
    console.log(`- ${premiumForecasts.length} more premium forecasts`)
    console.log('\n🎉 Total forecasts now available for infinite scroll testing!')

  } catch (error) {
    console.error('❌ Error seeding additional forecasts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedMoreForecasts()
