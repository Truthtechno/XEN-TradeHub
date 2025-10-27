#!/usr/bin/env node

/**
 * Complete Verification Flow Test
 * Tests the entire flow from user registration to verification
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

class CompleteVerificationTester {
  constructor() {
    this.sessionCookie = null;
    this.userId = null;
    this.brokerLinkId = null;
    this.registrationId = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.sessionCookie && { 'Cookie': this.sessionCookie })
      }
    };

    const response = await fetch(`${BASE_URL}${url}`, {
      ...defaultOptions,
      ...options,
      headers: { ...defaultOptions.headers, ...options.headers }
    });

    // Extract session cookie if present
    const setCookie = response.headers.get('set-cookie');
    if (setCookie && !this.sessionCookie) {
      this.sessionCookie = setCookie;
    }

    return response;
  }

  async createTestUser() {
    this.log('Creating test user...');
    
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      whatsappNumber: '+1234567890',
      password: 'password123',
      country: 'US'
    };

    try {
      const response = await this.makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        this.userId = data.user.id;
        this.log('Test user created successfully', 'success');
        return true;
      } else {
        const error = await response.text();
        this.log(`Failed to create test user: ${error}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Error creating test user: ${error.message}`, 'error');
      return false;
    }
  }

  async loginTestUser() {
    this.log('Logging in test user...');
    
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'password123'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.userId = data.user.id;
        if (data.token) {
          this.sessionCookie = `auth-token=${data.token}`;
        }
        this.log('User logged in successfully', 'success');
        return true;
      } else {
        const error = await response.text();
        this.log(`Login failed: ${error}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Login error: ${error.message}`, 'error');
      return false;
    }
  }

  async createBrokerLink() {
    this.log('Creating broker link...');
    
    try {
      // First, get admin user for creating broker link
      const adminResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password'
        })
      });

      if (!adminResponse.ok) {
        this.log('Failed to login as admin', 'error');
        return false;
      }

      const adminData = await adminResponse.json();
      const adminCookie = `auth-token=${adminData.token}`;

      // Create broker link
      const linkResponse = await fetch(`${BASE_URL}/api/admin/trade/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': adminCookie
        },
        body: JSON.stringify({
          name: 'Test Broker Link',
          url: 'https://test-broker.com/ref/test123',
          isActive: true
        })
      });

      if (linkResponse.ok) {
        const linkData = await linkResponse.json();
        this.brokerLinkId = linkData.link.id;
        this.log('Broker link created successfully', 'success');
        return true;
      } else {
        const error = await linkResponse.text();
        this.log(`Failed to create broker link: ${error}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Error creating broker link: ${error.message}`, 'error');
      return false;
    }
  }

  async createBrokerRegistration() {
    this.log('Creating broker registration...');
    
    try {
      const response = await this.makeRequest('/api/broker/register', {
        method: 'POST',
        body: JSON.stringify({
          broker: 'EXNESS',
          accountType: 'existing'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.registrationId = data.registration.id;
        this.log('Broker registration created successfully', 'success');
        return true;
      } else {
        const error = await response.text();
        this.log(`Failed to create broker registration: ${error}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Error creating broker registration: ${error.message}`, 'error');
      return false;
    }
  }

  async testVerificationSubmission() {
    this.log('Testing verification submission...');
    
    const verificationData = {
      email: 'verification@example.com',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      exnessAccountId: 'EX123456789',
      accountType: 'existing'
    };

    try {
      // Test Exness verification API
      const verificationResponse = await this.makeRequest('/api/exness/verification', {
        method: 'POST',
        body: JSON.stringify(verificationData)
      });

      if (!verificationResponse.ok) {
        const error = await verificationResponse.text();
        this.log(`Exness verification failed: ${error}`, 'error');
        return false;
      }

      this.log('Exness verification API working', 'success');

      // Test broker verification API
      const brokerVerifyResponse = await this.makeRequest('/api/broker/verify', {
        method: 'POST',
        body: JSON.stringify({
          broker: 'EXNESS',
          accountType: verificationData.accountType,
          verificationData: verificationData
        })
      });

      if (brokerVerifyResponse.ok) {
        this.log('Broker verification API working', 'success');
        return true;
      } else {
        const error = await brokerVerifyResponse.text();
        this.log(`Broker verification failed: ${error}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Verification submission error: ${error.message}`, 'error');
      return false;
    }
  }

  async testAdminView() {
    this.log('Testing admin view of registrations...');
    
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
        this.log('Failed to login as admin', 'error');
        return false;
      }

      const adminData = await adminResponse.json();
      const adminCookie = `auth-token=${adminData.token}`;

      // Check registrations
      const registrationsResponse = await fetch(`${BASE_URL}/api/admin/trade/registrations`, {
        headers: { 'Cookie': adminCookie }
      });

      if (registrationsResponse.ok) {
        const data = await registrationsResponse.json();
        this.log(`Found ${data.registrations.length} registrations in admin panel`, 'success');
        
        // Check if our test registration is there
        const testRegistration = data.registrations.find(reg => 
          reg.user.email === 'testuser@example.com'
        );
        
        if (testRegistration) {
          this.log('Test registration found in admin panel', 'success');
          return true;
        } else {
          this.log('Test registration not found in admin panel', 'error');
          return false;
        }
      } else {
        const error = await registrationsResponse.text();
        this.log(`Failed to fetch registrations: ${error}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Admin view error: ${error.message}`, 'error');
      return false;
    }
  }

  async runCompleteTest() {
    this.log('🚀 Starting Complete Verification Flow Test');
    this.log('=' .repeat(60));
    
    const tests = [
      { name: 'Create Test User', fn: () => this.createTestUser() },
      { name: 'Login Test User', fn: () => this.loginTestUser() },
      { name: 'Create Broker Link', fn: () => this.createBrokerLink() },
      { name: 'Create Broker Registration', fn: () => this.createBrokerRegistration() },
      { name: 'Submit Verification', fn: () => this.testVerificationSubmission() },
      { name: 'Check Admin View', fn: () => this.testAdminView() }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      this.log(`\n📋 Running: ${test.name}`);
      try {
        const result = await test.fn();
        if (result) {
          passedTests++;
          this.log(`✅ ${test.name} - PASSED`, 'success');
        } else {
          this.log(`❌ ${test.name} - FAILED`, 'error');
        }
      } catch (error) {
        this.log(`❌ ${test.name} - ERROR: ${error.message}`, 'error');
      }
    }

    this.log('\n' + '=' .repeat(60));
    this.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      this.log('🎉 All tests passed! Complete verification flow is working correctly.', 'success');
    } else {
      this.log('⚠️  Some tests failed. Please check the issues above.', 'error');
    }

    return {
      passed: passedTests,
      total: totalTests,
      success: passedTests === totalTests
    };
  }
}

// Run the test
async function main() {
  const tester = new CompleteVerificationTester();
  
  try {
    const results = await tester.runCompleteTest();
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CompleteVerificationTester;
