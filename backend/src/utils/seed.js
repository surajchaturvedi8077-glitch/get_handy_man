/**
 * seed.js
 * ------------------------------------------------------------------
 * One-off script: creates a default admin user and the Settings
 * singleton if they don't already exist. Run with: npm run seed
 * Safe to re-run — it skips anything that already exists.
 * ------------------------------------------------------------------
 */
const connectDB = require('../config/db');
const { defaultGstRate } = require('../config/env');
const User = require('../models/User');
const Settings = require('../models/Settings');

async function seed() {
  await connectDB();

  const adminEmail = 'admin@gethandyman.com.au';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'ChangeMe123!', // change immediately after first login
      role: 'admin',
    });
    console.log(`[seed] Created admin user: ${adminEmail} / ChangeMe123!`);
  } else {
    console.log('[seed] Admin user already exists, skipping');
  }

  const settings = await Settings.getSingleton();
  if (!settings.gstRate) {
    settings.gstRate = defaultGstRate;
    await settings.save();
  }
  console.log('[seed] Settings ready:', settings.businessName);

  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
