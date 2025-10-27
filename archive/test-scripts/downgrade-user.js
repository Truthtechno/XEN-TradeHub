const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function downgradeUser() {
  console.log('Downgrading user to STUDENT role...');
  
  try {
    const userId = 'cmghmthy700008ccp2v3deaiv';
    
    // Update user role to STUDENT
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'STUDENT' }
    });
    
    console.log('✅ User downgraded to STUDENT role');
    
    // Check if user has any premium subscriptions and delete them
    await prisma.subscription.deleteMany({
      where: { userId: userId }
    });
    
    console.log('✅ Premium subscriptions removed');
    
    // Check if user has any mentorship payments and delete them
    await prisma.mentorshipPayment.deleteMany({
      where: { userId: userId }
    });
    
    console.log('✅ Mentorship payments removed');
    
    console.log('🎉 User successfully downgraded to STUDENT');
    
  } catch (error) {
    console.error('Error downgrading user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

downgradeUser();
