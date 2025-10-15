/**
 * Registration Error Testing Script
 * Tests improved validation error messages
 * 
 * Usage: Copy and paste this entire script into browser console at http://localhost:3000
 */

console.log('🧪 Starting Registration Error Tests...\n');

const API_URL = 'http://localhost:5000/api';

// Test helper function
async function testRegistration(testName, userData, expectedError) {
  console.log(`\n📝 Test: ${testName}`);
  console.log('Sending data:', { ...userData, password: '***' });
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (!response.ok) {
      if (expectedError && data.error.includes(expectedError)) {
        console.log('✅ PASS - Got expected error:', data.error);
      } else {
        console.log('❌ FAIL - Expected error containing:', expectedError);
        console.log('       Got:', data.error);
      }
    } else {
      if (expectedError) {
        console.log('❌ FAIL - Expected error but got success');
      } else {
        console.log('✅ PASS - Registration successful');
      }
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

// Run all tests
(async function runTests() {
  console.log('================================');
  console.log('TESTING ENHANCED ERROR MESSAGES');
  console.log('================================');
  
  // Test 1: Missing name field
  await testRegistration(
    'Missing Name Field',
    {
      email: 'test1@example.com',
      password: 'Test1234',
      // name is missing
    },
    'Name is required'
  );
  
  // Test 2: Missing email field
  await testRegistration(
    'Missing Email Field',
    {
      name: 'Test User',
      password: 'Test1234',
      // email is missing
    },
    'Email is required'
  );
  
  // Test 3: Missing password field
  await testRegistration(
    'Missing Password Field',
    {
      name: 'Test User',
      email: 'test2@example.com',
      // password is missing
    },
    'Password is required'
  );
  
  // Test 4: Invalid email format
  await testRegistration(
    'Invalid Email Format',
    {
      name: 'Test User',
      email: 'not-a-valid-email',
      password: 'Test1234'
    },
    'valid email'
  );
  
  // Test 5: Password too short
  await testRegistration(
    'Password Too Short',
    {
      name: 'Test User',
      email: 'test3@example.com',
      password: 'Test1'
    },
    '8 characters'
  );
  
  // Test 6: Invalid username (with spaces)
  await testRegistration(
    'Invalid Username (spaces)',
    {
      name: 'Test User',
      email: 'test4@example.com',
      password: 'Test1234',
      username: 'invalid username'
    },
    'Username can only contain'
  );
  
  // Test 7: Username too short
  await testRegistration(
    'Username Too Short',
    {
      name: 'Test User',
      email: 'test5@example.com',
      password: 'Test1234',
      username: 'ab'
    },
    '3 characters'
  );
  
  // Test 8: Valid registration
  const timestamp = Date.now();
  await testRegistration(
    'Valid Registration',
    {
      name: 'Test User',
      email: `testuser${timestamp}@example.com`,
      password: 'Test1234',
      username: `testuser${timestamp}`
    },
    null // No error expected
  );
  
  // Test 9: Duplicate email (using the email from test 8)
  await testRegistration(
    'Duplicate Email',
    {
      name: 'Another User',
      email: `testuser${timestamp}@example.com`,
      password: 'Test1234'
    },
    'already'
  );
  
  // Test 10: Duplicate username
  await testRegistration(
    'Duplicate Username',
    {
      name: 'Another User',
      email: `another${timestamp}@example.com`,
      password: 'Test1234',
      username: `testuser${timestamp}`
    },
    'already'
  );
  
  console.log('\n================================');
  console.log('ALL TESTS COMPLETED');
  console.log('================================');
  console.log('\n✅ Check above for PASS/FAIL results');
  console.log('✅ All validation errors should be specific and clear');
  console.log('✅ No generic "Validation failed" messages');
  
})();

// Also test the monitoring service
console.log('\n================================');
console.log('CHECKING MONITORING SERVICE');
console.log('================================');
console.log('⚠️ Monitoring auto-flush should be disabled');
console.log('⚠️ You should see warning in console');
console.log('✅ No 404 errors should appear for /api/api/monitoring/logs');
