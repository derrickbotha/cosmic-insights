// Setup admin user for testing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/cosmic-insights';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'ml_engineer', 'analytics_admin'], default: 'user' },
  tier: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
  profile: {
    name: String,
    isProfileComplete: { type: Boolean, default: false }
  }
}, { timestamps: true });

async function setupAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', userSchema);

    // Check if admin exists
    const adminEmail = 'admin@cosmic.com';
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log('✅ Admin user already exists');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.createdAt}`);
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = new User({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        tier: 'premium',
        profile: {
          name: 'System Administrator',
          isProfileComplete: true
        }
      });
      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: admin123`);
      console.log(`   Role: admin`);
    }

    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in system: ${totalUsers}`);

    // Show role breakdown
    const roles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log('\n📈 User roles:');
    roles.forEach(r => {
      console.log(`   ${r._id}: ${r.count}`);
    });

    mongoose.connection.close();
    console.log('\n✅ Setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
