#!/usr/bin/env node

/**
 * Comprehensive frontend user flow test
 * This simulates exactly what happens when a user submits the form
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCompleteUserFlow() {
  console.log('🎯 COMPREHENSIVE FRONTEND USER FLOW TEST\n');

  try {
    // Step 1: Create a test user account
    const testEmail = `user.flow.${Date.now()}@example.com`;
    console.log(`Step 1: Creating user account: ${testEmail}`);
    
    const userData = {
      firstName: 'User',
      lastName: 'Flow',
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

    // Step 2: Login as the user (simulating what happens when user logs in)
    console.log('\nStep 2: User login...');
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
    console.log('✅ User logged in successfully');

    // Step 3: Create broker registration (this happens when user visits trade-core page)
    console.log('\nStep 3: Creating broker registration...');
    const brokerRegResponse = await fetch(`${BASE_URL}/api/broker/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${loginData.token}`
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

    // Step 4: Simulate the EXACT frontend form submission
    console.log('\nStep 4: Simulating frontend form submission...');
    
    // First, verify authentication (what the form now does)
    console.log('Checking user authentication...');
    const authResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Cookie': `auth-token=${loginData.token}` }
    });

    if (!authResponse.ok) {
      console.log('❌ Authentication check failed');
      return;
    }

    const authData = await authResponse.json();
    console.log('✅ User authenticated:', authData.user?.email);

    // Submit Exness verification (first API call)
    console.log('Submitting Exness verification...');
    const exnessResponse = await fetch(`${BASE_URL}/api/exness/verification`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${loginData.token}`
      },
      body: JSON.stringify({
        email: testEmail,
        fullName: 'User Flow',
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

    const exnessResult = await exnessResponse.json();
    console.log('✅ Exness verification successful');

    // Submit broker verification (second API call - this is the critical one)
    console.log('Submitting broker verification...');
    const brokerVerifyResponse = await fetch(`${BASE_URL}/api/broker/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${loginData.token}`
      },
      body: JSON.stringify({
        broker: 'EXNESS',
        accountType: 'existing',
        verificationData: {
          email: testEmail,
          fullName: 'User Flow',
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

    const brokerResult = await brokerVerifyResponse.json();
    console.log('✅ Broker verification successful');
    console.log('✅ Form submission completed successfully!');

    // Step 5: Check admin panel immediately
    console.log('\nStep 5: Checking admin panel...');
    
    // Login as admin
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

    // Check registrations
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
        const isTest = reg.user.email === testEmail ? ' 👈 TEST SUBMISSION' : '';
        console.log(`${index + 1}. ${reg.user.name} (${reg.user.email}) - ${status} - ${time}${isTest}`);
      });

    console.log('\n🎯 FINAL RESULT:');
    if (testSubmission) {
      console.log('✅ COMPLETE SUCCESS!');
      console.log('✅ Frontend form works correctly');
      console.log('✅ Authentication is properly handled');
      console.log('✅ Submissions appear in admin panel');
      console.log('✅ Complete user flow is functional');
      console.log('\n📝 The form should now work for real users!');
    } else {
      console.log('❌ FAILURE - Submission not appearing in admin panel');
      console.log('❌ There is still an issue with the connection');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompleteUserFlow();
