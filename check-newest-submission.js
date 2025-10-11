#!/usr/bin/env node

/**
 * Check for the newest submission immediately
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function checkNewestSubmission() {
  console.log('🚨 CHECKING NEWEST SUBMISSION IMMEDIATELY...\n');

  try {
    // Check admin panel right now
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
    
    console.log(`📊 RIGHT NOW admin panel shows: ${data.registrations.length} registrations`);
    
    // Show ALL registrations with timestamps
    console.log('\n📋 ALL CURRENT REGISTRATIONS:');
    data.registrations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((reg, index) => {
        const time = new Date(reg.createdAt).toLocaleTimeString();
        const status = reg.verified ? '✅ VERIFIED' : '⏳ PENDING';
        console.log(`${index + 1}. ${reg.user.name} (${reg.user.email}) - ${status} - ${time}`);
      });

    // Check for very recent submissions (last 2 minutes)
    const now = new Date();
    const veryRecent = data.registrations.filter(reg => {
      const submissionTime = new Date(reg.createdAt);
      const diffMinutes = (now - submissionTime) / (1000 * 60);
      return diffMinutes <= 2;
    });

    console.log(`\n🕐 VERY RECENT SUBMISSIONS (last 2 minutes): ${veryRecent.length}`);
    veryRecent.forEach(reg => {
      const time = new Date(reg.createdAt).toLocaleTimeString();
      console.log(`   - ${reg.user.name} (${reg.user.email}) - ${reg.verified ? 'VERIFIED' : 'PENDING'} - ${time}`);
    });

    // Let's test a submission RIGHT NOW to see what happens
    console.log('\n🧪 TESTING SUBMISSION RIGHT NOW...');
    
    const testEmail = `test.${Date.now()}@example.com`;
    console.log(`Using test email: ${testEmail}`);
    
    // Create user
    const userData = {
      firstName: 'Test',
      lastName: 'User',
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
      console.log('❌ Login failed');
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

    // Submit verification
    const verificationData = {
      email: testEmail,
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      exnessAccountId: 'EX999999999',
      accountType: 'existing'
    };

    console.log('Submitting verification...');
    
    // Exness API
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

    console.log('✅ Exness verification successful');

    // Broker verification API
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

    console.log('✅ Broker verification successful');

    // Check immediately if it appears
    console.log('\n🔍 CHECKING IMMEDIATELY...');
    
    const immediateResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
      headers: { 'Cookie': adminCookie }
    });

    const immediateData = await immediateResponse.json();
    
    console.log(`📊 IMMEDIATELY after submission: ${immediateData.registrations.length} registrations`);
    
    const newSubmission = immediateData.registrations.find(reg => 
      reg.user.email === testEmail
    );

    if (newSubmission) {
      console.log('🎉 SUCCESS! New submission appears immediately:');
      console.log(`   - Name: ${newSubmission.user.name}`);
      console.log(`   - Email: ${newSubmission.user.email}`);
      console.log(`   - Status: ${newSubmission.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Time: ${new Date(newSubmission.createdAt).toLocaleTimeString()}`);
    } else {
      console.log('❌ NEW SUBMISSION DOES NOT APPEAR!');
      console.log('This confirms there is a serious issue with the system');
      
      // Show what we have
      console.log('\nCurrent registrations:');
      immediateData.registrations.forEach((reg, index) => {
        const time = new Date(reg.createdAt).toLocaleTimeString();
        console.log(`${index + 1}. ${reg.user.email} - ${time}`);
      });
    }

    // Check if there's a database issue
    console.log('\n🔍 CHECKING DATABASE DIRECTLY...');
    
    // Try to get all registrations from the database
    const dbResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations?limit=100`, {
      headers: { 'Cookie': adminCookie }
    });

    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log(`📊 Database shows: ${dbData.registrations.length} total registrations`);
      
      const dbNewSubmission = dbData.registrations.find(reg => 
        reg.user.email === testEmail
      );

      if (dbNewSubmission) {
        console.log('✅ Submission found in database');
      } else {
        console.log('❌ Submission NOT found in database - this is a serious issue');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkNewestSubmission();
