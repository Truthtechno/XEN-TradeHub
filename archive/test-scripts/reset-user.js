const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetUser() {
  console.log('Resetting user to STUDENT role...');
  
  try {
    const userId = 'cmghmthy700008ccp2v3deaiv';
    
    // Update user role to STUDENT
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'STUDENT' }
    });
    
    console.log('✅ User downgraded to STUDENT role');
    
    // Delete all subscriptions
    await prisma.subscription.deleteMany({
      where: { userId: userId }
    });
    
    console.log('✅ All subscriptions removed');
    
    // Delete all mentorship payments
    await prisma.mentorshipPayment.deleteMany({
      where: { userId: userId }
    });
    
    console.log('✅ All mentorship payments removed');
    
    // Delete all mentorship registrations
    await prisma.mentorshipRegistration.deleteMany({
      where: { userId: userId }
    });
    
    console.log('✅ All mentorship registrations removed');
    
    console.log('🎉 User completely reset to STUDENT');
    
  } catch (error) {
    console.error('Error resetting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUser();
