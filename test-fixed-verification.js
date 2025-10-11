#!/usr/bin/env node

/**
 * Test the fixed verification form with proper cookie handling
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testFixedVerification() {
  console.log('🔧 Testing fixed verification form...\n');

  try {
    // Step 1: Create a new test user
    console.log('Step 1: Creating new test user...');
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.fixed@example.com',
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
        email: 'test.fixed@example.com',
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

    // Step 4: Simulate the FIXED frontend form submission (with cookies)
    console.log('\nStep 4: Simulating FIXED frontend form submission (with cookies)...');
    const verificationData = {
      email: 'test.fixed@example.com',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      exnessAccountId: 'EX999999999',
      accountType: 'existing'
    };

    // Submit to Exness API (with credentials)
    console.log('Submitting to Exness API (with credentials)...');
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

    // Submit to broker verification API (with credentials)
    console.log('Submitting to broker verification API (with credentials)...');
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

    // Step 5: Check if it appears in admin panel
    console.log('\nStep 5: Checking admin panel...');
    
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
      reg.user.email === 'test.fixed@example.com'
    );

    if (userVerification) {
      console.log('🎉 SUCCESS! Test user verification appears in admin panel:');
      console.log(`   - Name: ${userVerification.user.name}`);
      console.log(`   - Email: ${userVerification.user.email}`);
      console.log(`   - Status: ${userVerification.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Verified At: ${userVerification.verifiedAt || 'Not verified'}`);
    } else {
      console.log('❌ Test user verification NOT found in admin panel');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFixedVerification();
