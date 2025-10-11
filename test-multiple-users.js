#!/usr/bin/env node

/**
 * Test verification process with multiple users to ensure consistency
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testMultipleUsers() {
  console.log('🧪 Testing verification process with multiple users...\n');

  const testUsers = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      phone: '+1234567890',
      exnessId: 'EX111111111',
      password: 'password123'
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
      phone: '+1987654321',
      exnessId: 'EX222222222',
      password: 'password123'
    }
  ];

  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TEST ${i + 1}: ${user.firstName} ${user.lastName}`);
    console.log(`${'='.repeat(60)}`);

    try {
      // Step 1: Create user account
      console.log(`Step 1: Creating account for ${user.email}...`);
      const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        whatsappNumber: user.phone,
        password: user.password,
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
        continue;
      }

      console.log('✅ User account created successfully');

      // Step 2: Login as user
      console.log(`Step 2: Logging in as ${user.email}...`);
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });

      if (!loginResponse.ok) {
        const error = await loginResponse.text();
        console.log(`❌ Login failed: ${error}`);
        continue;
      }

      const loginData = await loginResponse.json();
      const userCookie = `auth-token=${loginData.token}`;
      console.log('✅ User logged in successfully');

      // Step 3: Create broker registration
      console.log('Step 3: Creating broker registration...');
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
        continue;
      }

      console.log('✅ Broker registration created successfully');

      // Step 4: Submit verification
      console.log('Step 4: Submitting verification...');
      const verificationData = {
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        phoneNumber: user.phone,
        exnessAccountId: user.exnessId,
        accountType: 'existing'
      };

      // Submit to Exness API
      const exnessResponse = await fetch(`${BASE_URL}/api/exness/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData)
      });

      if (!exnessResponse.ok) {
        const error = await exnessResponse.text();
        console.log(`❌ Exness verification failed: ${error}`);
        continue;
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
        continue;
      }

      console.log('✅ Broker verification submitted successfully');

      // Step 5: Verify it appears in admin panel
      console.log('Step 5: Checking admin panel...');
      
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
        continue;
      }

      const adminData = await adminResponse.json();
      const adminCookie = `auth-token=${adminData.token}`;

      const registrationsResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
        headers: { 'Cookie': adminCookie }
      });

      if (!registrationsResponse.ok) {
        console.log('❌ Failed to fetch registrations');
        continue;
      }

      const data = await registrationsResponse.json();
      
      const userVerification = data.registrations.find(reg => 
        reg.user.email === user.email
      );

      if (userVerification) {
        console.log(`🎉 SUCCESS! ${user.firstName}'s verification appears in admin panel:`);
        console.log(`   - Name: ${userVerification.user.name}`);
        console.log(`   - Email: ${userVerification.user.email}`);
        console.log(`   - Status: ${userVerification.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
        console.log(`   - Verified At: ${userVerification.verifiedAt || 'Not verified'}`);
        console.log(`   - Exness ID: ${userVerification.verificationData?.exnessAccountId || 'Not available'}`);
      } else {
        console.log(`❌ ${user.firstName}'s verification NOT found in admin panel`);
      }

    } catch (error) {
      console.error(`❌ Error for ${user.firstName}:`, error.message);
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 FINAL SUMMARY');
  console.log(`${'='.repeat(60)}`);

  try {
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
    
    console.log(`Total registrations: ${data.registrations.length}`);
    console.log('Recent verifications:');
    
    data.registrations
      .filter(reg => reg.verified)
      .sort((a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt))
      .slice(0, 5)
      .forEach((reg, index) => {
        console.log(`${index + 1}. ${reg.user.name} (${reg.user.email}) - ${reg.verifiedAt}`);
      });

  } catch (error) {
    console.error('❌ Error getting final summary:', error.message);
  }
}

testMultipleUsers();
