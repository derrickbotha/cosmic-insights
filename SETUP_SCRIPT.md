# Quick Setup Script for Testing

## Copy and paste these into your browser console after the app loads

### 1. Create an Admin User (Run this first)

```javascript
// Register admin user
async function setupAdmin() {
  // Clear existing data if needed
  // localStorage.clear();
  
  // Register admin user
  const result = await authService.register('admin@cosmic.app', 'AdminPass123', 'Super Admin');
  
  if (result.success) {
    // Set as admin with pro tier
    const users = JSON.parse(localStorage.getItem('cosmic_users'));
    const adminUser = users.find(u => u.email === 'admin@cosmic.app');
    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.tier = 'pro';
      localStorage.setItem('cosmic_users', JSON.stringify(users));
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@cosmic.app');
      console.log('Password: AdminPass123');
      console.log('Please refresh the page to see admin navigation');
    }
  } else {
    console.log('❌ Failed to create admin:', result.error);
  }
}

setupAdmin();
```

### 2. Create Test Users (Run after admin is set up)

```javascript
async function createTestUsers() {
  const testUsers = [
    { email: 'user1@test.com', password: 'TestPass123', name: 'Alice Johnson', tier: 'free' },
    { email: 'user2@test.com', password: 'TestPass123', name: 'Bob Smith', tier: 'premium' },
    { email: 'user3@test.com', password: 'TestPass123', name: 'Carol Davis', tier: 'pro' },
    { email: 'user4@test.com', password: 'TestPass123', name: 'David Wilson', tier: 'free' },
    { email: 'user5@test.com', password: 'TestPass123', name: 'Eve Martinez', tier: 'premium' }
  ];

  for (const user of testUsers) {
    await authService.register(user.email, user.password, user.name);
    authService.logout();
    
    // Set tier
    const users = JSON.parse(localStorage.getItem('cosmic_users'));
    const newUser = users.find(u => u.email === user.email);
    if (newUser) {
      newUser.tier = user.tier;
      localStorage.setItem('cosmic_users', JSON.stringify(users));
    }
  }
  
  console.log('✅ 5 test users created!');
  console.log('All passwords: TestPass123');
  console.log('Users: user1-5@test.com (mixed tiers)');
}

createTestUsers();
```

### 3. Generate Sample Analytics Data

```javascript
function generateSampleAnalytics() {
  const pages = ['Dashboard', 'Patterns', 'Journal', 'Goals', 'Crystals', 'Chat', 'Profile'];
  const features = ['crystal_view', 'journal_entry', 'goal_create', 'chat_message', 'pattern_analysis'];
  const errors = ['API timeout', 'Network error', 'Invalid data', 'Permission denied'];
  
  // Generate 50 random events
  for (let i = 0; i < 50; i++) {
    // Random page views
    if (Math.random() > 0.3) {
      const page = pages[Math.floor(Math.random() * pages.length)];
      analyticsService.trackPageView(page);
    }
    
    // Random interactions
    if (Math.random() > 0.5) {
      const feature = features[Math.floor(Math.random() * features.length)];
      analyticsService.trackInteraction('feature_use', { feature });
    }
    
    // Some errors
    if (Math.random() > 0.9) {
      const error = errors[Math.floor(Math.random() * errors.length)];
      analyticsService.trackError(error, Math.random() > 0.5 ? 'high' : 'low');
    }
  }
  
  // Generate some conversions
  analyticsService.trackConversion('subscription', 9.99, { tier: 'premium' });
  analyticsService.trackConversion('subscription', 19.99, { tier: 'pro' });
  
  console.log('✅ Generated 50+ sample analytics events!');
}

generateSampleAnalytics();
```

### 4. Generate Sample Payments

```javascript
async function generateSamplePayments() {
  const tiers = ['premium', 'pro', 'premium', 'pro', 'premium'];
  const providers = ['stripe', 'braintree'];
  
  for (let i = 0; i < 10; i++) {
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const price = tier === 'premium' ? 9.99 : 19.99;
    
    if (provider === 'stripe') {
      await paymentService.processStripePayment('pm_demo_' + i, price, tier);
    } else {
      await paymentService.processBraintreePayment('nonce_demo_' + i, price, tier);
    }
    
    // Create subscription for some
    if (Math.random() > 0.5) {
      await paymentService.createSubscription(tier, provider, 'pm_demo_' + i);
    }
  }
  
  console.log('✅ Generated 10 sample payments!');
}

generateSamplePayments();
```

### 5. All-in-One Setup (Run this to set everything up)

```javascript
async function completeSetup() {
  console.log('🚀 Starting complete setup...\n');
  
  // 1. Create admin
  console.log('1️⃣ Creating admin user...');
  await authService.register('admin@cosmic.app', 'AdminPass123', 'Super Admin');
  const users = JSON.parse(localStorage.getItem('cosmic_users') || '[]');
  const adminUser = users.find(u => u.email === 'admin@cosmic.app');
  if (adminUser) {
    adminUser.role = 'admin';
    adminUser.tier = 'pro';
    localStorage.setItem('cosmic_users', JSON.stringify(users));
  }
  authService.logout();
  
  // 2. Create test users
  console.log('2️⃣ Creating test users...');
  const testUsers = [
    { email: 'user1@test.com', password: 'TestPass123', name: 'Alice Johnson', tier: 'free' },
    { email: 'user2@test.com', password: 'TestPass123', name: 'Bob Smith', tier: 'premium' },
    { email: 'user3@test.com', password: 'TestPass123', name: 'Carol Davis', tier: 'pro' }
  ];

  for (const user of testUsers) {
    await authService.register(user.email, user.password, user.name);
    authService.logout();
    const allUsers = JSON.parse(localStorage.getItem('cosmic_users'));
    const newUser = allUsers.find(u => u.email === user.email);
    if (newUser) {
      newUser.tier = user.tier;
      localStorage.setItem('cosmic_users', JSON.stringify(allUsers));
    }
  }
  
  // 3. Generate analytics
  console.log('3️⃣ Generating analytics data...');
  const pages = ['Dashboard', 'Patterns', 'Journal', 'Goals', 'Crystals'];
  for (let i = 0; i < 30; i++) {
    analyticsService.trackPageView(pages[Math.floor(Math.random() * pages.length)]);
  }
  analyticsService.trackConversion('subscription', 9.99, { tier: 'premium' });
  analyticsService.trackConversion('subscription', 19.99, { tier: 'pro' });
  
  // 4. Generate payments
  console.log('4️⃣ Generating payment data...');
  for (let i = 0; i < 8; i++) {
    const tier = i % 2 === 0 ? 'premium' : 'pro';
    const price = tier === 'premium' ? 9.99 : 19.99;
    await paymentService.processStripePayment('pm_demo_' + i, price, tier);
  }
  
  console.log('\n✅ Setup complete!\n');
  console.log('📧 Admin Login:');
  console.log('   Email: admin@cosmic.app');
  console.log('   Password: AdminPass123\n');
  console.log('📧 Test Users:');
  console.log('   user1@test.com (Free tier)');
  console.log('   user2@test.com (Premium tier)');
  console.log('   user3@test.com (Pro tier)');
  console.log('   Password: TestPass123\n');
  console.log('🔄 Please refresh the page to see admin navigation!');
}

completeSetup();
```

### 6. View All Data (Check what's been created)

```javascript
function viewAllData() {
  console.log('👥 USERS:');
  console.table(JSON.parse(localStorage.getItem('cosmic_users') || '[]').map(u => ({
    name: u.name,
    email: u.email,
    role: u.role || 'user',
    tier: u.tier || 'free'
  })));
  
  console.log('\n📊 ANALYTICS SUMMARY:');
  console.log(analyticsService.getAnalyticsSummary(30));
  
  console.log('\n💳 PAYMENT SUMMARY:');
  console.log(paymentService.getPaymentSummary(30));
  
  console.log('\n📈 RECENT EVENTS:');
  const events = JSON.parse(localStorage.getItem('cosmic_analytics_events') || '[]');
  console.table(events.slice(-10).map(e => ({
    event: e.eventName,
    page: e.pathname,
    timestamp: new Date(e.timestamp).toLocaleString()
  })));
}

viewAllData();
```

### 7. Clear All Data (Start fresh)

```javascript
function clearAllData() {
  if (confirm('⚠️ This will delete ALL data. Are you sure?')) {
    localStorage.clear();
    console.log('✅ All data cleared! Refresh the page.');
    setTimeout(() => location.reload(), 1000);
  }
}

// Run this to clear everything
// clearAllData();
```

---

## Quick Testing Workflow

1. **First Time Setup:**
   ```javascript
   completeSetup(); // Creates admin, users, sample data
   ```
   Then refresh the page.

2. **Login as Admin:**
   - Email: admin@cosmic.app
   - Password: AdminPass123

3. **Explore Admin Dashboard:**
   - Click "Admin" in sidebar
   - View Overview, Users, Analytics, Payments
   - Check Real-time tab (auto-refreshes every 5 seconds)

4. **View Data Anytime:**
   ```javascript
   viewAllData(); // Shows summary of all data
   ```

5. **Start Fresh:**
   ```javascript
   clearAllData(); // Clears everything
   ```

---

## Individual Service Testing

### Test Authentication:
```javascript
// Check current user
authService.getCurrentUser();

// Check if authenticated
authService.isAuthenticated();

// View all users
JSON.parse(localStorage.getItem('cosmic_users'));
```

### Test Analytics:
```javascript
// Track custom event
analyticsService.trackEvent('test_event', { test: true });

// Get summary
analyticsService.getAnalyticsSummary(7);

// Export data
analyticsService.exportData('json');
```

### Test Payments:
```javascript
// Get payment history
paymentService.getPaymentHistory();

// Get pricing
paymentService.getTierPricing('premium');

// Get summary
paymentService.getPaymentSummary(30);
```

---

## Troubleshooting

### If admin navigation doesn't appear:
```javascript
const user = authService.getCurrentUser();
console.log('Role:', user?.role); // Should be 'admin'

// If not, set it manually:
const users = JSON.parse(localStorage.getItem('cosmic_users'));
users[0].role = 'admin';
localStorage.setItem('cosmic_users', JSON.stringify(users));
location.reload();
```

### If analytics not tracking:
```javascript
// Check cookie consent
const consent = JSON.parse(localStorage.getItem('cosmic_cookie_consent'));
console.log('Analytics enabled:', consent?.analytics);

// If not, accept cookies:
localStorage.setItem('cosmic_cookie_consent', JSON.stringify({
  necessary: true,
  analytics: true,
  marketing: true,
  functional: true
}));
location.reload();
```

---

**Pro Tip:** Keep your browser console open while testing to see all the tracking events and debug any issues!
