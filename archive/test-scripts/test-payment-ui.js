#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function testPageContent(pageName, url) {
  console.log(`\n🔍 Testing ${pageName} page...`);
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Check for payment-related elements
    const hasPaymentForm = html.includes('Mock Payment Gateway') || 
                          html.includes('StripePaymentForm') || 
                          html.includes('payment') ||
                          html.includes('MockPaymentForm');
    
    const hasRegisterButton = html.includes('Register') || 
                             html.includes('REGISTER') ||
                             html.includes('Purchase') ||
                             html.includes('Subscribe');
    
    const hasPaymentAmount = html.includes('$') || 
                            html.includes('USD') ||
                            html.includes('price');
    
    console.log(`📄 Page loaded: ${response.ok ? '✅' : '❌'}`);
    console.log(`💳 Has payment form: ${hasPaymentForm ? '✅' : '❌'}`);
    console.log(`🔘 Has register button: ${hasRegisterButton ? '✅' : '❌'}`);
    console.log(`💰 Has payment amount: ${hasPaymentAmount ? '✅' : '❌'}`);
    
    // Check for specific payment components
    if (html.includes('Mock Payment Gateway')) {
      console.log('✅ Mock payment gateway detected');
    }
    
    if (html.includes('StripePaymentForm')) {
      console.log('✅ Stripe payment form detected');
    }
    
    if (html.includes('MockPaymentForm')) {
      console.log('✅ Mock payment form detected');
    }
    
    return {
      success: response.ok,
      hasPaymentForm,
      hasRegisterButton,
      hasPaymentAmount
    };
    
  } catch (error) {
    console.log(`❌ Error loading ${pageName}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Testing Payment UI on All Pages');
  console.log('=' .repeat(60));
  
  const pages = [
    { name: 'One-on-One Mentorship', url: `${BASE_URL}/one-on-one` },
    { name: 'Academy', url: `${BASE_URL}/academy` },
    { name: 'Resources', url: `${BASE_URL}/resources` },
    { name: 'Signals', url: `${BASE_URL}/signals` },
    { name: 'Events', url: `${BASE_URL}/events` },
    { name: 'Market Analysis', url: `${BASE_URL}/market-analysis` }
  ];
  
  const results = {};
  
  for (const page of pages) {
    results[page.name] = await testPageContent(page.name, page.url);
  }
  
  // Summary
  console.log('\n📋 UI TEST SUMMARY');
  console.log('=' .repeat(60));
  
  Object.entries(results).forEach(([pageName, result]) => {
    if (result.success) {
      const paymentWorking = result.hasPaymentForm && result.hasRegisterButton;
      const status = paymentWorking ? '✅ PASS' : '⚠️  PARTIAL';
      console.log(`${status} ${pageName}`);
      
      if (!result.hasPaymentForm) {
        console.log('   ⚠️  No payment form detected');
      }
      if (!result.hasRegisterButton) {
        console.log('   ⚠️  No register button detected');
      }
    } else {
      console.log(`❌ FAIL ${pageName}`);
    }
  });
  
  const passedTests = Object.values(results).filter(r => r.success && r.hasPaymentForm && r.hasRegisterButton).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} pages have working payment UI`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All payment UIs are working correctly!');
  } else {
    console.log('⚠️  Some pages need attention for payment UI.');
  }
}

main().catch(console.error);
