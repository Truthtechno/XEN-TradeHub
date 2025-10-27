const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedTestData() {
  console.log('🌱 Seeding test data...\n')

  try {
    // Create test admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@corefx.com' },
      update: {},
      create: {
        email: 'admin@corefx.com',
        name: 'CoreFX Admin',
        role: 'SUPERADMIN'
      }
    })

    // Create test student user
    const studentUser = await prisma.user.upsert({
      where: { email: 'student@test.com' },
      update: {},
      create: {
        email: 'student@test.com',
        name: 'Test Student',
        role: 'STUDENT'
      }
    })

    // Create test subscribed student
    const subscribedStudent = await prisma.user.upsert({
      where: { email: 'subscribed@test.com' },
      update: {},
      create: {
        email: 'subscribed@test.com',
        name: 'Subscribed Student',
        role: 'STUDENT'
      }
    })

    // Create subscription for subscribed student
    await prisma.signalSubscription.create({
      data: {
        userId: subscribedStudent.id,
        active: true
      }
    })

    console.log('✅ Users created')

    // Create test signals
    const signals = [
      {
        symbol: 'EUR/USD',
        direction: 'BUY',
        entry: 1.0850,
        sl: 1.0800,
        tp: 1.0950,
        notes: 'Strong bullish momentum, targeting resistance level at 1.0950',
        visibility: 'SUBSCRIBERS_ONLY',
        authorId: adminUser.id,
        publishedAt: new Date()
      },
      {
        symbol: 'GBP/USD',
        direction: 'SELL',
        entry: 1.2650,
        sl: 1.2700,
        tp: 1.2500,
        notes: 'Bearish divergence on RSI, expecting pullback to 1.2500',
        visibility: 'PUBLIC',
        authorId: adminUser.id,
        publishedAt: new Date()
      },
      {
        symbol: 'USD/JPY',
        direction: 'BUY',
        entry: 148.50,
        sl: 148.00,
        tp: 149.50,
        notes: 'Breakout above key resistance, targeting next level at 149.50',
        visibility: 'SUBSCRIBERS_ONLY',
        authorId: adminUser.id,
        publishedAt: new Date()
      }
    ]

    for (const signal of signals) {
      await prisma.signal.create({ data: signal })
    }

    console.log('✅ Signals created')

    // Create test forecasts
    const forecasts = [
      {
        title: 'EUR/USD Bullish Setup',
        description: 'Strong bullish momentum expected with key resistance at 1.0950. Entry at 1.0850 with stop loss at 1.0800.',
        pair: 'EUR/USD',
        chartImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 45,
        likes: 12,
        comments: 3
      },
      {
        title: 'GBP/USD Bearish Analysis',
        description: 'Bearish divergence on RSI suggests potential pullback. Watch for break below 1.2650 support level.',
        pair: 'GBP/USD',
        chartImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 32,
        likes: 8,
        comments: 2
      },
      {
        title: 'USD/JPY Premium Analysis',
        description: 'Exclusive analysis: USD/JPY showing strong bullish momentum with institutional buying pressure. Target 149.50.',
        pair: 'USD/JPY',
        chartImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        isPublic: false,
        authorId: adminUser.id,
        views: 15,
        likes: 5,
        comments: 1
      },
      {
        title: 'Gold (XAU/USD) Premium Forecast',
        description: 'Gold breaking key resistance with strong momentum towards 2050. Premium subscribers get early access to this analysis.',
        pair: 'XAU/USD',
        chartImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        isPublic: false,
        authorId: adminUser.id,
        views: 8,
        likes: 3,
        comments: 0
      },
      {
        title: 'BTC/USD Market Update',
        description: 'Bitcoin showing consolidation pattern. Watch for breakout above 45,000 resistance level.',
        pair: 'BTC/USD',
        chartImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        isPublic: true,
        authorId: adminUser.id,
        views: 67,
        likes: 18,
        comments: 7
      }
    ]

    for (const forecast of forecasts) {
      await prisma.forecast.create({ data: forecast })
    }

    console.log('✅ Forecasts created')

    // Create some test comments
    const forecast1 = await prisma.forecast.findFirst({ where: { title: 'EUR/USD Bullish Setup' } })
    const forecast2 = await prisma.forecast.findFirst({ where: { title: 'USD/JPY Premium Analysis' } })

    if (forecast1) {
      await prisma.userForecastComment.create({
        data: {
          userId: studentUser.id,
          forecastId: forecast1.id,
          content: 'Great analysis! What time frame are you using?',
          isAdmin: false
        }
      })

      await prisma.userForecastComment.create({
        data: {
          userId: adminUser.id,
          forecastId: forecast1.id,
          content: 'Using 4H time frame for this analysis. The setup looks very promising.',
          isAdmin: true
        }
      })
    }

    if (forecast2) {
      await prisma.userForecastComment.create({
        data: {
          userId: subscribedStudent.id,
          forecastId: forecast2.id,
          content: 'Excellent premium content! This is exactly what I needed.',
          isAdmin: false
        }
      })
    }

    console.log('✅ Comments created')

    console.log('\n🎉 Test data seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Admin User: ${adminUser.email}`)
    console.log(`- Student User: ${studentUser.email}`)
    console.log(`- Subscribed Student: ${subscribedStudent.email}`)
    console.log('- 3 Signals (2 public, 1 premium)')
    console.log('- 5 Forecasts (3 public, 2 premium)')
    console.log('- Sample comments with admin highlighting')
    console.log('\n🚀 You can now test the full flow!')

  } catch (error) {
    console.error('❌ Error seeding test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTestData()
