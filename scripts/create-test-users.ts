import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('Creating test users...')

    // Create Basic User (STUDENT role)
    const basicUser = await prisma.user.upsert({
      where: { email: 'basic@test.com' },
      update: {},
      create: {
        email: 'basic@test.com',
        name: 'Basic User',
        password: await bcrypt.hash('password123', 10),
        role: 'STUDENT',
      }
    })

    // Create Signals User (SIGNALS role)
    const signalsUser = await prisma.user.upsert({
      where: { email: 'signals@test.com' },
      update: {},
      create: {
        email: 'signals@test.com',
        name: 'Signals User',
        password: await bcrypt.hash('password123', 10),
        role: 'SIGNALS',
      }
    })

    // Create Premium User (PREMIUM role)
    const premiumUser = await prisma.user.upsert({
      where: { email: 'premium@test.com' },
      update: {},
      create: {
        email: 'premium@test.com',
        name: 'Premium User',
        password: await bcrypt.hash('password123', 10),
        role: 'PREMIUM',
      }
    })

    // Create signals subscription for signals user
    await prisma.subscription.create({
      data: {
        userId: signalsUser.id,
        status: 'ACTIVE',
        plan: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    console.log('Test users created successfully:')
    console.log('Basic User:', basicUser.email, '- Role:', basicUser.role)
    console.log('Signals User:', signalsUser.email, '- Role:', signalsUser.role)
    console.log('Premium User:', premiumUser.email, '- Role:', premiumUser.role)

    console.log('\nTest Access Scenarios:')
    console.log('1. Basic User (STUDENT):')
    console.log('   - Free resources: ✅')
    console.log('   - Premium resources: ❌ (must pay individually)')
    console.log('   - Premium signals: ❌ (must subscribe)')
    console.log('   - Premium courses: ❌ (must pay individually)')

    console.log('\n2. Signals User (SIGNALS):')
    console.log('   - Free resources: ✅')
    console.log('   - Premium resources: ❌ (must pay individually)')
    console.log('   - Premium signals: ✅')
    console.log('   - Premium courses: ❌ (must pay individually)')

    console.log('\n3. Premium User (PREMIUM):')
    console.log('   - Free resources: ✅')
    console.log('   - Premium resources: ✅')
    console.log('   - Premium signals: ✅')
    console.log('   - Premium courses: ❌ (still must pay individually)')

  } catch (error) {
    console.error('Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()
