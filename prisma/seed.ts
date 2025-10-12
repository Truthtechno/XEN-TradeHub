import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@corefx.com' },
    update: {},
    create: {
      email: 'admin@corefx.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'SUPERADMIN',
      lastLoginAt: new Date(),
      adminProfile: {
        create: {
          country: 'US',
          phone: '+1-555-0123',
          telegram: '@corefx_admin'
        }
      }
    }
  })

  // Create additional admin users
  const analystPassword = await bcrypt.hash('analyst123', 12)
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@corefx.com' },
    update: {},
    create: {
      email: 'analyst@corefx.com',
      name: 'Market Analyst',
      password: analystPassword,
      role: 'ANALYST',
      lastLoginAt: new Date(),
      adminProfile: {
        create: {
          country: 'UK',
          phone: '+44-20-7946-0958',
          telegram: '@corefx_analyst'
        }
      }
    }
  })

  const editorPassword = await bcrypt.hash('editor123', 12)
  const editor = await prisma.user.upsert({
    where: { email: 'editor@corefx.com' },
    update: {},
    create: {
      email: 'editor@corefx.com',
      name: 'Content Editor',
      password: editorPassword,
      role: 'EDITOR',
      lastLoginAt: new Date(),
      adminProfile: {
        create: {
          country: 'CA',
          phone: '+1-416-555-0123',
          telegram: '@corefx_editor'
        }
      }
    }
  })

  // Create sample users
  const users: any[] = []
  for (let i = 1; i <= 25; i++) {
    const userPassword = await bcrypt.hash('user123', 12)
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        name: `User ${i}`,
        password: userPassword,
        role: 'STUDENT',
        lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random last 7 days
        profile: {
          create: {
            firstName: `User`,
            lastName: `${i}`,
            phone: `+1-555-${String(i).padStart(4, '0')}`,
            country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
            timezone: 'UTC',
            experience: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
            tradingStyle: ['Scalping', 'Day Trading', 'Swing Trading', 'Position Trading'][Math.floor(Math.random() * 4)],
            goals: 'Learn professional trading strategies',
            isActive: true
          }
        },
        adminProfile: {
          create: {
            country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
            phone: `+1-555-${String(i).padStart(4, '0')}`,
            telegram: `@user${i}`
          }
        }
      }
    })
    users.push(user)
  }

  // Create subscriptions for some users
  const subscriptionPlans = ['FREE', 'SIGNALS', 'PREMIUM']
  for (let i = 0; i < 15; i++) {
    const user = users[i]
    const plan = subscriptionPlans[Math.floor(Math.random() * subscriptionPlans.length)]
    
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        plan: plan,
        status: 'ACTIVE',
        stripeId: `sub_${user.id}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
  }

  // Create broker referral links
  const brokerLinks = [
    {
      name: 'EXNESS Main',
      url: 'https://exness.com/register?ref=corefx',
      isActive: true
    },
    {
      name: 'EXNESS Premium',
      url: 'https://exness.com/register?ref=corefx-premium',
      isActive: true
    },
    {
      name: 'EXNESS Demo',
      url: 'https://exness.com/register?ref=corefx-demo',
      isActive: false
    }
  ]

  for (const linkData of brokerLinks) {
    await prisma.brokerLink.create({
      data: linkData
    })
  }

  // Create broker registrations
  const links = await prisma.brokerLink.findMany()
  for (let i = 0; i < 20; i++) {
    const user = users[i]
    const link = links[Math.floor(Math.random() * links.length)]
    
    await prisma.brokerRegistration.create({
      data: {
        userId: user.id,
        linkId: link.id
      }
    })
  }

  // Create courses
  const courses = [
    {
      title: 'Trading Basics for Beginners',
      slug: 'trading-basics-beginners',
      description: 'Learn the fundamentals of trading from scratch',
      priceUSD: 99,
      level: 'BEGINNER',
      status: 'PUBLISHED',
      instructor: 'CoreFX',
      isFree: false,
      duration: 3600, // 1 hour
      totalLessons: 5,
      tags: ['trading', 'basics', 'beginner']
    },
    {
      title: 'Advanced Technical Analysis',
      slug: 'advanced-technical-analysis',
      description: 'Master advanced charting and technical indicators',
      priceUSD: 199,
      level: 'ADVANCED',
      status: 'PUBLISHED',
      instructor: 'CoreFX',
      isFree: false,
      duration: 7200, // 2 hours
      totalLessons: 8,
      tags: ['technical', 'analysis', 'advanced']
    },
    {
      title: 'Risk Management Strategies',
      slug: 'risk-management-strategies',
      description: 'Learn how to protect your capital and manage risk',
      priceUSD: 149,
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      instructor: 'CoreFX',
      isFree: false,
      duration: 5400, // 1.5 hours
      totalLessons: 6,
      tags: ['risk', 'management', 'intermediate']
    }
  ]

  for (const courseData of courses) {
    await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: courseData
    })
  }

  // Create signals
  const signals = [
    {
      title: 'EUR/USD Buy Signal',
      description: 'Strong bullish momentum detected',
      symbol: 'EUR/USD',
      action: 'BUY',
      entryPrice: 1.0850,
      stopLoss: 1.0800,
      takeProfit: 1.0950
    },
    {
      title: 'GBP/USD Sell Signal',
      description: 'Bearish divergence on RSI',
      symbol: 'GBP/USD',
      action: 'SELL',
      entryPrice: 1.2650,
      stopLoss: 1.2700,
      takeProfit: 1.2550
    }
  ]

  for (const signalData of signals) {
    await prisma.signal.upsert({
      where: { id: signalData.title },
      update: {},
      create: signalData
    })
  }

  // Create some orders
  for (let i = 0; i < 10; i++) {
    const user = users[i]
    await prisma.order.create({
      data: {
        userId: user.id,
        amount: Math.floor(Math.random() * 500) + 50,
        currency: 'USD',
        status: 'COMPLETED',
        stripeId: `pi_${user.id}_${i}`
      }
    })
  }

  // Create some notifications
  for (let i = 0; i < 5; i++) {
    const user = users[i]
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to CoreFX!',
        message: 'Thank you for joining our trading community.',
        type: 'WELCOME'
      }
    })
  }

  // Create some mentorship registrations
  for (let i = 0; i < 8; i++) {
    const user = users[i]
    await prisma.mentorshipRegistration.create({
      data: {
        userId: user.id,
        name: user.name || `User ${i}`,
        email: user.email,
        phone: `+1-555-${String(i).padStart(4, '0')}`,
        country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
        experience: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        goals: 'Learn professional trading strategies',
        status: 'PENDING'
      }
    })
  }

  // Create sample resources
  const resources = [
    {
      title: 'Trading Psychology Masterclass',
      slug: 'trading-psychology-masterclass',
      description: 'Learn how to control your emotions and trade with discipline',
      type: 'VIDEO',
      category: 'PSYCHOLOGY',
      url: 'https://example.com/video1',
      thumbnail: '/images/psychology.jpg',
      duration: 3600, // 1 hour
      isPremium: true,
      priceUSD: 49.99,
      tags: ['psychology', 'trading', 'mindset'],
      publishedAt: new Date()
    },
    {
      title: 'Technical Analysis Basics',
      slug: 'technical-analysis-basics',
      description: 'Introduction to chart patterns and technical indicators',
      type: 'PDF',
      category: 'EDUCATION',
      url: 'https://example.com/pdf1',
      thumbnail: '/images/technical.jpg',
      duration: null,
      isPremium: false,
      priceUSD: 0,
      tags: ['technical', 'analysis', 'charts'],
      publishedAt: new Date()
    },
    {
      title: 'Risk Management Strategies',
      slug: 'risk-management-strategies',
      description: 'Essential risk management techniques for traders',
      type: 'VIDEO',
      category: 'RISK_MANAGEMENT',
      url: 'https://example.com/video2',
      thumbnail: '/images/risk.jpg',
      duration: 2400, // 40 minutes
      isPremium: true,
      priceUSD: 29.99,
      tags: ['risk', 'management', 'money'],
      publishedAt: new Date()
    }
  ]

  for (const resourceData of resources) {
    await prisma.resource.upsert({
      where: { slug: resourceData.slug },
      update: {},
      create: resourceData
    })
  }

  // Create some resource purchases
  const createdResources = await prisma.resource.findMany()
  for (let i = 0; i < 5; i++) {
    const user = users[i]
    const resource = createdResources[Math.floor(Math.random() * createdResources.length)]
    
    if (resource.isPremium) {
      await prisma.resourcePurchase.create({
        data: {
          userId: user.id,
          resourceId: resource.id,
          amountUSD: resource.priceUSD || 0,
          status: 'COMPLETED',
          stripeId: `pi_${user.id}_${resource.id}`
        }
      })
    }
  }

  // Create sample forecasts
  const forecasts = [
    {
      title: 'EUR/USD Bullish Forecast',
      description: 'Strong bullish momentum expected for EUR/USD pair based on technical analysis and market sentiment.',
      pair: 'EUR/USD',
      isPublic: true
    },
    {
      title: 'GBP/USD Bearish Outlook',
      description: 'Bearish divergence detected on RSI indicating potential downward movement for GBP/USD.',
      pair: 'GBP/USD',
      isPublic: false
    },
    {
      title: 'USD/JPY Range Trading',
      description: 'USD/JPY expected to trade within range with support at 150.00 and resistance at 152.00.',
      pair: 'USD/JPY',
      isPublic: true
    }
  ]

  for (const forecastData of forecasts) {
    await prisma.forecast.create({
      data: forecastData
    })
  }

  // Create sample events
  const events = [
    {
      title: 'Forex Trading Workshop',
      description: 'Learn the basics of forex trading with our expert instructors.',
      type: 'WORKSHOP',
      price: 0,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: 'Online',
      maxAttendees: 50,
      isPublished: true
    },
    {
      title: 'Advanced Technical Analysis Masterclass',
      description: 'Deep dive into advanced charting techniques and indicators.',
      type: 'MASTERCLASS',
      price: 199,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
      location: 'Online',
      maxAttendees: 25,
      isPublished: true
    },
    {
      title: 'Risk Management Seminar',
      description: 'Essential risk management strategies for successful trading.',
      type: 'SEMINAR',
      price: 99,
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      location: 'Online',
      maxAttendees: 30,
      isPublished: true
    }
  ]

  for (const eventData of events) {
    await prisma.event.create({
      data: eventData
    })
  }

  console.log('✅ Seed completed successfully!')
  console.log(`Created ${users.length + 3} users (including admins)`)
  console.log(`Created ${brokerLinks.length} broker links`)
  console.log(`Created ${courses.length} courses`)
  console.log(`Created ${signals.length} signals`)
  console.log(`Created ${resources.length} resources`)
  console.log(`Created 5 resource purchases`)
  console.log(`Created ${forecasts.length} forecasts`)
  console.log(`Created ${events.length} events`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })