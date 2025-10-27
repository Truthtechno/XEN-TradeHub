#!/usr/bin/env node

/**
 * Setup script for verification flow testing
 * Creates test user with admin role and broker link
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupVerificationTest() {
  console.log('🚀 Setting up verification flow test environment...');

  try {
    // Create test user with admin role
    console.log('📝 Creating test user with admin role...');
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        role: 'ADMIN',
        name: 'Test Admin User'
      },
      create: {
        email: 'test@example.com',
        name: 'Test Admin User',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'ADMIN'
      }
    });
    console.log('✅ Test user created/updated:', testUser.email);

    // Create broker link
    console.log('🔗 Creating broker link...');
    let brokerLink = await prisma.brokerLink.findFirst({
      where: { name: 'EXNESS Default Link' }
    });
    
    if (!brokerLink) {
      brokerLink = await prisma.brokerLink.create({
        data: {
          name: 'EXNESS Default Link',
          url: 'https://one.exness.com/a/your-referral-link',
          isActive: true
        }
      });
    } else {
      brokerLink = await prisma.brokerLink.update({
        where: { id: brokerLink.id },
        data: {
          url: 'https://one.exness.com/a/your-referral-link',
          isActive: true
        }
      });
    }
    console.log('✅ Broker link created/updated:', brokerLink.name);

    // Create a test broker registration
    console.log('📋 Creating test broker registration...');
    let testRegistration = await prisma.brokerRegistration.findFirst({
      where: {
        userId: testUser.id,
        linkId: brokerLink.id
      }
    });
    
    if (!testRegistration) {
      testRegistration = await prisma.brokerRegistration.create({
        data: {
          userId: testUser.id,
          linkId: brokerLink.id,
          verified: false,
          verificationData: null
        }
      });
    } else {
      testRegistration = await prisma.brokerRegistration.update({
        where: { id: testRegistration.id },
        data: {
          verified: false,
          verificationData: null
        }
      });
    }
    console.log('✅ Test registration created/updated:', testRegistration.id);

    console.log('\n🎉 Setup complete! You can now run the verification flow test.');
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password');
    console.log('Role: ADMIN');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupVerificationTest()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = setupVerificationTest;
