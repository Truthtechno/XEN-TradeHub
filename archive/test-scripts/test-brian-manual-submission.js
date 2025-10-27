#!/usr/bin/env node

/**
 * Test Brian's manual submission scenario to reproduce the issue
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testBrianManualSubmission() {
  console.log('🔍 Testing Brian\'s manual submission scenario...\n');

  try {
    // Step 1: Login as Brian (simulating being logged in)
    console.log('Step 1: Logging in as Brian...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'brian@corefx.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const userCookie = `auth-token=${loginData.token}`;
    console.log('✅ Brian logged in successfully');

    // Step 2: Create broker registration (simulating the registration step)
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

    // Step 3: Simulate the frontend form submission (WITHOUT cookies)
    console.log('\nStep 3: Simulating frontend form submission (without cookies)...');
    const verificationData = {
      email: 'brian@corefx.com',
      fullName: 'BRIAN AMOOTI',
      phoneNumber: '+256705362786',
      exnessAccountId: 'ID63738',
      accountType: 'existing'
    };

    // Submit to Exness API (this should work)
    console.log('Submitting to Exness API...');
    const exnessResponse = await fetch(`${BASE_URL}/api/exness/verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData)
    });

    if (!exnessResponse.ok) {
      const error = await exnessResponse.text();
      console.log(`❌ Exness verification failed: ${error}`);
      return;
    }

    const exnessResult = await exnessResponse.json();
    console.log('✅ Exness verification successful:', exnessResult);

    // Submit to broker verification API (this should fail without cookies)
    console.log('Submitting to broker verification API (without cookies)...');
    const brokerVerifyResponse = await fetch(`${BASE_URL}/api/broker/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
        // NO COOKIE HERE - this simulates the frontend form issue
      },
      body: JSON.stringify({
        broker: 'EXNESS',
        accountType: 'existing',
        verificationData: verificationData
      })
    });

    if (!brokerVerifyResponse.ok) {
      const error = await brokerVerifyResponse.text();
      console.log(`❌ Broker verification failed (as expected): ${error}`);
      console.log('This is the issue! The frontend form is not sending cookies.');
    } else {
      console.log('✅ Broker verification successful (unexpected)');
    }

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
    
    const brianVerification = data.registrations.find(reg => 
      reg.user.email === 'brian@corefx.com'
    );

    if (brianVerification) {
      console.log('✅ Brian\'s verification found in admin panel');
    } else {
      console.log('❌ Brian\'s verification NOT found in admin panel');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBrianManualSubmission();
