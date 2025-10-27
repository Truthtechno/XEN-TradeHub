#!/usr/bin/env node

/**
 * Comprehensive Verification Flow Test
 * Tests the complete flow from Trade-core page to Trade & Broker admin page
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password',
  name: 'Test Admin User'
};

const VERIFICATION_DATA = {
  email: 'verification@example.com',
  fullName: 'John Doe',
  phoneNumber: '+1234567890',
  exnessAccountId: 'EX123456789',
  accountType: 'existing'
};

class VerificationFlowTester {
  constructor() {
    this.sessionCookie = null;
    this.testResults = [];
    this.verificationId = null;
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

  async testUserAuthentication() {
    this.log('Testing user authentication...');
    
    try {
      // Test login using the custom login API
      const loginResponse = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        this.log('User authentication successful', 'success');
        
        // Store the token for subsequent requests
        if (loginData.token) {
          this.sessionCookie = `auth-token=${loginData.token}`;
        }
        
        return true;
      } else {
        this.log('User authentication failed, attempting to create test user...');
        
        // Try to create user using the register API
        const signupResponse = await this.makeRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            firstName: 'Test',
            lastName: 'User',
            email: TEST_USER.email,
            whatsappNumber: '+1234567890',
            password: TEST_USER.password,
            country: 'US'
          })
        });

        if (signupResponse.ok) {
          this.log('Test user created successfully', 'success');
          
          // Try to login with the new user
          const retryLoginResponse = await this.makeRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: TEST_USER.email,
              password: TEST_USER.password
            })
          });
          
          if (retryLoginResponse.ok) {
            const loginData = await retryLoginResponse.json();
            if (loginData.token) {
              this.sessionCookie = `auth-token=${loginData.token}`;
            }
            return true;
          }
        } else {
          const error = await signupResponse.text();
          this.log(`Failed to create test user: ${error}`, 'error');
          return false;
        }
      }
    } catch (error) {
      this.log(`Authentication error: ${error.message}`, 'error');
      return false;
    }
  }

  async testTradeCorePageAccess() {
    this.log('Testing Trade-core page access...');
    
    try {
      const response = await this.makeRequest('/trade-core');
      
      if (response.ok) {
        this.log('Trade-core page accessible', 'success');
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

  async testVerificationFormSubmission() {
    this.log('Testing verification form submission...');
    
    try {
      // Test Exness verification API
      const verificationResponse = await this.makeRequest('/api/exness/verification', {
        method: 'POST',
        body: JSON.stringify(VERIFICATION_DATA)
      });

      const verificationResult = await verificationResponse.json();
      
      if (verificationResponse.ok && verificationResult.success) {
        this.log('Exness verification API working', 'success');
        this.verificationId = verificationResult.verificationId;
        
        // Test broker verification API
        const brokerVerifyResponse = await this.makeRequest('/api/broker/verify', {
          method: 'POST',
          body: JSON.stringify({
            broker: 'EXNESS',
            accountType: VERIFICATION_DATA.accountType,
            verificationData: VERIFICATION_DATA
          })
        });

        const brokerResult = await brokerVerifyResponse.json();
        
        if (brokerVerifyResponse.ok && brokerResult.success) {
          this.log('Broker verification API working', 'success');
          this.registrationId = brokerResult.registrationId;
          return true;
        } else {
          this.log(`Broker verification failed: ${brokerResult.error}`, 'error');
          return false;
        }
      } else {
        this.log(`Exness verification failed: ${verificationResult.error}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Verification submission error: ${error.message}`, 'error');
      return false;
    }
  }

  async testAdminPageAccess() {
    this.log('Testing Trade & Broker admin page access...');
    
    try {
      const response = await this.makeRequest('/admin/trade');
      
      if (response.ok) {
        this.log('Trade & Broker admin page accessible', 'success');
        return true;
      } else {
        this.log(`Trade & Broker admin page not accessible: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Admin page error: ${error.message}`, 'error');
      return false;
    }
  }

  async testRegistrationsAPI() {
    this.log('Testing registrations API...');
    
    try {
      const response = await this.makeRequest('/api/admin/trade/registrations');
      const data = await response.json();
      
      if (response.ok) {
        this.log(`Registrations API working - found ${data.registrations?.length || 0} registrations`, 'success');
        
        // Check if our test registration is present
        const testRegistration = data.registrations?.find(reg => 
          reg.user.email === VERIFICATION_DATA.email
        );
        
        if (testRegistration) {
          this.log('Test registration found in admin panel', 'success');
          return true;
        } else {
          this.log('Test registration not found in admin panel', 'error');
          return false;
        }
      } else {
        this.log(`Registrations API failed: ${data.error}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Registrations API error: ${error.message}`, 'error');
      return false;
    }
  }

  async testVerificationStatusCheck() {
    this.log('Testing verification status check...');
    
    try {
      if (!this.verificationId) {
        this.log('No verification ID available for status check', 'error');
        return false;
      }

      const response = await this.makeRequest(`/api/exness/verification?id=${this.verificationId}`);
      const data = await response.json();
      
      if (response.ok) {
        this.log(`Verification status check working - Status: ${data.status}`, 'success');
        return true;
      } else {
        this.log(`Verification status check failed: ${data.error}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Verification status check error: ${error.message}`, 'error');
      return false;
    }
  }

  async testDatabaseConsistency() {
    this.log('Testing database consistency...');
    
    try {
      // Test if we can query broker registrations directly
      const response = await this.makeRequest('/api/admin/trade/registrations');
      const data = await response.json();
      
      if (response.ok && data.registrations) {
        // Check data structure
        const registration = data.registrations[0];
        if (registration) {
          const hasRequiredFields = registration.user && 
                                   registration.user.name && 
                                   registration.user.email &&
                                   registration.broker &&
                                   registration.link;
          
          if (hasRequiredFields) {
            this.log('Database structure is consistent', 'success');
            return true;
          } else {
            this.log('Database structure is missing required fields', 'error');
            return false;
          }
        } else {
          this.log('No registrations found to test structure', 'error');
          return false;
        }
      } else {
        this.log('Failed to fetch registrations for consistency check', 'error');
        return false;
      }
    } catch (error) {
      this.log(`Database consistency error: ${error.message}`, 'error');
      return false;
    }
  }

  async runComprehensiveTest() {
    this.log('🚀 Starting Comprehensive Verification Flow Test');
    this.log('=' .repeat(60));
    
    const tests = [
      { name: 'User Authentication', fn: () => this.testUserAuthentication() },
      { name: 'Trade-core Page Access', fn: () => this.testTradeCorePageAccess() },
      { name: 'Verification Form Submission', fn: () => this.testVerificationFormSubmission() },
      { name: 'Admin Page Access', fn: () => this.testAdminPageAccess() },
      { name: 'Registrations API', fn: () => this.testRegistrationsAPI() },
      { name: 'Verification Status Check', fn: () => this.testVerificationStatusCheck() },
      { name: 'Database Consistency', fn: () => this.testDatabaseConsistency() }
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
      this.log('🎉 All tests passed! Verification flow is working correctly.', 'success');
    } else {
      this.log('⚠️  Some tests failed. Please check the issues above.', 'error');
    }

    return {
      passed: passedTests,
      total: totalTests,
      success: passedTests === totalTests
    };
  }

  async generateTestReport() {
    this.log('\n📋 Generating Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      testUser: TEST_USER.email,
      verificationData: VERIFICATION_DATA,
      results: this.testResults
    };

    console.log('\n📄 Test Report:');
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }
}

// Run the test
async function main() {
  const tester = new VerificationFlowTester();
  
  try {
    const results = await tester.runComprehensiveTest();
    await tester.generateTestReport();
    
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = VerificationFlowTester;
