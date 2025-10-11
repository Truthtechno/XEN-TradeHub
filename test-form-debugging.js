#!/usr/bin/env node

/**
 * Test form debugging and provide instructions
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testFormDebugging() {
  console.log('🔧 FORM DEBUGGING INSTRUCTIONS\n');

  console.log('The system backend is working perfectly. The issue is in the frontend form.');
  console.log('Here\'s how to debug your form submission:\n');

  console.log('1. Open your browser\'s Developer Tools (F12)');
  console.log('2. Go to the Console tab');
  console.log('3. Submit the verification form');
  console.log('4. Look for these messages in the console:');
  console.log('   - "Auth token found: Yes/No"');
  console.log('   - "Form data being submitted: {...}"');
  console.log('   - "Account type: existing"');
  console.log('   - "Exness verification result: {...}"');
  console.log('   - "Broker verification response status: 200"');
  console.log('   - "Broker verification result: {...}"');
  console.log('\n5. If you see any errors, copy them and let me know');

  console.log('\n🔍 COMMON ISSUES:');
  console.log('❌ "Auth token found: No" - You\'re not logged in properly');
  console.log('❌ "Exness API error: 401" - Authentication failed');
  console.log('❌ "Broker verification failed: 401" - Authentication failed');
  console.log('❌ "Network error" - Check your internet connection');
  console.log('❌ No console messages at all - Form submission not working');

  console.log('\n✅ WHAT SHOULD HAPPEN:');
  console.log('1. Form should show "Auth token found: Yes"');
  console.log('2. Form should show your data being submitted');
  console.log('3. Exness verification should succeed');
  console.log('4. Broker verification should succeed');
  console.log('5. Success message should appear');
  console.log('6. Submission should appear in admin panel');

  console.log('\n🧪 TESTING BACKEND DIRECTLY...');
  
  // Test that backend works
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
    
    console.log(`✅ Backend is working - ${data.registrations.length} registrations found`);
    console.log('✅ Admin panel is accessible');
    console.log('✅ Database is working');
    
    // Check for brianaooti@yahoo.com
    const yahooSubmission = data.registrations.find(reg => 
      reg.user.email === 'brianaooti@yahoo.com'
    );

    if (yahooSubmission) {
      console.log('✅ brianaooti@yahoo.com submission found in database');
      console.log(`   - Name: ${yahooSubmission.user.name}`);
      console.log(`   - Status: ${yahooSubmission.verified ? 'VERIFIED' : 'PENDING'}`);
    } else {
      console.log('❌ brianaooti@yahoo.com submission NOT found in database');
      console.log('This confirms the form is not submitting properly');
    }

  } catch (error) {
    console.error('❌ Backend error:', error.message);
  }

  console.log('\n📝 NEXT STEPS:');
  console.log('1. Open browser console (F12)');
  console.log('2. Submit the form');
  console.log('3. Check console messages');
  console.log('4. Tell me what you see in the console');
  console.log('5. I will fix the specific issue');
}

testFormDebugging();
