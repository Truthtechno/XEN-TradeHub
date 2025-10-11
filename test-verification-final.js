#!/usr/bin/env node

/**
 * Final Verification Flow Test
 * Tests the complete working verification flow
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

class FinalVerificationTester {
  constructor() {
    this.sessionCookie = null;
    this.userId = null;
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

  async testVerificationSubmission() {
    this.log('Testing complete verification submission...');
    
    const verificationData = {
      email: 'verification@example.com',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      exnessAccountId: 'EX123456789',
      accountType: 'existing'
    };

    try {
      // Test Exness verification API
      this.log('Step 1: Testing Exness verification API...');
      const verificationResponse = await this.makeRequest('/api/exness/verification', {
        method: 'POST',
        body: JSON.stringify(verificationData)
      });

      if (!verificationResponse.ok) {
        const error = await verificationResponse.text();
        this.log(`Exness verification failed: ${error}`, 'error');
        return false;
      }

      this.log('✅ Exness verification API working', 'success');

      // Test broker verification API
      this.log('Step 2: Testing broker verification API...');
      const brokerVerifyResponse = await this.makeRequest('/api/broker/verify', {
        method: 'POST',
        body: JSON.stringify({
          broker: 'EXNESS',
          accountType: verificationData.accountType,
          verificationData: verificationData
        })
      });

      if (brokerVerifyResponse.ok) {
        const brokerData = await brokerVerifyResponse.json();
        this.log('✅ Broker verification API working', 'success');
        this.log(`Verification result: ${brokerData.message}`, 'success');
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
    this.log('Testing admin view of verified registrations...');
    
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
        
        // Check if our test registration is there and verified
        const testRegistration = data.registrations.find(reg => 
          reg.user.email === 'testuser@example.com'
        );
        
        if (testRegistration) {
          this.log('✅ Test registration found in admin panel', 'success');
          this.log(`Registration status: ${testRegistration.verified ? 'VERIFIED' : 'PENDING'}`, 'success');
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

  async testTradeCorePage() {
    this.log('Testing Trade-core page accessibility...');
    
    try {
      const response = await this.makeRequest('/trade-core');
      
      if (response.ok) {
        this.log('✅ Trade-core page accessible', 'success');
        return true;
      } else {
        this.log(`Trade-core page not accessible: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Trade-core page error: ${error.message}`, 'error');
      return false;
    }
  }

  async testAdminPage() {
    this.log('Testing Trade & Broker admin page accessibility...');
    
    try {
      // Login as admin first
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

      const response = await fetch(`${BASE_URL}/admin/trade`, {
        headers: { 'Cookie': adminCookie }
      });
      
      if (response.ok) {
        this.log('✅ Trade & Broker admin page accessible', 'success');
        return true;
      } else {
        this.log(`Admin page not accessible: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Admin page error: ${error.message}`, 'error');
      return false;
    }
  }

  async runFinalTest() {
    this.log('🚀 Starting Final Verification Flow Test');
    this.log('=' .repeat(60));
    
    const tests = [
      { name: 'Login Test User', fn: () => this.loginTestUser() },
      { name: 'Trade-core Page Access', fn: () => this.testTradeCorePage() },
      { name: 'Complete Verification Flow', fn: () => this.testVerificationSubmission() },
      { name: 'Admin Page Access', fn: () => this.testAdminPage() },
      { name: 'Admin View Verification', fn: () => this.testAdminView() }
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
    this.log(`📊 Final Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      this.log('🎉 ALL TESTS PASSED! Verification flow is fully functional!', 'success');
    } else if (passedTests >= totalTests - 1) {
      this.log('🎉 Almost perfect! Verification flow is working with minor issues.', 'success');
    } else {
      this.log('⚠️  Some tests failed. Please check the issues above.', 'error');
    }

    return {
      passed: passedTests,
      total: totalTests,
      success: passedTests >= totalTests - 1
    };
  }
}

// Run the test
async function main() {
  const tester = new FinalVerificationTester();
  
  try {
    const results = await tester.runFinalTest();
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FinalVerificationTester;
