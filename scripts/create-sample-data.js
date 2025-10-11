/**
 * Create Sample Data Script for CoreFX
 * 
 * This script creates comprehensive sample data including:
 * - Admin and regular users
 * - Events and academy classes with registrations
 * - Signals for regular and premium users
 * - Courses and resources with purchases
 * - Likes, comments, and engagement data
 * - Enquiries from users
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Sample data arrays
const sampleUsers = [
  {
    email: 'admin@corefx.com',
    name: 'CoreFX Admin',
    password: 'admin123',
    role: 'SUPERADMIN'
  },
  {
    email: 'analyst@corefx.com',
    name: 'Trading Analyst',
    password: 'analyst123',
    role: 'ANALYST'
  },
  {
    email: 'editor@corefx.com',
    name: 'Content Editor',
    password: 'editor123',
    role: 'EDITOR'
  },
  {
    email: 'john.trader@email.com',
    name: 'John Trader',
    password: 'password123',
    role: 'STUDENT'
  },
  {
    email: 'sarah.investor@email.com',
    name: 'Sarah Investor',
    password: 'password123',
    role: 'STUDENT'
  },
  {
    email: 'mike.daytrader@email.com',
    name: 'Mike Day Trader',
    password: 'password123',
    role: 'STUDENT'
  },
  {
    email: 'lisa.forex@email.com',
    name: 'Lisa Forex',
    password: 'password123',
    role: 'STUDENT'
  },
  {
    email: 'david.premium@email.com',
    name: 'David Premium',
    password: 'password123',
    role: 'STUDENT'
  }
]

const sampleEvents = [
  {
    title: 'Advanced Forex Trading Workshop',
    description: 'Learn advanced trading strategies and risk management techniques from industry experts.',
    type: 'WORKSHOP',
    price: 299.99,
    startDate: new Date('2024-02-15T10:00:00Z'),
    endDate: new Date('2024-02-15T17:00:00Z'),
    location: 'CoreFX Trading Center, New York',
    maxAttendees: 50,
    isPublished: true
  },
  {
    title: 'Crypto Trading Masterclass',
    description: 'Master cryptocurrency trading with our comprehensive masterclass covering DeFi, NFTs, and market analysis.',
    type: 'MASTERCLASS',
    price: 499.99,
    startDate: new Date('2024-02-20T09:00:00Z'),
    endDate: new Date('2024-02-20T18:00:00Z'),
    location: 'Online - Zoom',
    maxAttendees: 100,
    isPublished: true
  },
  {
    title: 'Risk Management Seminar',
    description: 'Essential risk management strategies for successful trading.',
    type: 'SEMINAR',
    price: 149.99,
    startDate: new Date('2024-02-25T14:00:00Z'),
    endDate: new Date('2024-02-25T16:00:00Z'),
    location: 'CoreFX Trading Center, London',
    maxAttendees: 30,
    isPublished: true
  },
  {
    title: 'Trading Psychology Workshop',
    description: 'Master your emotions and develop the mindset of a successful trader.',
    type: 'WORKSHOP',
    price: 199.99,
    startDate: new Date('2024-03-01T10:00:00Z'),
    endDate: new Date('2024-03-01T15:00:00Z'),
    location: 'Online - Zoom',
    maxAttendees: 75,
    isPublished: true
  }
]

const sampleAcademyClasses = [
  {
    title: 'Professional Trading Course - Level 1',
    description: 'Comprehensive introduction to professional trading covering all major concepts and strategies.',
    price: 1999.99,
    duration: '5 days',
    level: 'BEGINNER',
    maxStudents: 20,
    instructor: 'Dr. Michael Chen',
    location: 'CoreFX Academy, New York',
    nextSession: new Date('2024-02-10T09:00:00Z'),
    status: 'UPCOMING',
    isPublished: true
  },
  {
    title: 'Advanced Technical Analysis Masterclass',
    description: 'Deep dive into advanced technical analysis techniques, chart patterns, and indicators.',
    price: 2999.99,
    duration: '3 days',
    level: 'ADVANCED',
    maxStudents: 15,
    instructor: 'Sarah Williams',
    location: 'CoreFX Academy, London',
    nextSession: new Date('2024-02-15T09:00:00Z'),
    status: 'UPCOMING',
    isPublished: true
  },
  {
    title: 'Algorithmic Trading Bootcamp',
    description: 'Learn to build and deploy algorithmic trading strategies using Python and modern tools.',
    price: 3999.99,
    duration: '7 days',
    level: 'MASTERCLASS',
    maxStudents: 12,
    instructor: 'Dr. Alex Rodriguez',
    location: 'CoreFX Academy, Singapore',
    nextSession: new Date('2024-02-20T09:00:00Z'),
    status: 'UPCOMING',
    isPublished: true
  },
  {
    title: 'Options Trading Strategies',
    description: 'Master options trading strategies for income generation and portfolio protection.',
    price: 2499.99,
    duration: '4 days',
    level: 'INTERMEDIATE',
    maxStudents: 18,
    instructor: 'Jennifer Lee',
    location: 'CoreFX Academy, Toronto',
    nextSession: new Date('2024-02-25T09:00:00Z'),
    status: 'UPCOMING',
    isPublished: true
  }
]

const sampleSignals = [
  {
    title: 'EUR/USD Long Signal',
    description: 'Strong bullish momentum detected on EUR/USD with key support holding.',
    symbol: 'EURUSD',
    action: 'BUY',
    direction: 'LONG',
    entry: 1.0850,
    entryPrice: 1.0850,
    sl: 1.0800,
    stopLoss: 1.0800,
    tp: 1.0950,
    takeProfit: 1.0950,
    notes: 'Target: 1.0950, Stop Loss: 1.0800. Strong support at 1.0820.',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    publishedAt: new Date(),
    isActive: true
  },
  {
    title: 'GBP/USD Short Signal',
    description: 'Bearish divergence spotted on GBP/USD with resistance at 1.2750.',
    symbol: 'GBPUSD',
    action: 'SELL',
    direction: 'SHORT',
    entry: 1.2720,
    entryPrice: 1.2720,
    sl: 1.2770,
    stopLoss: 1.2770,
    tp: 1.2650,
    takeProfit: 1.2650,
    notes: 'Target: 1.2650, Stop Loss: 1.2770. Watch for break below 1.2700.',
    visibility: 'SUBSCRIBERS_ONLY',
    status: 'ACTIVE',
    publishedAt: new Date(),
    isActive: true
  },
  {
    title: 'USD/JPY Long Signal',
    description: 'USD/JPY showing strong bullish momentum with key resistance break.',
    symbol: 'USDJPY',
    action: 'BUY',
    direction: 'LONG',
    entry: 150.20,
    entryPrice: 150.20,
    sl: 149.80,
    stopLoss: 149.80,
    tp: 151.00,
    takeProfit: 151.00,
    notes: 'Target: 151.00, Stop Loss: 149.80. Break above 150.50 confirms.',
    visibility: 'PRIVATE',
    status: 'ACTIVE',
    publishedAt: new Date(),
    isActive: true
  },
  {
    title: 'AUD/USD Short Signal',
    description: 'AUD/USD facing strong resistance with bearish reversal pattern.',
    symbol: 'AUDUSD',
    action: 'SELL',
    direction: 'SHORT',
    entry: 0.6580,
    entryPrice: 0.6580,
    sl: 0.6620,
    stopLoss: 0.6620,
    tp: 0.6500,
    takeProfit: 0.6500,
    notes: 'Target: 0.6500, Stop Loss: 0.6620. Watch for break below 0.6550.',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    publishedAt: new Date(),
    isActive: true
  },
  {
    title: 'Gold Long Signal',
    description: 'Gold showing strong bullish momentum with safe haven demand.',
    symbol: 'XAUUSD',
    action: 'BUY',
    direction: 'LONG',
    entry: 2020.00,
    entryPrice: 2020.00,
    sl: 2010.00,
    stopLoss: 2010.00,
    tp: 2040.00,
    takeProfit: 2040.00,
    notes: 'Target: 2040.00, Stop Loss: 2010.00. Strong support at 2015.00.',
    visibility: 'SUBSCRIBERS_ONLY',
    status: 'ACTIVE',
    publishedAt: new Date(),
    isActive: true
  }
]

const sampleCourses = [
  {
    title: 'The GOAT Strategy - Complete Trading Course',
    slug: 'goat-strategy-complete',
    description: 'Master the most profitable trading strategy used by professional traders worldwide.',
    shortDescription: 'Complete trading course covering the GOAT strategy',
    priceUSD: 997.00,
    level: 'INTERMEDIATE',
    status: 'PUBLISHED',
    instructor: 'CoreFX Team',
    isFree: false,
    duration: 1200,
    totalLessons: 15,
    views: 1250,
    rating: 4.8,
    tags: ['trading', 'strategy', 'forex', 'profitable']
  },
  {
    title: 'Forex Trading for Beginners',
    slug: 'forex-trading-beginners',
    description: 'Complete beginner guide to forex trading with practical examples.',
    shortDescription: 'Learn forex trading from scratch',
    priceUSD: 297.00,
    level: 'BEGINNER',
    status: 'PUBLISHED',
    instructor: 'CoreFX Team',
    isFree: false,
    duration: 600,
    totalLessons: 10,
    views: 2100,
    rating: 4.6,
    tags: ['forex', 'beginner', 'trading', 'education']
  },
  {
    title: 'Advanced Technical Analysis',
    slug: 'advanced-technical-analysis',
    description: 'Master advanced technical analysis techniques and indicators.',
    shortDescription: 'Advanced technical analysis course',
    priceUSD: 497.00,
    level: 'ADVANCED',
    status: 'PUBLISHED',
    instructor: 'CoreFX Team',
    isFree: false,
    duration: 900,
    totalLessons: 12,
    views: 850,
    rating: 4.9,
    tags: ['technical-analysis', 'advanced', 'indicators', 'charts']
  }
]

const sampleResources = [
  {
    title: 'Trading Journal Template',
    slug: 'trading-journal-template',
    description: 'Professional trading journal template to track your trades and performance.',
    type: 'TEMPLATE',
    category: 'TOOLS',
    url: '/resources/trading-journal-template.xlsx',
    isPremium: false,
    priceUSD: 0,
    tags: ['journal', 'template', 'tracking', 'performance']
  },
  {
    title: 'Market Analysis Report - Q1 2024',
    slug: 'market-analysis-q1-2024',
    description: 'Comprehensive market analysis report for Q1 2024 with trading opportunities.',
    type: 'REPORT',
    category: 'ANALYSIS',
    url: '/resources/market-analysis-q1-2024.pdf',
    isPremium: true,
    priceUSD: 49.99,
    tags: ['analysis', 'report', 'market', 'opportunities']
  },
  {
    title: 'Risk Management Calculator',
    slug: 'risk-management-calculator',
    description: 'Advanced risk management calculator for position sizing and risk assessment.',
    type: 'TOOL',
    category: 'TOOLS',
    url: '/resources/risk-calculator.html',
    isPremium: true,
    priceUSD: 29.99,
    tags: ['risk', 'calculator', 'position-sizing', 'tools']
  },
  {
    title: 'Trading Psychology Guide',
    slug: 'trading-psychology-guide',
    description: 'Complete guide to mastering trading psychology and emotional control.',
    type: 'GUIDE',
    category: 'PSYCHOLOGY',
    url: '/resources/trading-psychology-guide.pdf',
    isPremium: false,
    priceUSD: 0,
    tags: ['psychology', 'emotions', 'mindset', 'guide']
  }
]

const sampleEnquiries = [
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    subject: 'Course Enrollment Question',
    message: 'I am interested in enrolling in the GOAT Strategy course but have some questions about the prerequisites and time commitment required.',
    enquiryType: 'GENERAL',
    status: 'NEW'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+44-20-7946-0958',
    subject: 'Signal Subscription Inquiry',
    message: 'I would like to know more about your premium signal service and how to subscribe. What is the success rate of your signals?',
    enquiryType: 'TECHNICAL',
    status: 'IN_PROGRESS'
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+65-6123-4567',
    subject: 'Partnership Opportunity',
    message: 'I represent a trading education company and would like to discuss potential partnership opportunities with CoreFX.',
    enquiryType: 'PARTNERSHIP',
    status: 'NEW'
  },
  {
    name: 'Lisa Brown',
    email: 'lisa.brown@email.com',
    phone: '+1-555-0456',
    subject: 'Academy Class Registration',
    message: 'I am interested in registering for the Advanced Technical Analysis Masterclass. Are there any early bird discounts available?',
    enquiryType: 'GENERAL',
    status: 'RESOLVED'
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+61-2-9374-4000',
    subject: 'Technical Support',
    message: 'I am having trouble accessing my purchased resources. The download links are not working properly.',
    enquiryType: 'TECHNICAL',
    status: 'IN_PROGRESS'
  }
]

async function createSampleData() {
  try {
    console.log('🚀 Starting sample data creation...')

    // 1. Create users
    console.log('👥 Creating users...')
    const createdUsers = []
    
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role
        }
      })
      createdUsers.push(user)
      console.log(`✅ Created user: ${user.email} (${user.role})`)
    }

    // Create user profiles for students
    const studentUsers = createdUsers.filter(user => user.role === 'STUDENT')
    for (const user of studentUsers) {
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          firstName: user.name?.split(' ')[0] || 'User',
          lastName: user.name?.split(' ')[1] || 'Name',
          phone: '+1-555-0123',
          country: 'United States',
          timezone: 'America/New_York',
          experience: 'INTERMEDIATE',
          tradingStyle: 'DAY_TRADING',
          goals: 'Learn profitable trading strategies'
        }
      })
    }

    // Create subscriptions for some users
    const premiumUsers = studentUsers.slice(0, 3) // First 3 students get premium
    for (const user of premiumUsers) {
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })
    }

    // 2. Create events
    console.log('📅 Creating events...')
    const createdEvents = []
    for (const eventData of sampleEvents) {
      const event = await prisma.event.create({
        data: eventData
      })
      createdEvents.push(event)
      console.log(`✅ Created event: ${event.title}`)
    }

    // Create event registrations
    for (const event of createdEvents) {
      const registrationsCount = Math.floor(Math.random() * 5) + 1
      const registeredUsers = new Set()
      for (let i = 0; i < registrationsCount; i++) {
        const randomUser = studentUsers[Math.floor(Math.random() * studentUsers.length)]
        if (!registeredUsers.has(randomUser.id)) {
          registeredUsers.add(randomUser.id)
          try {
            await prisma.eventRegistration.create({
              data: {
                eventId: event.id,
                userId: randomUser.id,
                fullName: randomUser.name || 'User Name',
                email: randomUser.email,
                phone: '+1-555-0123',
                company: 'Trading Company',
                jobTitle: 'Trader',
                amountUSD: event.price,
                status: Math.random() > 0.3 ? 'CONFIRMED' : 'PENDING',
                paymentStatus: Math.random() > 0.3 ? 'PAID' : 'PENDING'
              }
            })
          } catch (error) {
            // Skip if already registered
            if (error.code !== 'P2002') {
              throw error
            }
          }
        }
      }
    }

    // 3. Create academy classes
    console.log('🎓 Creating academy classes...')
    const createdClasses = []
    for (const classData of sampleAcademyClasses) {
      const academyClass = await prisma.academyClass.create({
        data: classData
      })
      createdClasses.push(academyClass)
      console.log(`✅ Created academy class: ${academyClass.title}`)
    }

    // Create academy class registrations
    for (const academyClass of createdClasses) {
      const registrationsCount = Math.floor(Math.random() * 8) + 2
      const registeredUsers = new Set()
      for (let i = 0; i < registrationsCount; i++) {
        const randomUser = studentUsers[Math.floor(Math.random() * studentUsers.length)]
        if (!registeredUsers.has(randomUser.id)) {
          registeredUsers.add(randomUser.id)
          try {
            await prisma.academyClassRegistration.create({
              data: {
                classId: academyClass.id,
                userId: randomUser.id,
                fullName: randomUser.name || 'User Name',
                email: randomUser.email,
                phone: '+1-555-0123',
                experience: 'INTERMEDIATE',
                goals: 'Learn advanced trading strategies',
                amountUSD: academyClass.price,
                status: Math.random() > 0.2 ? 'CONFIRMED' : 'PENDING',
                paymentStatus: Math.random() > 0.2 ? 'PAID' : 'PENDING'
              }
            })
          } catch (error) {
            // Skip if already registered
            if (error.code !== 'P2002') {
              throw error
            }
          }
        }
      }
    }

    // 4. Create signals
    console.log('📊 Creating signals...')
    const createdSignals = []
    for (const signalData of sampleSignals) {
      const signal = await prisma.signal.create({
        data: signalData
      })
      createdSignals.push(signal)
      console.log(`✅ Created signal: ${signal.title}`)

      // Create user signals for premium users
      for (const user of premiumUsers) {
        await prisma.userSignal.create({
          data: {
            userId: user.id,
            signalId: signal.id
          }
        })
      }
    }

    // 5. Create courses
    console.log('📚 Creating courses...')
    const createdCourses = []
    for (const courseData of sampleCourses) {
      const course = await prisma.course.upsert({
        where: { slug: courseData.slug },
        update: {},
        create: courseData
      })
      createdCourses.push(course)
      console.log(`✅ Created course: ${course.title}`)

      // Create course enrollments
      const enrollmentsCount = Math.floor(Math.random() * 10) + 5
      const enrolledUsers = new Set()
      for (let i = 0; i < enrollmentsCount; i++) {
        const randomUser = studentUsers[Math.floor(Math.random() * studentUsers.length)]
        if (!enrolledUsers.has(randomUser.id)) {
          enrolledUsers.add(randomUser.id)
          try {
            await prisma.courseEnrollment.create({
              data: {
                userId: randomUser.id,
                courseId: course.id,
                progress: Math.random() * 100,
                completed: Math.random() > 0.7
              }
            })
          } catch (error) {
            // Skip if already enrolled
            if (error.code !== 'P2002') {
              throw error
            }
          }
        }
      }
    }

    // 6. Create resources
    console.log('📄 Creating resources...')
    const createdResources = []
    for (const resourceData of sampleResources) {
      const resource = await prisma.resource.upsert({
        where: { slug: resourceData.slug },
        update: {},
        create: resourceData
      })
      createdResources.push(resource)
      console.log(`✅ Created resource: ${resource.title}`)

      // Create resource purchases for premium resources
      if (resource.isPremium) {
        const purchasesCount = Math.floor(Math.random() * 5) + 1
        for (let i = 0; i < purchasesCount; i++) {
          const randomUser = studentUsers[Math.floor(Math.random() * studentUsers.length)]
          await prisma.resourcePurchase.create({
            data: {
              userId: randomUser.id,
              resourceId: resource.id,
              amountUSD: resource.priceUSD || 0,
              status: 'COMPLETED'
            }
          })
        }
      }
    }

    // 7. Create enquiries
    console.log('❓ Creating enquiries...')
    for (const enquiryData of sampleEnquiries) {
      const enquiry = await prisma.enquiry.create({
        data: enquiryData
      })
      console.log(`✅ Created enquiry: ${enquiry.subject}`)
    }

    // 8. Create engagement data (likes, comments)
    console.log('💬 Creating engagement data...')
    
    // Signal likes and comments
    for (const signal of createdSignals) {
      const likesCount = Math.floor(Math.random() * 15) + 5
      for (let i = 0; i < likesCount; i++) {
        const randomUser = studentUsers[Math.floor(Math.random() * studentUsers.length)]
        try {
          await prisma.userSignalLike.create({
            data: {
              userId: randomUser.id,
              signalId: signal.id
            }
          })
        } catch (error) {
          // Skip if already liked
        }
      }

      // Update signal like count
      await prisma.signal.update({
        where: { id: signal.id },
        data: { likes: likesCount }
      })

      // Signal comments
      const commentsCount = Math.floor(Math.random() * 8) + 2
      for (let i = 0; i < commentsCount; i++) {
        const randomUser = studentUsers[Math.floor(Math.random() * studentUsers.length)]
        const comments = [
          'Great signal! Thanks for sharing.',
          'This looks promising, will follow closely.',
          'Excellent analysis, very detailed.',
          'I agree with this setup, good entry point.',
          'Thanks for the signal, much appreciated!',
          'Good risk/reward ratio on this one.',
          'Clear and concise, easy to follow.',
          'Perfect timing on this signal.'
        ]
        await prisma.userSignalComment.create({
          data: {
            userId: randomUser.id,
            signalId: signal.id,
            content: comments[Math.floor(Math.random() * comments.length)],
            isAdmin: false
          }
        })
      }

      // Update signal comment count
      await prisma.signal.update({
        where: { id: signal.id },
        data: { comments: commentsCount }
      })
    }

    // Resource likes
    for (const resource of createdResources) {
      const likesCount = Math.floor(Math.random() * 10) + 2
      for (let i = 0; i < likesCount; i++) {
        const randomUser = studentUsers[Math.floor(Math.random() * studentUsers.length)]
        try {
          await prisma.userResourceLike.create({
            data: {
              userId: randomUser.id,
              resourceId: resource.id
            }
          })
        } catch (error) {
          // Skip if already liked
        }
      }

      // Update resource like count
      await prisma.resource.update({
        where: { id: resource.id },
        data: { likes: likesCount }
      })
    }

    // 9. Create some orders for revenue tracking
    console.log('💰 Creating orders...')
    for (const user of studentUsers) {
      const ordersCount = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < ordersCount; i++) {
        await prisma.order.create({
          data: {
            userId: user.id,
            amount: Math.floor(Math.random() * 500) + 50,
            currency: 'USD',
            status: 'COMPLETED'
          }
        })
      }
    }

    // 10. Create some forecasts
    console.log('🔮 Creating forecasts...')
    const forecastTitles = [
      'EUR/USD Bullish Breakout Expected',
      'GBP/USD Consolidation Pattern',
      'USD/JPY Resistance Test',
      'Gold Support Level Analysis',
      'Bitcoin Volatility Forecast'
    ]

    for (let i = 0; i < 5; i++) {
      const randomUser = studentUsers[Math.floor(Math.random() * studentUsers.length)]
      const forecast = await prisma.forecast.create({
        data: {
          title: forecastTitles[i],
          description: `Detailed analysis and forecast for ${forecastTitles[i].split(' ')[0]}. This forecast is based on technical analysis and market sentiment.`,
          pair: forecastTitles[i].split(' ')[0],
          isPublic: Math.random() > 0.3
        }
      })

      // Add likes to forecasts
      const likesCount = Math.floor(Math.random() * 8) + 2
      for (let j = 0; j < likesCount; j++) {
        const randomLiker = studentUsers[Math.floor(Math.random() * studentUsers.length)]
        try {
          await prisma.userForecastLike.create({
            data: {
              userId: randomLiker.id,
              forecastId: forecast.id
            }
          })
        } catch (error) {
          // Skip if already liked
        }
      }

      // Add comments to forecasts
      const commentsCount = Math.floor(Math.random() * 5) + 1
      for (let j = 0; j < commentsCount; j++) {
        const randomCommenter = studentUsers[Math.floor(Math.random() * studentUsers.length)]
        const comments = [
          'Great analysis!',
          'I agree with this forecast.',
          'Thanks for sharing your insights.',
          'Very detailed analysis.',
          'This makes sense given current market conditions.'
        ]
        await prisma.userForecastComment.create({
          data: {
            userId: randomCommenter.id,
            forecastId: forecast.id,
            content: comments[Math.floor(Math.random() * comments.length)],
            isAdmin: false
          }
        })
      }

      // Update forecast like count
      await prisma.forecast.update({
        where: { id: forecast.id },
        data: { likes: likesCount }
      })
    }

    console.log('\n🎉 Sample data creation completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`👥 Users created: ${createdUsers.length}`)
    console.log(`📅 Events created: ${createdEvents.length}`)
    console.log(`🎓 Academy classes created: ${createdClasses.length}`)
    console.log(`📊 Signals created: ${createdSignals.length}`)
    console.log(`📚 Courses created: ${createdCourses.length}`)
    console.log(`📄 Resources created: ${createdResources.length}`)
    console.log(`❓ Enquiries created: ${sampleEnquiries.length}`)
    console.log(`🔮 Forecasts created: 5`)
    
    console.log('\n🔑 Admin Login Credentials:')
    console.log('Super Admin: admin@corefx.com / admin123')
    console.log('Analyst: analyst@corefx.com / analyst123')
    console.log('Editor: editor@corefx.com / editor123')
    
    console.log('\n👤 Sample User Credentials:')
    console.log('John Trader: john.trader@email.com / password123')
    console.log('Sarah Investor: sarah.investor@email.com / password123')
    console.log('Mike Day Trader: mike.daytrader@email.com / password123')
    console.log('Lisa Forex: lisa.forex@email.com / password123')
    console.log('David Premium: david.premium@email.com / password123')

  } catch (error) {
    console.error('❌ Error creating sample data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  createSampleData()
    .then(() => {
      console.log('✅ Sample data creation completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Sample data creation failed:', error)
      process.exit(1)
    })
}

module.exports = { createSampleData }
