#!/usr/bin/env node

/**
 * Test the complete verification system with fixes
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCompleteSystem() {
  console.log('🧪 Testing complete verification system with fixes...\n');

  try {
    // Step 1: Create a new test user
    console.log('Step 1: Creating new test user...');
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.complete@example.com',
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
        email: 'test.complete@example.com',
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

    // Step 4: Submit verification (simulating the FIXED frontend form)
    console.log('\nStep 4: Submitting verification (with proper authentication)...');
    const verificationData = {
      email: 'test.complete@example.com',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      exnessAccountId: 'EX123456789',
      accountType: 'existing'
    };

    // Submit to Exness API
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

    console.log('✅ Exness verification submitted successfully');

    // Submit to broker verification API
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

    console.log('✅ Broker verification submitted successfully');

    // Step 5: Check admin panel
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
    
    console.log(`📊 Total registrations: ${data.registrations.length}`);
    
    // Look for our test user
    const userVerification = data.registrations.find(reg => 
      reg.user.email === 'test.complete@example.com'
    );

    if (userVerification) {
      console.log('🎉 SUCCESS! Test user verification appears in admin panel:');
      console.log(`   - Name: ${userVerification.user.name}`);
      console.log(`   - Email: ${userVerification.user.email}`);
      console.log(`   - Status: ${userVerification.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Verified At: ${userVerification.verifiedAt || 'Not verified'}`);
      console.log(`   - Registered: ${userVerification.registered}`);
    } else {
      console.log('❌ Test user verification NOT found in admin panel');
    }

    // Step 6: Test action buttons (mark as verified)
    if (userVerification && !userVerification.verified) {
      console.log('\nStep 6: Testing action buttons...');
      
      const markVerifiedResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations/${userVerification.id}/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': adminCookie
        }
      });

      if (markVerifiedResponse.ok) {
        console.log('✅ Action button (Mark Verified) works!');
      } else {
        const error = await markVerifiedResponse.text();
        console.log(`❌ Action button failed: ${error}`);
      }
    }

    // Step 7: Show all current verifications
    console.log('\n📋 All current verifications:');
    data.registrations
      .sort((a, b) => new Date(b.verifiedAt || b.registered) - new Date(a.verifiedAt || a.registered))
      .slice(0, 10)
      .forEach((reg, index) => {
        console.log(`${index + 1}. ${reg.user.name} (${reg.user.email}) - ${reg.verified ? 'VERIFIED' : 'PENDING'} - ${reg.verifiedAt || reg.registered}`);
      });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompleteSystem();
