#!/usr/bin/env node

/**
 * Check for brianaooti@yahoo.com submission immediately
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function checkYahooSubmission() {
  console.log('🚨 CHECKING brianaooti@yahoo.com SUBMISSION IMMEDIATELY...\n');

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
    
    console.log(`📊 Admin panel shows: ${data.registrations.length} registrations`);
    
    // Look specifically for brianaooti@yahoo.com
    const yahooSubmission = data.registrations.find(reg => 
      reg.user.email === 'brianaooti@yahoo.com'
    );

    if (yahooSubmission) {
      console.log('✅ FOUND brianaooti@yahoo.com submission:');
      console.log(`   - Name: ${yahooSubmission.user.name}`);
      console.log(`   - Email: ${yahooSubmission.user.email}`);
      console.log(`   - Status: ${yahooSubmission.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Created: ${yahooSubmission.createdAt}`);
      console.log(`   - Exness ID: ${yahooSubmission.verificationData?.exnessAccountId || 'Not provided'}`);
    } else {
      console.log('❌ brianaooti@yahoo.com submission NOT FOUND in admin panel');
    }

    // Check all recent submissions
    console.log('\n📋 ALL RECENT SUBMISSIONS (last 5 minutes):');
    const now = new Date();
    const recentSubmissions = data.registrations.filter(reg => {
      const submissionTime = new Date(reg.createdAt);
      const diffMinutes = (now - submissionTime) / (1000 * 60);
      return diffMinutes <= 5;
    });

    recentSubmissions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((reg, index) => {
        const time = new Date(reg.createdAt).toLocaleTimeString();
        const status = reg.verified ? '✅ VERIFIED' : '⏳ PENDING';
        console.log(`${index + 1}. ${reg.user.name} (${reg.user.email}) - ${status} - ${time}`);
      });

    // Let's simulate your exact submission to see what happens
    console.log('\n🧪 SIMULATING brianaooti@yahoo.com submission...');
    
    // Create account
    const userData = {
      firstName: 'Briana',
      lastName: 'Oooti',
      email: 'brianaooti@yahoo.com',
      whatsappNumber: '+256705362786',
      password: 'password123',
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
    } else {
      console.log('✅ Account created successfully');
    }

    // Login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'brianaooti@yahoo.com',
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
    console.log('✅ Login successful');

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
    } else {
      console.log('✅ Broker registration created');
    }

    // Submit verification
    const verificationData = {
      email: 'brianaooti@yahoo.com',
      fullName: 'Briana Oooti',
      phoneNumber: '+256705362786',
      exnessAccountId: 'EX123456789',
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
    
    const newYahooSubmission = immediateData.registrations.find(reg => 
      reg.user.email === 'brianaooti@yahoo.com'
    );

    if (newYahooSubmission) {
      console.log('🎉 SUCCESS! brianaooti@yahoo.com submission appears:');
      console.log(`   - Name: ${newYahooSubmission.user.name}`);
      console.log(`   - Email: ${newYahooSubmission.user.email}`);
      console.log(`   - Status: ${newYahooSubmission.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Time: ${new Date(newYahooSubmission.createdAt).toLocaleTimeString()}`);
    } else {
      console.log('❌ brianaooti@yahoo.com submission STILL NOT APPEARING!');
      console.log('This indicates a serious system issue');
    }

    // Show total count
    console.log(`\n📊 Total registrations now: ${immediateData.registrations.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkYahooSubmission();
