import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 Testing login and notifications...\n');

    // Get a student user
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: { id: true, email: true, role: true, password: true }
    });

    if (!student) {
      console.log('❌ No student user found');
      return;
    }

    console.log(`👤 Student user found:`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Role: ${student.role}`);
    console.log(`   ID: ${student.id}`);

    // Check notifications for this user
    const notifications = await prisma.notification.findMany({
      where: { userId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`\n📊 Notifications for ${student.email}: ${notifications.length}`);
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} | Type: ${notif.type} | Read: ${notif.isRead}`);
    });

    console.log('\n🌐 To test notifications:');
    console.log('1. Go to: http://localhost:3000/auth/signin');
    console.log(`2. Login with email: ${student.email}`);
    console.log('3. Use password: password123 (or check the database for the actual password)');
    console.log('4. After login, visit: http://localhost:3000/notifications');
    console.log('5. Check the right notification panel');

    // Also check if there are any users with simple passwords
    const simpleUsers = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        password: 'password123'
      },
      select: { email: true, password: true }
    });

    if (simpleUsers.length > 0) {
      console.log('\n🔑 Users with simple password (password123):');
      simpleUsers.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
