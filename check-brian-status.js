#!/usr/bin/env node

/**
 * Check Brian's verification status and fix issues
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function checkBrianStatus() {
  console.log('🔍 Checking Brian\'s verification status...\n');

  try {
    // Check admin panel
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
    
    console.log(`📊 Total registrations: ${data.registrations.length}`);
    
    // Look for Brian's verification
    const brianVerification = data.registrations.find(reg => 
      reg.user.email === 'brian@corefx.com'
    );

    if (brianVerification) {
      console.log('✅ Brian\'s verification found:');
      console.log(`   - Name: ${brianVerification.user.name}`);
      console.log(`   - Email: ${brianVerification.user.email}`);
      console.log(`   - Status: ${brianVerification.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Verified At: ${brianVerification.verifiedAt || 'Not verified'}`);
    } else {
      console.log('❌ Brian\'s verification NOT found in admin panel');
      console.log('\nCurrent registrations:');
      data.registrations.forEach((reg, index) => {
        console.log(`${index + 1}. ${reg.user.email} - ${reg.verified ? 'VERIFIED' : 'PENDING'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBrianStatus();
