#!/usr/bin/env node

/**
 * Quick verification to show admin can see user data
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function verifyAdminCanSeeData() {
  console.log('🔍 Verifying admin can see user verification data...\n');

  try {
    // Login as admin
    const adminResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password'
      })
    });

    if (!adminResponse.ok) {
      console.log('❌ Failed to login as admin');
      return;
    }

    const adminData = await adminResponse.json();
    const adminCookie = `auth-token=${adminData.token}`;

    // Fetch registrations
    const registrationsResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
      headers: { 'Cookie': adminCookie }
    });

    if (!registrationsResponse.ok) {
      console.log('❌ Failed to fetch registrations');
      return;
    }

    const data = await registrationsResponse.json();
    
    console.log(`📊 Total registrations found: ${data.registrations.length}\n`);
    
    // Show all registrations
    console.log('📋 All User Verifications:');
    console.log('=' .repeat(80));
    
    data.registrations.forEach((reg, index) => {
      console.log(`${index + 1}. User: ${reg.user.name}`);
      console.log(`   Email: ${reg.user.email}`);
      console.log(`   Broker: ${reg.broker}`);
      console.log(`   Status: ${reg.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   Verified At: ${reg.verifiedAt || 'Not verified'}`);
      console.log(`   Registered: ${reg.registered}`);
      console.log('-'.repeat(80));
    });

    // Count verified vs pending
    const verified = data.registrations.filter(reg => reg.verified).length;
    const pending = data.registrations.filter(reg => !reg.verified).length;
    
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Verified: ${verified}`);
    console.log(`   ⏳ Pending: ${pending}`);
    console.log(`   📊 Total: ${data.registrations.length}`);

    console.log('\n🎉 SUCCESS: Admin can see all user verification data!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyAdminCanSeeData();
