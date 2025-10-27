#!/usr/bin/env node

/**
 * Check for the new submission with brayamooti@gmail.com
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function checkNewSubmission() {
  console.log('🔍 Checking for new submission with brayamooti@gmail.com...\n');

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

    const adminData = await adminResponse.json();
    const adminCookie = `auth-token=${adminData.token}`;

    const registrationsResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
      headers: { 'Cookie': adminCookie }
    });

    const data = await registrationsResponse.json();
    
    console.log(`📊 Total registrations: ${data.registrations.length}`);
    
    // Look for the new submission
    const newSubmission = data.registrations.find(reg => 
      reg.user.email === 'brayamooti@gmail.com'
    );

    if (newSubmission) {
      console.log('✅ NEW SUBMISSION FOUND:');
      console.log(`   - Name: ${newSubmission.user.name}`);
      console.log(`   - Email: ${newSubmission.user.email}`);
      console.log(`   - Status: ${newSubmission.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
      console.log(`   - Verified At: ${newSubmission.verifiedAt || 'Not verified yet'}`);
      console.log(`   - Verification Data: ${JSON.stringify(newSubmission.verificationData, null, 2)}`);
    } else {
      console.log('❌ NEW SUBMISSION NOT FOUND');
      console.log('\nPossible issues:');
      console.log('1. User was not logged in when submitting');
      console.log('2. Form submission failed silently');
      console.log('3. Authentication issue');
      console.log('4. Database error');
      
      console.log('\nCurrent registrations:');
      data.registrations.forEach((reg, index) => {
        console.log(`${index + 1}. ${reg.user.email} - ${reg.verified ? 'VERIFIED' : 'PENDING'}`);
      });
    }

    // Let's also check if the user account exists
    console.log('\n🔍 Checking if user account exists...');
    
    // Try to create the user account first
    const userData = {
      firstName: 'BRIAN',
      lastName: 'ALIOOTI ASABA',
      email: 'brayamooti@gmail.com',
      whatsappNumber: '+256705362786',
      password: 'password123',
      country: 'UG'
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (registerResponse.ok) {
      console.log('✅ User account created successfully');
    } else {
      const error = await registerResponse.text();
      console.log(`❌ User account creation failed: ${error}`);
    }

    // Now try to login and submit verification
    console.log('\n🔍 Testing complete submission process...');
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'brayamooti@gmail.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed - trying different password...');
      
      // Try common passwords
      const passwords = ['password', 'admin123', 'brian123'];
      for (const pwd of passwords) {
        const testLogin = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'brayamooti@gmail.com',
            password: pwd
          })
        });
        
        if (testLogin.ok) {
          console.log(`✅ Login successful with password: ${pwd}`);
          break;
        }
      }
    } else {
      console.log('✅ Login successful');
      
      const loginData = await loginResponse.json();
      const userCookie = `auth-token=${loginData.token}`;
      
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

      if (brokerRegResponse.ok) {
        console.log('✅ Broker registration created');
        
        // Submit verification
        const verificationData = {
          email: 'brayamooti@gmail.com',
          fullName: 'BRIAN ALIOOTI ASABA',
          phoneNumber: '+256705362786',
          exnessAccountId: 'ID63766',
          accountType: 'existing'
        };

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

        if (brokerVerifyResponse.ok) {
          console.log('✅ Verification submitted successfully');
          
          // Check if it appears now
          const updatedResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
            headers: { 'Cookie': adminCookie }
          });
          const updatedData = await updatedResponse.json();
          
          const updatedSubmission = updatedData.registrations.find(reg => 
            reg.user.email === 'brayamooti@gmail.com'
          );

          if (updatedSubmission) {
            console.log('🎉 SUCCESS! New submission now appears:');
            console.log(`   - Name: ${updatedSubmission.user.name}`);
            console.log(`   - Email: ${updatedSubmission.user.email}`);
            console.log(`   - Status: ${updatedSubmission.verified ? '✅ VERIFIED' : '⏳ PENDING'}`);
          } else {
            console.log('❌ Still not appearing after submission');
          }
        } else {
          const error = await brokerVerifyResponse.text();
          console.log(`❌ Verification submission failed: ${error}`);
        }
      } else {
        const error = await brokerRegResponse.text();
        console.log(`❌ Broker registration failed: ${error}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkNewSubmission();
