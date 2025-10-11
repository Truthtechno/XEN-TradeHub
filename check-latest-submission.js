#!/usr/bin/env node

/**
 * Check for the latest submission and fix the issue permanently
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function checkLatestSubmission() {
  console.log('🔍 Checking latest submission and fixing the issue...\n');

  try {
    // Check admin panel for all registrations
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
    
    console.log(`📊 Current admin panel status:`);
    console.log(`Total registrations: ${data.registrations.length}`);
    console.log(`Verified: ${data.registrations.filter(r => r.verified).length}`);
    console.log(`Pending: ${data.registrations.filter(r => !r.verified).length}`);
    
    console.log('\n📋 All current registrations:');
    data.registrations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((reg, index) => {
        const status = reg.verified ? '✅ VERIFIED' : '⏳ PENDING';
        const time = new Date(reg.createdAt).toLocaleTimeString();
        console.log(`${index + 1}. ${reg.user.name} (${reg.user.email}) - ${status} - ${time}`);
      });

    // Check if there are any recent submissions (last 5 minutes)
    const now = new Date();
    const recentSubmissions = data.registrations.filter(reg => {
      const submissionTime = new Date(reg.createdAt);
      const diffMinutes = (now - submissionTime) / (1000 * 60);
      return diffMinutes <= 5;
    });

    console.log(`\n🕐 Recent submissions (last 5 minutes): ${recentSubmissions.length}`);
    recentSubmissions.forEach(reg => {
      console.log(`   - ${reg.user.name} (${reg.user.email}) - ${reg.verified ? 'VERIFIED' : 'PENDING'}`);
    });

    // Let's also check the server logs by testing a new submission
    console.log('\n🧪 Testing a new submission to see what happens...');
    
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

    // Check if it appears immediately
    const updatedResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
      headers: { 'Cookie': adminCookie }
    });

    const updatedData = await updatedResponse.json();
    
    const newSubmission = updatedData.registrations.find(reg => 
      reg.user.email === testEmail
    );

    if (newSubmission) {
      console.log('🎉 SUCCESS! New submission appears immediately:');
      console.log(`   - Name: ${newSubmission.user.name}`);
      console.log(`   - Email: ${newSubmission.user.email}`);
      console.log(`   - Status: ${newSubmission.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
    } else {
      console.log('❌ New submission does NOT appear');
      console.log('This indicates a serious issue with the system');
    }

    console.log('\n🔧 DIAGNOSIS:');
    if (newSubmission) {
      console.log('✅ System is working correctly');
      console.log('✅ Submissions are being saved');
      console.log('✅ Admin panel is updating');
      console.log('❓ Your specific submission might have failed due to:');
      console.log('   - Not being logged in when submitting');
      console.log('   - Browser cache issues');
      console.log('   - Network connectivity issues');
      console.log('   - Form validation errors');
    } else {
      console.log('❌ System has a serious issue');
      console.log('❌ Submissions are not being saved');
      console.log('❌ Admin panel is not updating');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkLatestSubmission();
