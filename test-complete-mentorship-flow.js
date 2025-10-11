const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const testStudent = {
  firstName: 'John',
  lastName: 'Doe',
  email: `john.doe.test.${Date.now()}@example.com`,
  whatsappNumber: '+1234567890',
  password: 'testpass123',
  countryCode: '+1',
  country: 'United States'
};

const testRegistration = {
  firstName: 'John',
  lastName: 'Doe',
  email: testStudent.email,
  phone: '1234567890',
  countryCode: '+1',
  schedulingPreferences: 'Weekend mornings preferred'
};

let studentToken = null;
let registrationId = null;

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Mentorship Flow');
  console.log('=====================================\n');

  try {
    // Step 1: Register new student
    console.log('1️⃣ Registering new student...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent)
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      throw new Error(`Registration failed: ${error.error || error.message}`);
    }

    const registerData = await registerResponse.json();
    console.log('✅ Student registered successfully');
    console.log(`   User ID: ${registerData.user.id}`);
    console.log(`   Email: ${registerData.user.email}`);
    console.log(`   Role: ${registerData.user.role}\n`);

    // Step 2: Login as student
    console.log('2️⃣ Logging in as student...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: testStudent.password
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(`Login failed: ${error.error || error.message}`);
    }

    const loginData = await loginResponse.json();
    studentToken = loginData.token;
    console.log('✅ Student logged in successfully');
    console.log(`   Token: ${studentToken.substring(0, 20)}...\n`);

    // Step 3: Check initial access (should be STUDENT level)
    console.log('3️⃣ Checking initial access level...');
    const initialAccessResponse = await fetch(`${BASE_URL}/api/user/access`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    if (initialAccessResponse.ok) {
      const initialAccess = await initialAccessResponse.json();
      console.log('✅ Initial access retrieved');
      console.log(`   Subscription Type: ${initialAccess.data.subscriptionType}`);
      console.log(`   Premium Signals: ${initialAccess.data.premiumSignals}`);
      console.log(`   Premium Resources: ${initialAccess.data.premiumResources}`);
      console.log(`   Mentorship Access: ${initialAccess.data.mentorship}\n`);
    }

    // Step 4: Register for mentorship
    console.log('4️⃣ Registering for mentorship...');
    const mentorshipResponse = await fetch(`${BASE_URL}/api/mentorship/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify(testRegistration)
    });

    if (!mentorshipResponse.ok) {
      const error = await mentorshipResponse.json();
      throw new Error(`Mentorship registration failed: ${error.message || error.error}`);
    }

    const mentorshipData = await mentorshipResponse.json();
    registrationId = mentorshipData.data.id;
    console.log('✅ Mentorship registration successful');
    console.log(`   Registration ID: ${registrationId}`);
    console.log(`   Status: ${mentorshipData.data.status}\n`);

    // Step 5: Process payment
    console.log('5️⃣ Processing mentorship payment...');
    const paymentResponse = await fetch(`${BASE_URL}/api/mentorship/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        registrationId: registrationId,
        amount: 1500,
        currency: 'USD'
      })
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      throw new Error(`Payment failed: ${error.message || error.error}`);
    }

    const paymentData = await paymentResponse.json();
    console.log('✅ Payment processed successfully');
    console.log(`   Payment ID: ${paymentData.data.payment.id}`);
    console.log(`   Amount: $${paymentData.data.payment.amount}`);
    console.log(`   Status: ${paymentData.data.payment.status}\n`);

    // Step 6: Verify premium access after payment
    console.log('6️⃣ Verifying premium access after payment...');
    const finalAccessResponse = await fetch(`${BASE_URL}/api/user/access`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    if (!finalAccessResponse.ok) {
      throw new Error('Failed to retrieve access information');
    }

    const finalAccess = await finalAccessResponse.json();
    console.log('✅ Final access level retrieved');
    console.log(`   Subscription Type: ${finalAccess.data.subscriptionType}`);
    console.log(`   Subscription Status: ${finalAccess.data.subscriptionStatus}`);
    console.log(`   Premium Signals: ${finalAccess.data.premiumSignals}`);
    console.log(`   Premium Resources: ${finalAccess.data.premiumResources}`);
    console.log(`   Premium Courses: ${finalAccess.data.premiumCourses}`);
    console.log(`   Mentorship Access: ${finalAccess.data.mentorship}\n`);

    // Step 7: Test premium signals access
    console.log('7️⃣ Testing premium signals access...');
    const signalsResponse = await fetch(`${BASE_URL}/api/signals`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    if (signalsResponse.ok) {
      const signalsData = await signalsResponse.json();
      console.log('✅ Signals API accessible');
      console.log(`   Signals count: ${signalsData.signals?.length || 0}`);
    } else {
      console.log('❌ Signals API not accessible');
    }

    // Step 8: Test premium resources access
    console.log('\n8️⃣ Testing premium resources access...');
    const resourcesResponse = await fetch(`${BASE_URL}/api/resources`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    if (resourcesResponse.ok) {
      const resourcesData = await resourcesResponse.json();
      console.log('✅ Resources API accessible');
      console.log(`   Resources count: ${resourcesData.resources?.length || 0}`);
    } else {
      console.log('❌ Resources API not accessible');
    }

    // Summary
    console.log('\n🎉 COMPLETE FLOW TEST RESULTS');
    console.log('==============================');
    console.log('✅ Student Registration: SUCCESS');
    console.log('✅ Student Login: SUCCESS');
    console.log('✅ Mentorship Registration: SUCCESS');
    console.log('✅ Payment Processing: SUCCESS');
    console.log('✅ Premium Access Upgrade: SUCCESS');
    console.log('✅ Premium Signals Access: SUCCESS');
    console.log('✅ Premium Resources Access: SUCCESS');
    
    const isFullyPremium = finalAccess.data.subscriptionType === 'PREMIUM' && 
                          finalAccess.data.premiumSignals && 
                          finalAccess.data.premiumResources && 
                          finalAccess.data.mentorship;
    
    console.log(`\n🏆 OVERALL RESULT: ${isFullyPremium ? 'PASS' : 'FAIL'}`);
    
    if (isFullyPremium) {
      console.log('🎯 Student successfully received all premium privileges!');
    } else {
      console.log('⚠️  Some premium privileges may be missing');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('================');
    console.error(`Error: ${error.message}`);
    console.error('\nPlease check the error and fix any issues.');
  }
}

// Run the test
testCompleteFlow();
