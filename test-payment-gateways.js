#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test configuration
const TEST_USER_EMAIL = 'demo@corefx.com';
const BASE_URL = 'http://localhost:3000';

// Test card numbers
const TEST_CARDS = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficient: '4000000000009995'
};

// Test data for different payment types
const TEST_DATA = {
  oneOnOne: {
    amount: 1500,
    currency: 'USD',
    courseId: 'mentorship',
    courseTitle: 'One-on-One Mentorship'
  },
  academy: {
    amount: 250,
    currency: 'USD',
    courseId: '1',
    courseTitle: 'Advanced Strategy Workshop'
  },
  resources: {
    amount: 50,
    currency: 'USD',
    resourceId: '1',
    resourceTitle: 'Test Resource'
  },
  events: {
    amount: 100,
    currency: 'USD',
    eventId: '1',
    eventTitle: 'Test Event'
  },
  signals: {
    amount: 99,
    currency: 'USD',
    subscriptionType: 'monthly'
  }
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

async function testPaymentFlow(paymentType, testData) {
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

async function testSpecificEndpoints() {
  console.log('\n🔍 Testing specific payment endpoints...');
  console.log('=' .repeat(50));
  
  // Test resources purchase endpoint
  console.log('\n📚 Testing resources purchase endpoint...');
  const resourcesResponse = await makeRequest(`${BASE_URL}/api/resources/purchase`, {
    method: 'POST',
    body: JSON.stringify({
      resourceId: '1',
      amountUSD: 50,
      provider: 'mock'
    })
  });
  
  if (resourcesResponse.success) {
    console.log('✅ Resources purchase endpoint working');
  } else {
    console.log('❌ Resources purchase endpoint failed:', resourcesResponse.data);
  }
  
  // Test mentorship registration endpoint
  console.log('\n👨‍🏫 Testing mentorship registration endpoint...');
  const mentorshipResponse = await makeRequest(`${BASE_URL}/api/mentorship/register`, {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      email: TEST_USER_EMAIL,
      phone: '+1234567890',
      countryCode: '+1',
      schedulingPreferences: 'Weekend mornings'
    })
  });
  
  if (mentorshipResponse.success) {
    console.log('✅ Mentorship registration endpoint working');
  } else {
    console.log('❌ Mentorship registration endpoint failed:', mentorshipResponse.data);
  }
}

async function checkAdminReports() {
  console.log('\n📊 Checking admin reports and notifications...');
  console.log('=' .repeat(50));
  
  try {
    // Check recent payment intents
    const recentPayments = await prisma.mockPaymentIntent.findMany({
      where: {
        created: {
          gte: Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000) // Last 24 hours
        }
      },
      orderBy: {
        created: 'desc'
      },
      take: 10
    });
    
    console.log(`📈 Found ${recentPayments.length} recent payments:`);
    recentPayments.forEach(payment => {
      console.log(`- ${payment.id}: ${payment.status} - $${payment.amount / 100} ${payment.currency.toUpperCase()}`);
    });
    
    // Check admin notifications
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
    
  } catch (error) {
    console.log('❌ Error checking admin reports:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Payment Gateway Testing Suite');
  console.log('=' .repeat(60));
  console.log(`Testing with user: ${TEST_USER_EMAIL}`);
  console.log(`Server: ${BASE_URL}`);
  
  try {
    // Test each payment flow
    const results = {};
    
    // Test One-on-One Mentorship
    results.oneOnOne = await testPaymentFlow('One-on-One Mentorship', TEST_DATA.oneOnOne);
    
    // Test Academy Registration
    results.academy = await testPaymentFlow('Academy Registration', TEST_DATA.academy);
    
    // Test Resources Purchase
    results.resources = await testPaymentFlow('Resources Purchase', TEST_DATA.resources);
    
    // Test Events Registration
    results.events = await testPaymentFlow('Events Registration', TEST_DATA.events);
    
    // Test specific endpoints
    await testSpecificEndpoints();
    
    // Check admin reports
    await checkAdminReports();
    
    // Summary
    console.log('\n📋 TEST SUMMARY');
    console.log('=' .repeat(60));
    
    Object.entries(results).forEach(([test, result]) => {
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test}`);
    });
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All payment gateways are working correctly!');
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
