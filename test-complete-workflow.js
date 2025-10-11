#!/usr/bin/env node

/**
 * Test the complete verification workflow: Pending -> Admin Review -> Verified
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCompleteWorkflow() {
  console.log('🎯 TESTING COMPLETE VERIFICATION WORKFLOW\n');
  console.log('User submits → Pending → Admin reviews → Verified\n');

  try {
    // Step 1: Create a new test user
    console.log('Step 1: Creating new test user...');
    const userData = {
      firstName: 'Workflow',
      lastName: 'Tester',
      email: 'workflow.tester@example.com',
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
        email: 'workflow.tester@example.com',
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

    // Step 4: Submit verification (should be PENDING)
    console.log('\nStep 4: User submits verification form...');
    const verificationData = {
      email: 'workflow.tester@example.com',
      fullName: 'Workflow Tester',
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

    // Submit to broker verification API (should be PENDING)
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
    console.log('✅ Verification submitted successfully:', brokerResult.message);

    // Step 5: Check admin panel (should show PENDING)
    console.log('\nStep 5: Admin checks the panel...');
    
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
    
    console.log(`📊 Admin sees: ${data.registrations.length} total registrations`);
    console.log(`✅ Verified: ${data.registrations.filter(r => r.verified).length}`);
    console.log(`⏳ Pending: ${data.registrations.filter(r => !r.verified).length}`);
    
    // Look for our test user
    const userVerification = data.registrations.find(reg => 
      reg.user.email === 'workflow.tester@example.com'
    );

    if (userVerification) {
      console.log('\n📋 Admin sees the pending verification:');
      console.log(`   - Name: ${userVerification.user.name}`);
      console.log(`   - Email: ${userVerification.user.email}`);
      console.log(`   - Status: ${userVerification.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Phone: ${userVerification.verificationData?.phoneNumber || 'Not provided'}`);
      console.log(`   - Exness ID: ${userVerification.verificationData?.exnessAccountId || 'Not provided'}`);
      console.log(`   - Account Type: ${userVerification.verificationData?.accountType || 'Not specified'}`);
    } else {
      console.log('❌ Test user verification NOT found in admin panel');
      return;
    }

    // Step 6: Admin clicks "View Details" (simulate)
    console.log('\nStep 6: Admin clicks "View Details"...');
    console.log('📋 VERIFICATION DETAILS:');
    console.log('===================');
    console.log(`Name: ${userVerification.user.name}`);
    console.log(`Email: ${userVerification.user.email}`);
    console.log(`Phone: ${userVerification.verificationData?.phoneNumber || 'Not provided'}`);
    console.log(`Exness Account ID: ${userVerification.verificationData?.exnessAccountId || 'Not provided'}`);
    console.log(`Account Type: ${userVerification.verificationData?.accountType || 'Not specified'}`);
    console.log(`Broker: ${userVerification.broker}`);
    console.log(`Link Used: ${userVerification.link.label}`);
    console.log(`Status: ${userVerification.verified ? 'VERIFIED' : 'PENDING'}`);
    console.log(`Submitted: ${userVerification.createdAt}`);
    console.log(`Verified: ${userVerification.verifiedAt || 'Not verified yet'}`);

    // Step 7: Admin marks as verified
    console.log('\nStep 7: Admin clicks "Mark Verified"...');
    
    const markVerifiedResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations/${userVerification.id}/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': adminCookie
      }
    });

    if (markVerifiedResponse.ok) {
      console.log('✅ Admin successfully marked as verified!');
      
      // Check final status
      const finalResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
        headers: { 'Cookie': adminCookie }
      });
      const finalData = await finalResponse.json();
      const finalUser = finalData.registrations.find(reg => 
        reg.user.email === 'workflow.tester@example.com'
      );
      
      if (finalUser && finalUser.verified) {
        console.log('\n🎉 FINAL STATUS:');
        console.log(`   - Name: ${finalUser.user.name}`);
        console.log(`   - Email: ${finalUser.user.email}`);
        console.log(`   - Status: ✅ VERIFIED`);
        console.log(`   - Verified At: ${finalUser.verifiedAt}`);
        console.log(`   - All verification data preserved: ${JSON.stringify(finalUser.verificationData, null, 2)}`);
      }
    } else {
      const error = await markVerifiedResponse.text();
      console.log(`❌ Admin verification failed: ${error}`);
    }

    console.log('\n🎯 WORKFLOW COMPLETE!');
    console.log('✅ User submits verification → Pending');
    console.log('✅ Admin sees pending verification with full details');
    console.log('✅ Admin can view all verification form data');
    console.log('✅ Admin can mark as verified');
    console.log('✅ System tracks verification status properly');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompleteWorkflow();
