#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function checkSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking BrokerRegistration model...');
    
    // Try to query the model to see what fields are available
    const registrations = await prisma.brokerRegistration.findMany({
      take: 1,
      select: {
        id: true,
        userId: true,
        linkId: true,
        createdAt: true,
        updatedAt: true,
        verified: true,
        verifiedAt: true,
        verificationData: true
      }
    });
    
    console.log('✅ All fields are accessible:', registrations);
    
    // Try to update a registration to test the fields
    if (registrations.length > 0) {
      const testUpdate = await prisma.brokerRegistration.update({
        where: { id: registrations[0].id },
        data: {
          verified: true,
          verifiedAt: new Date(),
          verificationData: { test: 'data' }
        }
      });
      
      console.log('✅ Update successful:', testUpdate);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Try to get the model info
    try {
      const modelInfo = await prisma.brokerRegistration.findMany({
        take: 1
      });
      console.log('Available fields in model:', Object.keys(modelInfo[0] || {}));
    } catch (e) {
      console.error('Could not query model:', e.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
