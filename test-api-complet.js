#!/usr/bin/env node

/**
 * Test complet des APIs pour valider le fonctionnement avant déploiement Vercel
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

const tests = [
  {
    name: 'Debug Endpoint',
    url: '/api/debug/',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['env', 'database', 'prisma']
  },
  {
    name: 'Services Endpoint',
    url: '/api/services/',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['length'] // Should be an array
  },
  {
    name: 'Test DB Endpoint',
    url: '/api/test-db/',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['message']
  }
];

async function runTest(test) {
  try {
    console.log(`🧪 Testing ${test.name}...`);
    
    const response = await axios({
      method: test.method,
      url: `${BASE_URL}${test.url}`,
      timeout: 10000
    });

    if (response.status === test.expectedStatus) {
      console.log(`✅ ${test.name}: Status OK (${response.status})`);
      
      if (test.expectedFields) {
        const hasAllFields = test.expectedFields.every(field => {
          if (field === 'length' && Array.isArray(response.data)) {
            return response.data.length > 0;
          }
          return response.data.hasOwnProperty(field);
        });
        
        if (hasAllFields) {
          console.log(`✅ ${test.name}: All expected fields present`);
        } else {
          console.log(`⚠️  ${test.name}: Missing expected fields`);
          console.log(`   Expected: ${test.expectedFields.join(', ')}`);
          console.log(`   Got: ${Object.keys(response.data).join(', ')}`);
        }
      }
      
      // Log specific details for debug endpoint
      if (test.name === 'Debug Endpoint') {
        const data = response.data;
        console.log(`   Database URL: ${data.database?.url_start}...`);
        console.log(`   Service Count: ${data.prisma?.service_count}`);
        console.log(`   Has Error: ${data.prisma?.error ? 'YES' : 'NO'}`);
        console.log(`   Environment: ${data.env?.NODE_ENV}`);
        console.log(`   On Vercel: ${data.env?.VERCEL || 'NO'}`);
      }
      
      // Log specific details for services endpoint
      if (test.name === 'Services Endpoint') {
        console.log(`   Services found: ${response.data.length}`);
        if (response.data.length > 0) {
          console.log(`   First service: ${response.data[0].name}`);
        }
      }
      
      return true;
    } else {
      console.log(`❌ ${test.name}: Wrong status (expected ${test.expectedStatus}, got ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${test.name}: Failed`);
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

async function runAllTests() {
  console.log(`🚀 Running API tests against ${BASE_URL}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await runTest(test);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log(`📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log(`\n🎉 All tests passed! API is ready for deployment.`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Some tests failed. Check the issues before deploying.`);
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});