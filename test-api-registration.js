/**
 * Direct API Registration Test
 * 
 * This script tests the registration endpoint directly from the browser console.
 * 
 * Usage:
 * 1. Open http://localhost:3000 in your browser
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this script
 * 5. Press Enter
 * 
 * The script will attempt to register a test user and show the full response.
 */

async function testRegistration() {
  console.log('🚀 Testing Registration API Directly...\n');

  const testUser = {
    email: `test${Date.now()}@test.com`,
    password: 'TestPass123',
    name: 'Test User',
    username: `testuser${Date.now()}`
  };

  console.log('📤 Sending registration request with:', {
    ...testUser,
    password: '***' // Don't log password
  });

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(testUser)
    });

    console.log(`📥 Response Status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration Successful!');
      console.log('User Data:', {
        userId: data.data.userId,
        email: data.data.email,
        name: data.data.name,
        username: data.data.username,
        emailVerified: data.data.emailVerified
      });
      console.log('\n💡 You can now try logging in with:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: TestPass123`);
    } else {
      console.error('❌ Registration Failed!');
      console.error('Error:', data.error || data.message);
    }

    return data;

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.error('Details:', error);
  }
}

// Run the test
testRegistration();
