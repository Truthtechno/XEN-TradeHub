#!/usr/bin/env node

/**
 * Submit Brian's verification properly while logged in
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function submitBrianVerification() {
  console.log('🔐 Submitting Brian\'s verification while logged in...\n');

  try {
    // Step 1: Login as Brian
    console.log('Step 1: Logging in as Brian...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'brian@corefx.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log(`❌ Login failed: ${error}`);
      console.log('This means either:');
      console.log('1. The account doesn\'t exist');
      console.log('2. The password is wrong');
      console.log('3. There\'s an authentication issue');
      return;
    }

    const loginData = await loginResponse.json();
    const userCookie = `auth-token=${loginData.token}`;
    console.log('✅ Brian logged in successfully');

    // Step 2: Create broker registration (if it doesn't exist)
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

    // Step 3: Submit verification with Brian's details
    console.log('\nStep 3: Submitting verification with Brian\'s details...');
    const verificationData = {
      email: 'brian@corefx.com',
      fullName: 'BRIAN AMOOTI',
      phoneNumber: '+256705362786',
      exnessAccountId: 'ID63738',
      accountType: 'existing'
    };

    // Submit to Exness API
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
    console.log('✅ Exness verification submitted successfully:', exnessResult);

    // Submit to broker verification API
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
    console.log('✅ Broker verification submitted successfully:', brokerResult);

    // Step 4: Verify it appears in admin panel
    console.log('\nStep 4: Verifying it appears in admin panel...');
    
    const adminResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password'
      })
    });

    if (!adminResponse.ok) {
      console.log('❌ Admin login failed');
      return;
    }

    const adminData = await adminResponse.json();
    const adminCookie = `auth-token=${adminData.token}`;

    const registrationsResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
      headers: { 'Cookie': adminCookie }
    });

    if (!registrationsResponse.ok) {
      console.log('❌ Failed to fetch registrations');
      return;
    }

    const data = await registrationsResponse.json();
    
    // Look for Brian's verification
    const brianVerification = data.registrations.find(reg => 
      reg.user.email === 'brian@corefx.com'
    );

    if (brianVerification) {
      console.log('🎉 SUCCESS! Brian\'s verification now appears in the admin panel:');
      console.log(`   - Name: ${brianVerification.user.name}`);
      console.log(`   - Email: ${brianVerification.user.email}`);
      console.log(`   - Status: ${brianVerification.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Verified At: ${brianVerification.verifiedAt || 'Not verified'}`);
      console.log(`   - Exness Account ID: ${brianVerification.verificationData?.exnessAccountId || 'Not available'}`);
    } else {
      console.log('❌ Brian\'s verification still not found in admin panel');
      console.log('\nCurrent registrations:');
      data.registrations.forEach((reg, index) => {
        console.log(`${index + 1}. ${reg.user.email} - ${reg.verified ? 'VERIFIED' : 'PENDING'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

submitBrianVerification();
