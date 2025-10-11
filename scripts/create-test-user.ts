import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...\n');

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create or update test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: hashedPassword,
        role: 'STUDENT'
      },
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        name: 'Test User'
      }
    });

    console.log('✅ Test user created/updated:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: password123`);
    console.log(`   Role: ${testUser.role}`);
    console.log(`   ID: ${testUser.id}`);

    // Create some test notifications for this user
    console.log('\n📝 Creating test notifications...');
    
    const testNotifications = [
      {
        userId: testUser.id,
        title: 'Welcome to TRUST Forex!',
        message: 'Welcome to our trading platform. Start your journey to financial success!',
        type: 'WELCOME' as const,
        actionUrl: '/dashboard',
        isRead: false
      },
      {
        userId: testUser.id,
        title: 'New Course Available!',
        message: 'Check out our latest course: "Advanced Trading Strategies" - Expert level',
        type: 'COURSE' as const,
        actionUrl: '/courses',
        isRead: false
      },
      {
        userId: testUser.id,
        title: 'New Resource Added!',
        message: 'A new video "Market Analysis Report - October 2025" has been added to resources.',
        type: 'UPDATE' as const,
        actionUrl: '/resources',
        isRead: false
      },
      {
        userId: testUser.id,
        title: 'System Update',
        message: 'We have updated our platform with new features and improvements.',
        type: 'SYSTEM' as const,
        actionUrl: '/dashboard',
        isRead: true
      },
      {
        userId: testUser.id,
        title: 'Premium Subscription Available',
        message: 'Upgrade to premium for access to exclusive content and features.',
        type: 'PROMOTION' as const,
        actionUrl: '/pricing',
        isRead: false
      }
    ];

    // Delete existing notifications for this user first
    await prisma.notification.deleteMany({
      where: { userId: testUser.id }
    });

    const createdNotifications = await prisma.notification.createMany({
      data: testNotifications
    });

    console.log(`✅ Created ${createdNotifications.count} test notifications`);

    // Verify the notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📊 Notifications for ${testUser.email}: ${notifications.length}`);
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} | Type: ${notif.type} | Read: ${notif.isRead}`);
    });

    console.log('\n🌐 Ready to test!');
    console.log('1. Go to: http://localhost:3000/auth/signin');
    console.log('2. Login with email: test@example.com');
    console.log('3. Use password: password123');
    console.log('4. After login, visit: http://localhost:3000/notifications');
    console.log('5. Check the right notification panel');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
