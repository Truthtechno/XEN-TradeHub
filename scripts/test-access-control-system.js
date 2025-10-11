const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAccessControlSystem() {
  console.log('🧪 Testing CoreFX Access Control System')
  console.log('=====================================\n')

  try {
    // Create test users
    console.log('1. Creating test users...')
    
    // Basic User (STUDENT role)
    const basicUser = await prisma.user.upsert({
      where: { email: 'basic@test.com' },
      update: {},
      create: {
        email: 'basic@test.com',
        name: 'Basic User',
        role: 'STUDENT',
        password: '$2a$12$test'
      }
    })
    console.log('✅ Basic User created:', basicUser.email)

    // Signal User (SIGNALS role with active subscription)
    const signalUser = await prisma.user.upsert({
      where: { email: 'signal@test.com' },
      update: {},
      create: {
        email: 'signal@test.com',
        name: 'Signal User',
        role: 'SIGNALS',
        password: '$2a$12$test'
      }
    })

    // Create signals subscription for signal user
    const signalSubscription = await prisma.subscription.upsert({
      where: { userId: signalUser.id },
      update: {},
      create: {
        userId: signalUser.id,
        plan: 'MONTHLY',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    })
    console.log('✅ Signal User created with subscription:', signalUser.email)

    // Premium User (PREMIUM role with mentorship payment)
    const premiumUser = await prisma.user.upsert({
      where: { email: 'premium@test.com' },
      update: {},
      create: {
        email: 'premium@test.com',
        name: 'Premium User',
        role: 'PREMIUM',
        password: '$2a$12$test'
      }
    })

    // Create mentorship payment for premium user
    const mentorshipPayment = await prisma.mentorshipPayment.upsert({
      where: { id: `mentorship-${premiumUser.id}` },
      update: {},
      create: {
        id: `mentorship-${premiumUser.id}`,
        userId: premiumUser.id,
        amount: 1500,
        currency: 'USD',
        status: 'completed'
      }
    })
    console.log('✅ Premium User created with mentorship payment:', premiumUser.email)

    // Create test resources
    console.log('\n2. Creating test resources...')
    
    const freeResource = await prisma.resource.upsert({
      where: { slug: 'free-resource' },
      update: {},
      create: {
        title: 'Free Resource',
        slug: 'free-resource',
        description: 'A free resource for all users',
        type: 'PDF',
        isPremium: false,
        url: 'https://example.com/free.pdf'
      }
    })

    const premiumResource = await prisma.resource.upsert({
      where: { slug: 'premium-resource' },
      update: {},
      create: {
        title: 'Premium Resource',
        slug: 'premium-resource',
        description: 'A premium resource for premium users only',
        type: 'PDF',
        isPremium: true,
        priceUSD: 99.99,
        url: 'https://example.com/premium.pdf'
      }
    })
    console.log('✅ Test resources created')

    // Create test signals
    console.log('\n3. Creating test signals...')
    
    const premiumSignal = await prisma.signal.upsert({
      where: { id: 'test-signal-1' },
      update: {},
      create: {
        id: 'test-signal-1',
        title: 'Premium Signal',
        description: 'A premium trading signal',
        symbol: 'EURUSD',
        action: 'BUY',
        entryPrice: 1.1000,
        stopLoss: 1.0950,
        takeProfit: 1.1100,
        visibility: 'PREMIUM'
      }
    })
    console.log('✅ Test signals created')

    // Test access control
    console.log('\n4. Testing access control...')
    
    // Import the access control service
    const { accessControl } = require('../lib/access-control.ts')

    // Test Basic User access
    console.log('\n📋 Basic User Access:')
    const basicAccess = await accessControl.getUserAccess(basicUser.id)
    console.log('Premium Signals:', basicAccess.premiumSignals ? '✅' : '❌')
    console.log('Premium Resources:', basicAccess.premiumResources ? '✅' : '❌')
    console.log('Premium Courses:', basicAccess.premiumCourses ? '✅' : '❌')
    console.log('Mentorship:', basicAccess.mentorship ? '✅' : '❌')
    console.log('Subscription Type:', basicAccess.subscriptionType)

    // Test Signal User access
    console.log('\n📋 Signal User Access:')
    const signalAccess = await accessControl.getUserAccess(signalUser.id)
    console.log('Premium Signals:', signalAccess.premiumSignals ? '✅' : '❌')
    console.log('Premium Resources:', signalAccess.premiumResources ? '✅' : '❌')
    console.log('Premium Courses:', signalAccess.premiumCourses ? '✅' : '❌')
    console.log('Mentorship:', signalAccess.mentorship ? '✅' : '❌')
    console.log('Subscription Type:', signalAccess.subscriptionType)

    // Test Premium User access
    console.log('\n📋 Premium User Access:')
    const premiumAccess = await accessControl.getUserAccess(premiumUser.id)
    console.log('Premium Signals:', premiumAccess.premiumSignals ? '✅' : '❌')
    console.log('Premium Resources:', premiumAccess.premiumResources ? '✅' : '❌')
    console.log('Premium Courses:', premiumAccess.premiumCourses ? '✅' : '❌')
    console.log('Mentorship:', premiumAccess.mentorship ? '✅' : '❌')
    console.log('Subscription Type:', premiumAccess.subscriptionType)

    // Test specific resource access
    console.log('\n5. Testing specific resource access...')
    
    console.log('\n📋 Free Resource Access:')
    const freeResourceAccess = await accessControl.checkResourceAccess(basicUser.id, freeResource.id)
    console.log('Basic User:', freeResourceAccess.hasAccess ? '✅' : '❌')
    
    const signalFreeResourceAccess = await accessControl.checkResourceAccess(signalUser.id, freeResource.id)
    console.log('Signal User:', signalFreeResourceAccess.hasAccess ? '✅' : '❌')
    
    const premiumFreeResourceAccess = await accessControl.checkResourceAccess(premiumUser.id, freeResource.id)
    console.log('Premium User:', premiumFreeResourceAccess.hasAccess ? '✅' : '❌')

    console.log('\n📋 Premium Resource Access:')
    const basicPremiumResourceAccess = await accessControl.checkResourceAccess(basicUser.id, premiumResource.id)
    console.log('Basic User:', basicPremiumResourceAccess.hasAccess ? '✅' : '❌', `(${basicPremiumResourceAccess.reason})`)
    
    const signalPremiumResourceAccess = await accessControl.checkResourceAccess(signalUser.id, premiumResource.id)
    console.log('Signal User:', signalPremiumResourceAccess.hasAccess ? '✅' : '❌', `(${signalPremiumResourceAccess.reason})`)
    
    const premiumPremiumResourceAccess = await accessControl.checkResourceAccess(premiumUser.id, premiumResource.id)
    console.log('Premium User:', premiumPremiumResourceAccess.hasAccess ? '✅' : '❌', `(${premiumPremiumResourceAccess.reason})`)

    // Test signals access
    console.log('\n6. Testing signals access...')
    
    const basicSignalsAccess = await accessControl.checkSignalsAccess(basicUser.id)
    console.log('Basic User Signals:', basicSignalsAccess.hasAccess ? '✅' : '❌', `(${basicSignalsAccess.reason})`)
    
    const signalSignalsAccess = await accessControl.checkSignalsAccess(signalUser.id)
    console.log('Signal User Signals:', signalSignalsAccess.hasAccess ? '✅' : '❌', `(${signalSignalsAccess.reason})`)
    
    const premiumSignalsAccess = await accessControl.checkSignalsAccess(premiumUser.id)
    console.log('Premium User Signals:', premiumSignalsAccess.hasAccess ? '✅' : '❌', `(${premiumSignalsAccess.reason})`)

    console.log('\n✅ Access control system test completed successfully!')
    console.log('\nSummary:')
    console.log('- Basic Users: Only free content access')
    console.log('- Signal Users: Premium signals access only')
    console.log('- Premium Users: Full access to all content')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testAccessControlSystem()
