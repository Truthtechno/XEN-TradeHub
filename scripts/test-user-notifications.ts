import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUserNotifications() {
  try {
    console.log('🔍 Testing user notifications...\n');

    // Get a student user
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: { id: true, email: true, role: true }
    });

    if (!student) {
      console.log('❌ No student user found');
      return;
    }

    console.log(`👤 Testing with user: ${student.email} (${student.role})`);

    // Check existing notifications for this user
    const existingNotifications = await prisma.notification.findMany({
      where: { userId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`\n📊 Existing notifications for ${student.email}: ${existingNotifications.length}`);
    existingNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} | Type: ${notif.type} | Read: ${notif.isRead} | Created: ${notif.createdAt.toISOString()}`);
    });

    // Create some test notifications for this specific user
    console.log('\n➕ Creating test notifications...');
    
    const testNotifications = [
      {
        userId: student.id,
        title: 'Welcome to TRUST Forex!',
        message: 'Welcome to our trading platform. Start your journey to financial success!',
        type: 'WELCOME' as const,
        actionUrl: '/dashboard',
        isRead: false
      },
      {
        userId: student.id,
        title: 'New Course Available!',
        message: 'Check out our latest course: "Advanced Trading Strategies" - Expert level',
        type: 'COURSE' as const,
        actionUrl: '/courses',
        isRead: false
      },
      {
        userId: student.id,
        title: 'New Resource Added!',
        message: 'A new video "Market Analysis Report - October 2025" has been added to resources.',
        type: 'UPDATE' as const,
        actionUrl: '/resources',
        isRead: false
      }
    ];

    const createdNotifications = await prisma.notification.createMany({
      data: testNotifications
    });

    console.log(`✅ Created ${createdNotifications.count} test notifications`);

    // Verify the notifications were created
    const updatedNotifications = await prisma.notification.findMany({
      where: { userId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`\n📊 Updated notifications for ${student.email}: ${updatedNotifications.length}`);
    updatedNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} | Type: ${notif.type} | Read: ${notif.isRead} | Created: ${notif.createdAt.toISOString()}`);
    });

    // Test the API endpoint
    console.log('\n🌐 Testing API endpoint...');
    console.log(`API URL: http://localhost:3000/api/notifications`);
    console.log(`User ID: ${student.id}`);
    console.log(`User Email: ${student.email}`);

    console.log('\n📝 To test in browser:');
    console.log('1. Login with email:', student.email);
    console.log('2. Visit: http://localhost:3000/notifications');
    console.log('3. Check the right notification panel');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserNotifications();
