// Test script for ML Admin features
// Run with: node test-ml-admin.js

const BASE_URL = 'http://localhost:5000';

// Test credentials - update with your admin user
const ADMIN_CREDENTIALS = {
  email: 'admin@cosmic.com',
  password: 'Admin123' // Updated to match actual admin password
};

let authToken = '';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`   API Error: ${error.message}`);
    return { status: 0, data: { success: false, error: error.message } };
  }
}

// Test 1: Login as admin
async function testLogin() {
  console.log('\n🔐 Test 1: Admin Login');
  console.log('─'.repeat(50));
  
  const result = await apiCall('/api/auth/login', 'POST', ADMIN_CREDENTIALS);
  
  if (result.data.success && result.data.data && result.data.data.accessToken) {
    authToken = result.data.data.accessToken;
    console.log('✅ Login successful!');
    console.log(`   User: ${result.data.data.user.email}`);
    console.log(`   Role: ${result.data.data.user.role}`);
    return true;
  } else {
    console.log('❌ Login failed:', result.data.error || 'Unknown error');
    console.log('   Response:', JSON.stringify(result.data, null, 2));
    return false;
  }
}

// Test 2: Create ML Engineer user
async function testCreateMLUser() {
  console.log('\n👤 Test 2: Create ML Engineer User');
  console.log('─'.repeat(50));
  
  const newUser = {
    email: `ml_engineer_${Date.now()}@cosmic.com`,
    password: 'Password123!',
    role: 'ml_engineer',
    name: 'Test ML Engineer'
  };
  
  const result = await apiCall('/api/users/create-admin', 'POST', newUser);
  
  if (result.data.success) {
    console.log('✅ ML Engineer user created!');
    console.log(`   Email: ${result.data.data.email}`);
    console.log(`   Role: ${result.data.data.role}`);
    console.log(`   ID: ${result.data.data._id}`);
    return result.data.data;
  } else {
    console.log('❌ Failed to create user:', result.data.error);
    console.log('   Details:', JSON.stringify(result.data, null, 2));
    return null;
  }
}

// Test 3: Create Analytics Admin user
async function testCreateAnalyticsAdmin() {
  console.log('\n📊 Test 3: Create Analytics Admin User');
  console.log('─'.repeat(50));
  
  const newUser = {
    email: `analytics_admin_${Date.now()}@cosmic.com`,
    password: 'Password123!',
    role: 'analytics_admin',
    name: 'Test Analytics Admin'
  };
  
  const result = await apiCall('/api/users/create-admin', 'POST', newUser);
  
  if (result.data.success) {
    console.log('✅ Analytics Admin user created!');
    console.log(`   Email: ${result.data.data.email}`);
    console.log(`   Role: ${result.data.data.role}`);
    console.log(`   ID: ${result.data.data._id}`);
    return result.data.data;
  } else {
    console.log('❌ Failed to create user:', result.data.error);
    console.log('   Details:', JSON.stringify(result.data, null, 2));
    return null;
  }
}

// Test 4: Get user statistics
async function testUserStats() {
  console.log('\n📈 Test 4: Get User Statistics');
  console.log('─'.repeat(50));
  
  const result = await apiCall('/api/users/stats');
  
  if (result.data.success) {
    console.log('✅ User statistics retrieved!');
    console.log('   User roles breakdown:');
    console.log(`   - Users: ${result.data.data.user || 0}`);
    console.log(`   - Admins: ${result.data.data.admin || 0}`);
    console.log(`   - ML Engineers: ${result.data.data.ml_engineer || 0}`);
    console.log(`   - Analytics Admins: ${result.data.data.analytics_admin || 0}`);
    return result.data.data;
  } else {
    console.log('❌ Failed to get stats:', result.data.error);
    return null;
  }
}

// Test 5: Check ML service health
async function testMLHealth() {
  console.log('\n🏥 Test 5: ML Service Health Check');
  console.log('─'.repeat(50));
  
  const result = await apiCall('/api/ml/health');
  
  if (result.data.status === 'healthy') {
    console.log('✅ ML service is healthy!');
    console.log('   Service statuses:');
    if (result.data.mlService?.services) {
      Object.entries(result.data.mlService.services).forEach(([service, status]) => {
        console.log(`   - ${service}: ${status}`);
      });
    }
    return true;
  } else {
    console.log('❌ ML service is unhealthy');
    return false;
  }
}

// Test 6: Trigger data sync
async function testDataSync() {
  console.log('\n🔄 Test 6: Data Synchronization');
  console.log('─'.repeat(50));
  
  const result = await apiCall('/api/ml/sync', 'POST');
  
  if (result.data.success) {
    console.log('✅ Data sync triggered!');
    if (result.data.totalSynced !== undefined) {
      console.log(`   Items synced: ${result.data.totalSynced}`);
      console.log(`   Failed: ${result.data.totalFailed || 0}`);
    }
    return true;
  } else {
    console.log('❌ Sync failed:', result.data.error);
    return false;
  }
}

// Test 7: List ML documents
async function testListDocuments() {
  console.log('\n📄 Test 7: List ML Documents');
  console.log('─'.repeat(50));
  
  const result = await apiCall('/api/ml/documents');
  
  if (result.data.success) {
    const docs = result.data.data.results || [];
    console.log(`✅ Retrieved ${docs.length} documents`);
    if (docs.length > 0) {
      console.log('\n   Sample document:');
      const doc = docs[0];
      console.log(`   - ID: ${doc.id}`);
      console.log(`   - Title: ${doc.title}`);
      console.log(`   - Type: ${doc.document_type}`);
      console.log(`   - Status: ${doc.embedding_status}`);
    }
    return docs;
  } else {
    console.log('❌ Failed to list documents:', result.data.error);
    return [];
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n');
  console.log('═'.repeat(50));
  console.log('  🚀 ML Admin Feature Test Suite');
  console.log('═'.repeat(50));
  
  try {
    // Login first
    const loggedIn = await testLogin();
    if (!loggedIn) {
      console.log('\n❌ Cannot proceed without authentication');
      return;
    }

    // User management tests
    await testCreateMLUser();
    await testCreateAnalyticsAdmin();
    await testUserStats();

    // ML service tests
    await testMLHealth();
    await testDataSync();
    await testListDocuments();

    console.log('\n');
    console.log('═'.repeat(50));
    console.log('  ✅ All tests completed!');
    console.log('═'.repeat(50));
    console.log('\n📝 Next steps:');
    console.log('   1. Login to the app with one of the new admin users');
    console.log('   2. Navigate to the ML Admin dashboard');
    console.log('   3. Check the Users tab to see created users');
    console.log('   4. Try the Data Sync tab to sync more data');
    console.log('   5. View documents in the Documents tab');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }
}

// Run tests
runAllTests();
