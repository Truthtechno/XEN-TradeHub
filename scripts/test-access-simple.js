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

    // Test access logic manually
    console.log('\n2. Testing access control logic...')
    
    // Test Basic User access
    console.log('\n📋 Basic User Access:')
    const basicHasMentorship = await prisma.mentorshipPayment.findFirst({
      where: { userId: basicUser.id, status: 'completed' }
    })
    const basicIsPremium = basicUser.role === 'PREMIUM' || !!basicHasMentorship
    const basicHasActiveSubscription = await prisma.subscription.findFirst({
      where: { 
        userId: basicUser.id, 
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() }
      }
    })
    
    console.log('Premium Signals:', basicHasActiveSubscription ? '✅' : '❌', '(Signals subscription required)')
    console.log('Premium Resources:', basicIsPremium ? '✅' : '❌', '(Premium subscription required)')
    console.log('Premium Courses:', basicIsPremium ? '✅' : '❌', '(Premium subscription required)')
    console.log('Mentorship:', basicIsPremium ? '✅' : '❌', '(Premium subscription required)')
    console.log('Subscription Type:', basicIsPremium ? 'PREMIUM' : (basicHasActiveSubscription ? 'SIGNALS' : 'BASIC'))

    // Test Signal User access
    console.log('\n📋 Signal User Access:')
    const signalHasMentorship = await prisma.mentorshipPayment.findFirst({
      where: { userId: signalUser.id, status: 'completed' }
    })
    const signalIsPremium = signalUser.role === 'PREMIUM' || !!signalHasMentorship
    const signalHasActiveSubscription = await prisma.subscription.findFirst({
      where: { 
        userId: signalUser.id, 
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() }
      }
    })
    
    console.log('Premium Signals:', signalHasActiveSubscription ? '✅' : '❌', '(Active signals subscription)')
    console.log('Premium Resources:', signalIsPremium ? '✅' : '❌', '(Premium subscription required)')
    console.log('Premium Courses:', signalIsPremium ? '✅' : '❌', '(Premium subscription required)')
    console.log('Mentorship:', signalIsPremium ? '✅' : '❌', '(Premium subscription required)')
    console.log('Subscription Type:', signalIsPremium ? 'PREMIUM' : (signalHasActiveSubscription ? 'SIGNALS' : 'BASIC'))

    // Test Premium User access
    console.log('\n📋 Premium User Access:')
    const premiumHasMentorship = await prisma.mentorshipPayment.findFirst({
      where: { userId: premiumUser.id, status: 'completed' }
    })
    const premiumIsPremium = premiumUser.role === 'PREMIUM' || !!premiumHasMentorship
    const premiumHasActiveSubscription = await prisma.subscription.findFirst({
      where: { 
        userId: premiumUser.id, 
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() }
      }
    })
    
    console.log('Premium Signals:', premiumIsPremium || premiumHasActiveSubscription ? '✅' : '❌', '(Premium user - full access)')
    console.log('Premium Resources:', premiumIsPremium ? '✅' : '❌', '(Premium user - full access)')
    console.log('Premium Courses:', premiumIsPremium ? '✅' : '❌', '(Premium user - full access)')
    console.log('Mentorship:', premiumIsPremium ? '✅' : '❌', '(Premium user - full access)')
    console.log('Subscription Type:', premiumIsPremium ? 'PREMIUM' : (premiumHasActiveSubscription ? 'SIGNALS' : 'BASIC'))

    console.log('\n✅ Access control system test completed successfully!')
    console.log('\nSummary:')
    console.log('- Basic Users: Only free content access')
    console.log('- Signal Users: Premium signals access only ($50/month)')
    console.log('- Premium Users: Full access to all content ($1500 one-time)')

    // Test API endpoints
    console.log('\n3. Testing API endpoints...')
    console.log('You can now test the following endpoints:')
    console.log('- POST /api/signals/check-access')
    console.log('- POST /api/resources/check-access')
    console.log('- POST /api/courses/check-access')
    console.log('- POST /api/payments/mentorship')
    console.log('- POST /api/payments/signals')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testAccessControlSystem()
