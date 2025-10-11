import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAccessControl() {
  try {
    console.log('Testing Access Control System...\n')

    // Get test users
    const basicUser = await prisma.user.findUnique({
      where: { email: 'basic@test.com' }
    })

    const signalsUser = await prisma.user.findUnique({
      where: { email: 'signals@test.com' }
    })

    const premiumUser = await prisma.user.findUnique({
      where: { email: 'premium@test.com' }
    })

    if (!basicUser || !signalsUser || !premiumUser) {
      console.error('Test users not found. Please run create-test-users.ts first.')
      return
    }

    console.log('Test Users:')
    console.log(`1. Basic User: ${basicUser.email} (${basicUser.role})`)
    console.log(`2. Signals User: ${signalsUser.email} (${signalsUser.role})`)
    console.log(`3. Premium User: ${premiumUser.email} (${premiumUser.role})`)
    console.log('')

    // Test resource access
    console.log('Testing Resource Access:')
    console.log('=======================')
    
    // Simulate resource access checks
    const testResource = {
      id: 'test-resource-1',
      title: 'Premium Trading Guide',
      isPremium: true,
      priceUSD: 25.00
    }

    console.log(`Resource: ${testResource.title} (Premium: $${testResource.priceUSD})`)
    console.log('')

    // Basic User access
    console.log('1. Basic User Access:')
    console.log(`   Role: ${basicUser.role}`)
    console.log(`   Has Mentorship: false`)
    console.log(`   Expected: ❌ No access (must pay individually)`)
    console.log('')

    // Signals User access
    console.log('2. Signals User Access:')
    console.log(`   Role: ${signalsUser.role}`)
    console.log(`   Has Mentorship: false`)
    console.log(`   Expected: ❌ No access (signals subscription doesn't grant resource access)`)
    console.log('')

    // Premium User access
    console.log('3. Premium User Access:')
    console.log(`   Role: ${premiumUser.role}`)
    console.log(`   Has Mentorship: true`)
    console.log(`   Expected: ✅ Full access (premium role grants resource access)`)
    console.log('')

    // Test signals access
    console.log('Testing Signals Access:')
    console.log('======================')
    
    const testSignal = {
      id: 'test-signal-1',
      title: 'Premium EUR/USD Signal',
      isPremium: true
    }

    console.log(`Signal: ${testSignal.title} (Premium)`)
    console.log('')

    console.log('1. Basic User:')
    console.log(`   Expected: ❌ No access (must subscribe to signals)`)
    console.log('')

    console.log('2. Signals User:')
    console.log(`   Expected: ✅ Access (signals subscription active)`)
    console.log('')

    console.log('3. Premium User:')
    console.log(`   Expected: ✅ Access (premium role grants signal access)`)
    console.log('')

    // Test course access
    console.log('Testing Course Access:')
    console.log('======================')
    
    const testCourse = {
      id: 'test-course-1',
      title: 'Advanced Trading Course',
      isPremium: true,
      priceUSD: 199.00
    }

    console.log(`Course: ${testCourse.title} (Premium: $${testCourse.priceUSD})`)
    console.log('')

    console.log('1. Basic User:')
    console.log(`   Expected: ❌ No access (must pay individually)`)
    console.log('')

    console.log('2. Signals User:')
    console.log(`   Expected: ❌ No access (signals subscription doesn't grant course access)`)
    console.log('')

    console.log('3. Premium User:')
    console.log(`   Expected: ❌ No access (even premium users must pay for courses)`)
    console.log('')

    console.log('Access Control Summary:')
    console.log('======================')
    console.log('✅ = Has Access')
    console.log('❌ = No Access (Must Pay)')
    console.log('')
    console.log('| User Type | Free Resources | Premium Resources | Premium Signals | Premium Courses |')
    console.log('|-----------|----------------|-------------------|------------------|-----------------|')
    console.log('| Basic     | ✅             | ❌                | ❌               | ❌              |')
    console.log('| Signals   | ✅             | ❌                | ✅               | ❌              |')
    console.log('| Premium   | ✅             | ✅                | ✅               | ❌              |')
    console.log('')
    console.log('Note: Even Premium users must pay for premium courses individually!')

  } catch (error) {
    console.error('Error testing access control:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAccessControl()
