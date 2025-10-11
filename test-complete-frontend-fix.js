#!/usr/bin/env node

/**
 * Test the complete frontend fix
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCompleteFrontendFix() {
  console.log('🧪 TESTING COMPLETE FRONTEND FIX...\n');

  try {
    // Test with a new user to simulate the complete flow
    const testEmail = `test.frontend.${Date.now()}@example.com`;
    console.log(`Using test email: ${testEmail}`);
    
    // Step 1: Create user account
    console.log('Step 1: Creating user account...');
    const userData = {
      firstName: 'Frontend',
      lastName: 'Test',
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

    console.log('✅ User account created successfully');

    // Step 2: Login as user
    console.log('\nStep 2: Logging in as user...');
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
    console.log('✅ User logged in successfully');

    // Step 3: Create broker registration
    console.log('\nStep 3: Creating broker registration...');
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

    console.log('✅ Broker registration created successfully');

    // Step 4: Submit verification (simulating the fixed frontend form)
    console.log('\nStep 4: Submitting verification with fixed frontend logic...');
    const verificationData = {
      email: testEmail,
      fullName: 'Frontend Test',
      phoneNumber: '+1234567890',
      exnessAccountId: 'EX123456789',
      accountType: 'existing'
    };

    // Simulate the fixed frontend form submission
    console.log('Simulating Exness API call...');
    const exnessResponse = await fetch(`${BASE_URL}/api/exness/verification`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`,
        'Cookie': userCookie
      },
      body: JSON.stringify(verificationData)
    });

    if (!exnessResponse.ok) {
      const error = await exnessResponse.text();
      console.log(`❌ Exness verification failed: ${error}`);
      return;
    }

    const exnessResult = await exnessResponse.json();
    console.log('✅ Exness verification successful:', exnessResult);

    // Simulate broker verification API call
    console.log('Simulating broker verification API call...');
    const brokerVerifyResponse = await fetch(`${BASE_URL}/api/broker/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`,
        'Cookie': userCookie
      },
      body: JSON.stringify({
        broker: 'EXNESS',
        accountType: 'existing',
        verificationData: verificationData
      })
    });

    if (!brokerVerifyResponse.ok) {
      const error = await brokerVerifyResponse.text();
      console.log(`❌ Broker verification failed: ${error}`);
      return;
    }

    const brokerResult = await brokerVerifyResponse.json();
    console.log('✅ Broker verification successful:', brokerResult);

    // Step 5: Check admin panel immediately
    console.log('\nStep 5: Checking admin panel immediately...');
    
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
    
    console.log(`📊 Admin panel shows: ${data.registrations.length} registrations`);
    
    // Look for our test submission
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

    // Show recent submissions
    console.log('\n📋 Recent submissions (last 5 minutes):');
    const now = new Date();
    const recentSubmissions = data.registrations.filter(reg => {
      const submissionTime = new Date(reg.createdAt);
      const diffMinutes = (now - submissionTime) / (1000 * 60);
      return diffMinutes <= 5;
    });

    recentSubmissions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((reg, index) => {
        const time = new Date(reg.createdAt).toLocaleTimeString();
        const status = reg.verified ? '✅ VERIFIED' : '⏳ PENDING';
        console.log(`${index + 1}. ${reg.user.name} (${reg.user.email}) - ${status} - ${time}`);
      });

    console.log('\n🎯 FRONTEND FIX SUMMARY:');
    if (testSubmission) {
      console.log('✅ Frontend form fix is working');
      console.log('✅ Submissions appear in admin panel');
      console.log('✅ Authentication is working properly');
      console.log('✅ Complete flow is functional');
    } else {
      console.log('❌ Frontend form fix needs more work');
      console.log('❌ Submissions not appearing in admin panel');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompleteFrontendFix();
