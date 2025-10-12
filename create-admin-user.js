// Script to create initial admin user via API
const axios = require('axios');
const BASE_URL = 'http://localhost:5000';

async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      validateStatus: () => true // Don't throw on any status
    };

    const response = await axios(config);
    return { 
      success: response.status >= 200 && response.status < 300, 
      status: response.status, 
      data: response.data 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createAdminUser() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  🔧 Creating Admin User');
  console.log('═══════════════════════════════════════════════\n');

  // Step 1: Try to register a new admin user
  console.log('📝 Step 1: Registering initial admin user...');
  const registerData = {
    email: 'admin@cosmic.com',
    password: 'admin123',
    profile: {
      name: 'System Administrator',
      isProfileComplete: true
    }
  };

  const registerResult = await apiCall('/api/auth/register', 'POST', registerData);
  
  if (registerResult.success) {
    console.log('✅ User registered successfully!');
    console.log(`   Email: ${registerData.email}`);
    console.log(`   User ID: ${registerResult.data.userId}`);
    console.log(`   Initial Role: ${registerResult.data.user?.role || 'user'}`);
    
    // Step 2: Login to get token
    console.log('\n🔐 Step 2: Logging in...');
    const loginResult = await apiCall('/api/auth/login', 'POST', {
      email: registerData.email,
      password: registerData.password
    });

    if (loginResult.success) {
      const token = loginResult.data.token;
      console.log('✅ Login successful!');
      console.log(`   Token received: ${token.substring(0, 20)}...`);

      // Step 3: Check if we need to manually update role in database
      // (Since normal registration creates 'user' role, we need admin role)
      console.log('\n⚠️  Note: User created with "user" role.');
      console.log('   To grant admin access, you need to:');
      console.log('   1. Access MongoDB directly, or');
      console.log('   2. Use an existing admin account to promote this user');
      console.log('\n   MongoDB command:');
      console.log(`   docker-compose exec mongodb mongosh -u admin -p changeme cosmic_insights --authenticationDatabase admin --eval "db.users.updateOne({email:'admin@cosmic.com'}, {\\$set: {role:'admin', tier:'premium'}})"`);
      
      console.log('\n✅ User creation complete!');
      console.log('\n📋 Credentials:');
      console.log(`   Email: ${registerData.email}`);
      console.log(`   Password: ${registerData.password}`);
      console.log(`   Status: Registered (needs role upgrade to "admin")`);
      
    } else {
      console.log('❌ Login failed:', loginResult.data.message || loginResult.error);
    }
  } else if (registerResult.status === 400 && registerResult.data.message?.includes('already exists')) {
    console.log('ℹ️  User already exists!');
    console.log('   Email: admin@cosmic.com');
    console.log('\n   Trying to login with existing credentials...');
    
    const loginResult = await apiCall('/api/auth/login', 'POST', {
      email: registerData.email,
      password: registerData.password
    });

    if (loginResult.success) {
      console.log('✅ Login successful with existing account!');
      console.log(`   Role: ${loginResult.data.user?.role || 'unknown'}`);
      console.log(`   User ID: ${loginResult.data.user?._id}`);
      
      if (loginResult.data.user?.role !== 'admin') {
        console.log('\n⚠️  User exists but does not have admin role.');
        console.log('   Current role:', loginResult.data.user?.role);
        console.log('\n   To grant admin access, run:');
        console.log(`   docker-compose exec mongodb mongosh -u admin -p changeme cosmic_insights --authenticationDatabase admin --eval "db.users.updateOne({email:'admin@cosmic.com'}, {\\$set: {role:'admin', tier:'premium'}})"`);
      } else {
        console.log('\n✅ User has admin role! Ready to use.');
      }
    } else {
      console.log('❌ Login failed. Password may be incorrect.');
      console.log('   Try resetting the password or creating a new admin user.');
    }
  } else {
    console.log('❌ Registration failed:', registerResult.data.message || registerResult.error);
  }
}

createAdminUser();
