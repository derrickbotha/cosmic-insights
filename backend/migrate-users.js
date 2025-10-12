// Migration script to add username and profileImage fields to existing users
const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:changeme@mongodb:27017/cosmic-insights?authSource=admin';

async function migrate() {
  try {
    console.log('🔄 Starting migration...');
    console.log('📡 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users without username
    const usersWithoutUsername = await User.find({ 
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' }
      ]
    });

    console.log(`\n📊 Found ${usersWithoutUsername.length} users without username`);

    let updated = 0;
    let skipped = 0;

    for (const user of usersWithoutUsername) {
      try {
        // Generate username from email
        let baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
        let username = baseUsername;
        let counter = 1;

        // Check if username is already taken
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        user.username = username;
        
        // Set default profile image to null if not set
        if (!user.profileImage) {
          user.profileImage = null;
        }

        await user.save({ validateBeforeSave: false });
        console.log(`  ✓ Updated user: ${user.email} → username: ${username}`);
        updated++;
      } catch (error) {
        console.error(`  ✗ Error updating user ${user.email}:`, error.message);
        skipped++;
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`  ✅ Users updated: ${updated}`);
    console.log(`  ⚠️  Users skipped: ${skipped}`);
    console.log(`  📊 Total processed: ${usersWithoutUsername.length}`);

    // Update MongoDB validator
    console.log('\n🔧 Updating MongoDB validator...');
    try {
      await mongoose.connection.db.command({
        collMod: 'users',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['email', 'password', 'name', 'role'],
            properties: {
              email: {
                bsonType: 'string',
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                description: 'must be a valid email address'
              },
              password: {
                bsonType: 'string',
                description: 'must be a hashed password string'
              },
              name: {
                bsonType: 'string',
                minLength: 2,
                maxLength: 50,
                description: 'must be between 2 and 50 characters'
              },
              username: {
                bsonType: ['string', 'null'],
                description: 'unique username (optional)'
              },
              profileImage: {
                bsonType: ['string', 'null'],
                description: 'profile image URL or base64 data (optional)'
              },
              role: {
                enum: ['user', 'admin', 'ml_admin', 'analytics_admin'],
                description: 'must be user, admin, ml_admin, or analytics_admin'
              },
              tier: {
                enum: ['free', 'premium', 'pro'],
                description: 'must be free, premium, or pro'
              }
            }
          }
        },
        validationLevel: 'moderate'
      });
      console.log('✅ MongoDB validator updated successfully');
    } catch (error) {
      console.error('⚠️  Warning: Could not update validator:', error.message);
    }

    console.log('\n✨ Migration completed successfully!\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
