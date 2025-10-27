#!/usr/bin/env node

/**
 * Test the specific brayamooti@gmail.com submission
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testBrayamootiSubmission() {
  console.log('🔍 Testing brayamooti@gmail.com submission...\n');

  try {
    // Step 1: Login as brayamooti@gmail.com
    console.log('Step 1: Logging in as brayamooti@gmail.com...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'brayamooti@gmail.com',
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

    // Step 2: Check if broker registration exists
    console.log('\nStep 2: Checking broker registration...');
    
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
    
    const existingSubmission = data.registrations.find(reg => 
      reg.user.email === 'brayamooti@gmail.com'
    );

    if (existingSubmission) {
      console.log('✅ Existing submission found:');
      console.log(`   - Name: ${existingSubmission.user.name}`);
      console.log(`   - Email: ${existingSubmission.user.email}`);
      console.log(`   - Status: ${existingSubmission.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Verification Data: ${JSON.stringify(existingSubmission.verificationData, null, 2)}`);
    } else {
      console.log('❌ No existing submission found');
    }

    // Step 3: Create broker registration if it doesn't exist
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
    } else {
      console.log('✅ Broker registration created/updated');
    }

    // Step 4: Submit verification with the exact data from your form
    console.log('\nStep 4: Submitting verification with your exact data...');
    const verificationData = {
      email: 'brayamooti@gmail.com',
      fullName: 'BRIAN ALIOOTI ASABA',
      phoneNumber: '+256705362786',
      exnessAccountId: 'ID63766',
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

    const exnessResult = await exnessResponse.json();
    console.log('✅ Exness verification successful:', exnessResult);

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

    const brokerResult = await brokerVerifyResponse.json();
    console.log('✅ Broker verification successful:', brokerResult);

    // Step 5: Check final status
    console.log('\nStep 5: Checking final status...');
    
    const finalResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
      headers: { 'Cookie': adminCookie }
    });

    const finalData = await finalResponse.json();
    
    const finalSubmission = finalData.registrations.find(reg => 
      reg.user.email === 'brayamooti@gmail.com'
    );

    if (finalSubmission) {
      console.log('🎉 SUCCESS! Your submission is now in the admin panel:');
      console.log(`   - Name: ${finalSubmission.user.name}`);
      console.log(`   - Email: ${finalSubmission.user.email}`);
      console.log(`   - Status: ${finalSubmission.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Phone: ${finalSubmission.verificationData?.phoneNumber || 'Not provided'}`);
      console.log(`   - Exness ID: ${finalSubmission.verificationData?.exnessAccountId || 'Not provided'}`);
      console.log(`   - Account Type: ${finalSubmission.verificationData?.accountType || 'Not specified'}`);
    } else {
      console.log('❌ Submission still not found');
    }

    console.log('\n📊 Current admin panel status:');
    console.log(`Total registrations: ${finalData.registrations.length}`);
    console.log(`Verified: ${finalData.registrations.filter(r => r.verified).length}`);
    console.log(`Pending: ${finalData.registrations.filter(r => !r.verified).length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBrayamootiSubmission();
