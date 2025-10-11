#!/usr/bin/env node

/**
 * Debug live submission issue immediately
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function debugLiveSubmission() {
  console.log('🚨 DEBUGGING LIVE SUBMISSION ISSUE...\n');

  try {
    // Check admin panel for latest submissions
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
    
    console.log(`📊 Admin panel shows: ${data.registrations.length} total registrations`);
    
    // Show ALL recent submissions (last 10 minutes)
    console.log('\n📋 ALL RECENT SUBMISSIONS (last 10 minutes):');
    const now = new Date();
    const recentSubmissions = data.registrations.filter(reg => {
      const submissionTime = new Date(reg.createdAt);
      const diffMinutes = (now - submissionTime) / (1000 * 60);
      return diffMinutes <= 10;
    });

    recentSubmissions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((reg, index) => {
        const time = new Date(reg.createdAt).toLocaleString();
        const status = reg.verified ? '✅ VERIFIED' : '⏳ PENDING';
        const isRecent = (now - new Date(reg.createdAt)) / (1000 * 60) <= 5 ? ' 🔥 VERY RECENT' : '';
        console.log(`${index + 1}. ${reg.user.name} (${reg.user.email}) - ${status} - ${time}${isRecent}`);
      });

    if (recentSubmissions.length === 0) {
      console.log('❌ NO RECENT SUBMISSIONS FOUND!');
      console.log('This confirms the form is not working for real users');
    }

    // Test the form submission process step by step
    console.log('\n🧪 TESTING FORM SUBMISSION PROCESS...');
    
    // Create a test user
    const testEmail = `debug.test.${Date.now()}@example.com`;
    console.log(`Creating test user: ${testEmail}`);
    
    const userData = {
      firstName: 'Debug',
      lastName: 'Test',
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
      const error = await loginResponse.text();
      console.log(`❌ Login failed: ${error}`);
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

    // Test authentication check (what the form does)
    console.log('Testing authentication check...');
    const authResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 'Cookie': userCookie }
    });

    if (!authResponse.ok) {
      console.log('❌ Authentication check failed');
      return;
    }

    const authData = await authResponse.json();
    console.log('✅ Authentication check passed:', authData.user?.email);

    // Test Exness verification
    console.log('Testing Exness verification...');
    const exnessResponse = await fetch(`${BASE_URL}/api/exness/verification`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': userCookie
      },
      body: JSON.stringify({
        email: testEmail,
        fullName: 'Debug Test',
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

    console.log('✅ Exness verification successful');

    // Test broker verification (the critical step)
    console.log('Testing broker verification...');
    const brokerVerifyResponse = await fetch(`${BASE_URL}/api/broker/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': userCookie
      },
      body: JSON.stringify({
        broker: 'EXNESS',
        accountType: 'existing',
        verificationData: {
          email: testEmail,
          fullName: 'Debug Test',
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

    console.log('✅ Broker verification successful');

    // Check if it appears in admin panel immediately
    console.log('\n🔍 Checking admin panel immediately...');
    
    const immediateResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
      headers: { 'Cookie': adminCookie }
    });

    const immediateData = await immediateResponse.json();
    
    const testSubmission = immediateData.registrations.find(reg => 
      reg.user.email === testEmail
    );

    if (testSubmission) {
      console.log('🎉 SUCCESS! Test submission appears in admin panel:');
      console.log(`   - Name: ${testSubmission.user.name}`);
      console.log(`   - Email: ${testSubmission.user.email}`);
      console.log(`   - Status: ${testSubmission.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Created: ${new Date(testSubmission.createdAt).toLocaleTimeString()}`);
    } else {
      console.log('❌ Test submission NOT found in admin panel');
      console.log('This indicates a serious issue with the system');
    }

    console.log('\n🎯 DIAGNOSIS:');
    if (testSubmission) {
      console.log('✅ Backend system is working correctly');
      console.log('✅ APIs are functioning properly');
      console.log('❌ Frontend form has an issue');
      console.log('❌ Real user submissions are not going through');
    } else {
      console.log('❌ Backend system has issues');
      console.log('❌ APIs are not working properly');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLiveSubmission();