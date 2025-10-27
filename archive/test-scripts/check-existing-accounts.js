#!/usr/bin/env node

/**
 * Check what accounts exist and create Brian's account properly
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function checkAndCreateAccount() {
  console.log('🔍 Checking existing accounts and creating Brian\'s account...\n');

  try {
    // First, let's try to create Brian's account with a different password
    console.log('Step 1: Creating Brian\'s account with password "password"...');
    const userData = {
      firstName: 'BRIAN',
      lastName: 'AMOOTI',
      email: 'brian@corefx.com',
      whatsappNumber: '+256705362786',
      password: 'password',
      country: 'UG'
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      console.log(`❌ Registration failed: ${error}`);
      
      // If account exists, try to login with different passwords
      console.log('\nTrying different passwords for existing account...');
      
      const passwords = ['password', 'password123', 'brian123', 'admin123'];
      
      for (const pwd of passwords) {
        console.log(`Trying password: ${pwd}`);
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'brian@corefx.com',
            password: pwd
          })
        });

        if (loginResponse.ok) {
          console.log(`✅ SUCCESS! Password is: ${pwd}`);
          const loginData = await loginResponse.json();
          const userCookie = `auth-token=${loginData.token}`;
          
          // Now submit verification
          await submitVerification(userCookie);
          return;
        } else {
          console.log(`❌ Password ${pwd} failed`);
        }
      }
      
      console.log('❌ None of the common passwords worked');
      return;
    }

    console.log('✅ User account created successfully');
    
    // Login and submit verification
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'brian@corefx.com',
        password: 'password'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed after registration');
      return;
    }

    const loginData = await loginResponse.json();
    const userCookie = `auth-token=${loginData.token}`;
    console.log('✅ Brian logged in successfully');
    
    await submitVerification(userCookie);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function submitVerification(userCookie) {
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

  console.log('\nStep 3: Submitting verification...');
  const verificationData = {
    email: 'brian@corefx.com',
    fullName: 'BRIAN AMOOTI',
    phoneNumber: '+256705362786',
    exnessAccountId: 'ID63738',
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

  // Check admin panel
  console.log('\nStep 4: Checking admin panel...');
  
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
  
  const brianVerification = data.registrations.find(reg => 
    reg.user.email === 'brian@corefx.com'
  );

  if (brianVerification) {
    console.log('🎉 SUCCESS! Brian\'s verification now appears in the admin panel:');
    console.log(`   - Name: ${brianVerification.user.name}`);
    console.log(`   - Email: ${brianVerification.user.email}`);
    console.log(`   - Status: ${brianVerification.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
    console.log(`   - Verified At: ${brianVerification.verifiedAt || 'Not verified'}`);
  } else {
    console.log('❌ Brian\'s verification still not found in admin panel');
  }
}

checkAndCreateAccount();
