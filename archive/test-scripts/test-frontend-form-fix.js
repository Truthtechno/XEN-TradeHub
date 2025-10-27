#!/usr/bin/env node

/**
 * Test the frontend form fix
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testFrontendFormFix() {
  console.log('🧪 TESTING FRONTEND FORM FIX...\n');

  try {
    // Create a test user
    const testEmail = `frontend.fix.${Date.now()}@example.com`;
    console.log(`Creating test user: ${testEmail}`);
    
    const userData = {
      firstName: 'Frontend',
      lastName: 'Fix',
      email: testEmail,
      whatsappNumber: '+1234567890',
      password: 'password123',
      country: 'US'
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      console.log(`❌ Registration failed: ${error}`);
      return;
    }

    console.log('✅ Test user created');

    // Login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log(`❌ Login failed: ${error}`);
      return;
    }

    const loginData = await loginResponse.json();
    const userCookie = `auth-token=${loginData.token}`;
    console.log('✅ Test user logged in');

    // Create broker registration
    const brokerRegResponse = await fetch(`${BASE_URL}/api/broker/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': userCookie
      },
      body: JSON.stringify({
        broker: 'EXNESS',
        accountType: 'existing'
      })
    });

    if (!brokerRegResponse.ok) {
      const error = await brokerRegResponse.text();
      console.log(`❌ Broker registration failed: ${error}`);
      return;
    }

    console.log('✅ Broker registration created');

    // Simulate the EXACT frontend form submission with auth token
    console.log('\n🎯 Simulating frontend form submission...');
    
    // Check auth token (what the form now does)
    const authToken = loginData.token;
    console.log('Auth token found:', authToken ? 'Yes' : 'No');

    if (!authToken) {
      console.log('❌ No auth token found');
      return;
    }

    // Submit Exness verification (with auth token in header)
    console.log('Submitting Exness verification...');
    const exnessResponse = await fetch(`${BASE_URL}/api/exness/verification`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${authToken}`
      },
      body: JSON.stringify({
        email: testEmail,
        fullName: 'Frontend Fix',
        phoneNumber: '+1234567890',
        exnessAccountId: 'EX123456789',
        accountType: 'existing'
      })
    });

    if (!exnessResponse.ok) {
      const error = await exnessResponse.text();
      console.log(`❌ Exness verification failed: ${error}`);
      return;
    }

    console.log('✅ Exness verification successful');

    // Submit broker verification (with auth token in header)
    console.log('Submitting broker verification...');
    const brokerVerifyResponse = await fetch(`${BASE_URL}/api/broker/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${authToken}`
      },
      body: JSON.stringify({
        broker: 'EXNESS',
        accountType: 'existing',
        verificationData: {
          email: testEmail,
          fullName: 'Frontend Fix',
          phoneNumber: '+1234567890',
          exnessAccountId: 'EX123456789'
        }
      })
    });

    if (!brokerVerifyResponse.ok) {
      const error = await brokerVerifyResponse.text();
      console.log(`❌ Broker verification failed: ${error}`);
      return;
    }

    console.log('✅ Broker verification successful');
    console.log('✅ Form submission completed successfully!');

    // Check admin panel immediately
    console.log('\n🔍 Checking admin panel...');
    
    const adminResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password'
      })
    });

    const adminData = await adminResponse.json();
    const adminCookie = `auth-token=${adminData.token}`;

    const registrationsResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
      headers: { 'Cookie': adminCookie }
    });

    const data = await registrationsResponse.json();
    
    const testSubmission = data.registrations.find(reg => 
      reg.user.email === testEmail
    );

    if (testSubmission) {
      console.log('🎉 SUCCESS! Test submission appears in admin panel:');
      console.log(`   - Name: ${testSubmission.user.name}`);
      console.log(`   - Email: ${testSubmission.user.email}`);
      console.log(`   - Status: ${testSubmission.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Phone: ${testSubmission.verificationData?.phoneNumber || 'Not provided'}`);
      console.log(`   - Exness ID: ${testSubmission.verificationData?.exnessAccountId || 'Not provided'}`);
      console.log(`   - Created: ${new Date(testSubmission.createdAt).toLocaleTimeString()}`);
    } else {
      console.log('❌ Test submission NOT found in admin panel');
    }

    console.log('\n🎯 FRONTEND FORM FIX RESULT:');
    if (testSubmission) {
      console.log('✅ Frontend form fix is working');
      console.log('✅ Authentication is properly handled');
      console.log('✅ Submissions appear in admin panel');
      console.log('✅ Complete workflow is functional');
      console.log('\n📝 The form should now work for real users!');
    } else {
      console.log('❌ Frontend form fix needs more work');
      console.log('❌ Submissions still not appearing');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendFormFix();
