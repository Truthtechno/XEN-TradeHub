#!/usr/bin/env node

/**
 * Test submission while logged in (simulating the real user experience)
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testLoggedInSubmission() {
  console.log('🧪 Testing submission while logged in (simulating real user experience)...\n');

  try {
    // Step 1: Create and login as a user (simulating being on trade-core page)
    console.log('Step 1: Creating user account and logging in...');
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.logged.in@example.com',
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

    // Login as user (simulating being logged in on trade-core page)
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test.logged.in@example.com',
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
    console.log('✅ User logged in successfully (simulating being on trade-core page)');

    // Step 2: Create broker registration (this happens when user first visits trade-core)
    console.log('\nStep 2: Creating broker registration...');
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

    // Step 3: Simulate the verification form submission (exactly like the frontend does)
    console.log('\nStep 3: Simulating verification form submission...');
    const verificationData = {
      email: 'test.logged.in@example.com',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      exnessAccountId: 'EX123456789',
      accountType: 'existing'
    };

    // First, submit to Exness API (with credentials: include)
    console.log('Submitting to Exness API...');
    const exnessResponse = await fetch(`${BASE_URL}/api/exness/verification`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
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

    // Then submit to broker verification API (with credentials: include)
    console.log('Submitting to broker verification API...');
    const brokerVerifyResponse = await fetch(`${BASE_URL}/api/broker/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
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

    // Step 4: Check if it appears in admin panel
    console.log('\nStep 4: Checking admin panel...');
    
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
    
    const userVerification = data.registrations.find(reg => 
      reg.user.email === 'test.logged.in@example.com'
    );

    if (userVerification) {
      console.log('🎉 SUCCESS! Verification appears in admin panel:');
      console.log(`   - Name: ${userVerification.user.name}`);
      console.log(`   - Email: ${userVerification.user.email}`);
      console.log(`   - Status: ${userVerification.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Verification Data: ${JSON.stringify(userVerification.verificationData, null, 2)}`);
    } else {
      console.log('❌ Verification NOT found in admin panel');
      console.log('\nCurrent registrations:');
      data.registrations.forEach((reg, index) => {
        console.log(`${index + 1}. ${reg.user.email} - ${reg.verified ? 'VERIFIED' : 'PENDING'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLoggedInSubmission();
