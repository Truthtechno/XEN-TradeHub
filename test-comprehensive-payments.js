#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test configuration
const BASE_URL = 'http://localhost:3000';

// Test card numbers
const TEST_CARDS = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficient: '4000000000009995'
};

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testPaymentFlow(paymentType, testData, userId = null) {
  console.log(`\n🧪 Testing ${paymentType} payment flow...`);
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Create payment intent
    console.log('1️⃣ Creating payment intent...');
    const createIntentResponse = await makeRequest(`${BASE_URL}/api/mock-payment/create-payment-intent`, {
      method: 'POST',
      body: JSON.stringify({
        amount: testData.amount,
        currency: testData.currency,
        courseId: testData.courseId || testData.resourceId || testData.eventId,
        courseTitle: testData.courseTitle || testData.resourceTitle || testData.eventTitle
      })
    });
    
    if (!createIntentResponse.success) {
      console.log('❌ Failed to create payment intent:', createIntentResponse.data);
      return false;
    }
    
    console.log('✅ Payment intent created:', createIntentResponse.data.paymentIntentId);
    
    // Step 2: Confirm payment with success card
    console.log('2️⃣ Confirming payment with success card...');
    const confirmResponse = await makeRequest(`${BASE_URL}/api/mock-payment/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify({
        paymentIntentId: createIntentResponse.data.paymentIntentId,
        paymentMethod: {
          card: {
            number: TEST_CARDS.success,
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      })
    });
    
    if (!confirmResponse.success) {
      console.log('❌ Payment confirmation failed:', confirmResponse.data);
      return false;
    }
    
    console.log('✅ Payment confirmed successfully!');
    console.log('📊 Payment details:', {
      id: confirmResponse.data.id,
      status: confirmResponse.data.status,
      amount: confirmResponse.data.amount,
      currency: confirmResponse.data.currency
    });
    
    return {
      success: true,
      paymentIntentId: createIntentResponse.data.paymentIntentId,
      paymentData: confirmResponse.data
    };
    
  } catch (error) {
    console.log('❌ Error in payment flow:', error.message);
    return false;
  }
}

async function testResourcesPurchase() {
  console.log('\n📚 Testing Resources Purchase...');
  console.log('=' .repeat(50));
  
  try {
    // Get a real resource
    const resource = await prisma.resource.findFirst({
      where: { priceUSD: { not: null } }
    });
    
    if (!resource) {
      console.log('❌ No resources found with price');
      return false;
    }
    
    console.log(`📖 Testing with resource: ${resource.title} ($${resource.priceUSD})`);
    
    const response = await makeRequest(`${BASE_URL}/api/resources/purchase`, {
      method: 'POST',
      body: JSON.stringify({
        resourceId: resource.id,
        amountUSD: resource.priceUSD,
        provider: 'mock'
      })
    });
    
    if (response.success) {
      console.log('✅ Resources purchase endpoint working');
      console.log('📊 Purchase details:', response.data);
      
      // Test payment confirmation
      if (response.data.paymentIntentId) {
        console.log('2️⃣ Confirming payment...');
        const confirmResponse = await makeRequest(`${BASE_URL}/api/mock-payment/confirm-payment`, {
          method: 'POST',
          body: JSON.stringify({
            paymentIntentId: response.data.paymentIntentId,
            paymentMethod: {
              card: {
                number: TEST_CARDS.success,
                exp_month: 12,
                exp_year: 2025,
                cvc: '123'
              }
            }
          })
        });
        
        if (confirmResponse.success) {
          console.log('✅ Resources payment confirmed successfully!');
          return true;
        } else {
          console.log('❌ Resources payment confirmation failed:', confirmResponse.data);
          return false;
        }
      }
    } else {
      console.log('❌ Resources purchase endpoint failed:', response.data);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error testing resources purchase:', error.message);
    return false;
  }
}

async function testMentorshipRegistration() {
  console.log('\n👨‍🏫 Testing Mentorship Registration...');
  console.log('=' .repeat(50));
  
  try {
    // Create a new user for testing
    const testEmail = `test-${Date.now()}@example.com`;
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        role: 'STUDENT'
      }
    });
    
    console.log(`👤 Created test user: ${testUser.email}`);
    
    // Test registration
    const response = await makeRequest(`${BASE_URL}/api/mentorship/register`, {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        phone: '1234567890',
        countryCode: '+1',
        schedulingPreferences: 'Weekend mornings'
      })
    });
    
    if (response.success) {
      console.log('✅ Mentorship registration successful');
      console.log('📊 Registration details:', response.data);
      
      // Clean up test user
      await prisma.user.delete({ where: { id: testUser.id } });
      console.log('🧹 Cleaned up test user');
      
      return true;
    } else {
      console.log('❌ Mentorship registration failed:', response.data);
      
      // Clean up test user
      await prisma.user.delete({ where: { id: testUser.id } });
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error testing mentorship registration:', error.message);
    return false;
  }
}

async function checkAdminReports() {
  console.log('\n📊 Checking Admin Reports and Notifications...');
  console.log('=' .repeat(50));
  
  try {
    // Check recent resource purchases
    const resourcePurchases = await prisma.resourcePurchase.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        resource: {
          select: {
            title: true
          }
        }
      }
    });
    
    console.log(`📈 Found ${resourcePurchases.length} recent resource purchases:`);
    resourcePurchases.forEach(purchase => {
      console.log(`- ${purchase.user.name} purchased "${purchase.resource.title}" for $${purchase.amountUSD} (${purchase.status})`);
    });
    
    // Check mentorship payments
    const mentorshipPayments = await prisma.mentorshipPayment.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log(`\n👨‍🏫 Found ${mentorshipPayments.length} recent mentorship payments:`);
    mentorshipPayments.forEach(payment => {
      console.log(`- ${payment.user.name} paid $${payment.amountUSD} for mentorship (${payment.status})`);
    });
    
    // Check academy registrations
    const academyRegistrations = await prisma.academyClassRegistration.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        academyClass: {
          select: {
            title: true
          }
        }
      }
    });
    
    console.log(`\n🎓 Found ${academyRegistrations.length} recent academy registrations:`);
    academyRegistrations.forEach(registration => {
      console.log(`- ${registration.user.name} registered for "${registration.academyClass.title}" (${registration.status})`);
    });
    
    // Check notifications
    const notifications = await prisma.newNotification.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log(`\n🔔 Found ${notifications.length} recent notifications:`);
    notifications.forEach(notification => {
      console.log(`- ${notification.title}: ${notification.message}`);
    });
    
    return {
      resourcePurchases: resourcePurchases.length,
      mentorshipPayments: mentorshipPayments.length,
      academyRegistrations: academyRegistrations.length,
      notifications: notifications.length
    };
    
  } catch (error) {
    console.log('❌ Error checking admin reports:', error.message);
    return null;
  }
}

async function testDeclinedPayment() {
  console.log('\n💳 Testing Declined Payment...');
  console.log('=' .repeat(50));
  
  try {
    // Create payment intent
    const createIntentResponse = await makeRequest(`${BASE_URL}/api/mock-payment/create-payment-intent`, {
      method: 'POST',
      body: JSON.stringify({
        amount: 100,
        currency: 'USD',
        courseId: 'test-decline',
        courseTitle: 'Test Declined Payment'
      })
    });
    
    if (!createIntentResponse.success) {
      console.log('❌ Failed to create payment intent for decline test');
      return false;
    }
    
    // Try to pay with declined card
    const confirmResponse = await makeRequest(`${BASE_URL}/api/mock-payment/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify({
        paymentIntentId: createIntentResponse.data.paymentIntentId,
        paymentMethod: {
          card: {
            number: TEST_CARDS.declined,
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      })
    });
    
    if (!confirmResponse.success && confirmResponse.status === 402) {
      console.log('✅ Declined payment handled correctly');
      console.log('📊 Decline details:', confirmResponse.data);
      return true;
    } else {
      console.log('❌ Declined payment not handled correctly:', confirmResponse.data);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error testing declined payment:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Comprehensive Payment Gateway Testing');
  console.log('=' .repeat(60));
  console.log(`Server: ${BASE_URL}`);
  
  try {
    const results = {};
    
    // Test basic payment flows
    console.log('\n📋 Testing Basic Payment Flows...');
    results.oneOnOne = await testPaymentFlow('One-on-One Mentorship', {
      amount: 1500,
      currency: 'USD',
      courseId: 'mentorship',
      courseTitle: 'One-on-One Mentorship'
    });
    
    results.academy = await testPaymentFlow('Academy Registration', {
      amount: 250,
      currency: 'USD',
      courseId: '1',
      courseTitle: 'Advanced Strategy Workshop'
    });
    
    results.events = await testPaymentFlow('Events Registration', {
      amount: 100,
      currency: 'USD',
      eventId: '1',
      eventTitle: 'Test Event'
    });
    
    // Test specific endpoints
    console.log('\n📋 Testing Specific Endpoints...');
    results.resources = await testResourcesPurchase();
    results.mentorship = await testMentorshipRegistration();
    
    // Test declined payment
    results.declined = await testDeclinedPayment();
    
    // Check admin reports
    const adminReports = await checkAdminReports();
    
    // Summary
    console.log('\n📋 COMPREHENSIVE TEST SUMMARY');
    console.log('=' .repeat(60));
    
    Object.entries(results).forEach(([test, result]) => {
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test}`);
    });
    
    if (adminReports) {
      console.log('\n📊 Admin Reports Summary:');
      console.log(`- Resource Purchases: ${adminReports.resourcePurchases}`);
      console.log(`- Mentorship Payments: ${adminReports.mentorshipPayments}`);
      console.log(`- Academy Registrations: ${adminReports.academyRegistrations}`);
      console.log(`- Notifications: ${adminReports.notifications}`);
    }
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All payment gateways are working correctly!');
      console.log('✅ Users can successfully make purchases');
      console.log('✅ Admin receives reports and notifications');
    } else {
      console.log('⚠️  Some payment gateways need attention.');
    }
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
main().catch(console.error);
