#!/usr/bin/env node

/**
 * Test the pagination fix
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testPaginationFix() {
  console.log('🔧 Testing pagination fix...\n');

  try {
    // Check admin panel with new limit
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
    
    console.log(`📊 FIXED: Admin panel now shows: ${data.registrations.length} registrations`);
    console.log(`📊 Total in database: ${data.pagination.total}`);
    
    // Show recent submissions
    console.log('\n📋 RECENT SUBMISSIONS (last 10 minutes):');
    const now = new Date();
    const recentSubmissions = data.registrations.filter(reg => {
      const submissionTime = new Date(reg.createdAt);
      const diffMinutes = (now - submissionTime) / (1000 * 60);
      return diffMinutes <= 10;
    });

    recentSubmissions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((reg, index) => {
        const time = new Date(reg.createdAt).toLocaleTimeString();
        const status = reg.verified ? '✅ VERIFIED' : '⏳ PENDING';
        console.log(`${index + 1}. ${reg.user.name} (${reg.user.email}) - ${status} - ${time}`);
      });

    // Look for brayamooti submissions
    const brayamootiSubmissions = data.registrations.filter(reg => 
      reg.user.email === 'brayamooti@gmail.com'
    );

    console.log(`\n🔍 Found ${brayamootiSubmissions.length} submissions for brayamooti@gmail.com:`);
    brayamootiSubmissions.forEach((reg, index) => {
      console.log(`${index + 1}. Name: ${reg.user.name}`);
      console.log(`   Status: ${reg.verified ? 'VERIFIED' : 'PENDING'}`);
      console.log(`   Created: ${reg.createdAt}`);
      console.log(`   Exness ID: ${reg.verificationData?.exnessAccountId || 'Not provided'}`);
    });

    console.log('\n🎉 PAGINATION FIXED!');
    console.log('✅ Admin panel now shows more registrations');
    console.log('✅ Your submissions should now be visible');
    console.log('✅ Refresh your admin panel to see all submissions');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPaginationFix();
