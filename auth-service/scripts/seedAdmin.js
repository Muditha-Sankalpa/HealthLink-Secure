// One-off bootstrap script: creates the first Admin account directly in the
// database, bypassing the API. Needed because /admin/register (correctly)
// requires an existing Admin token, so the very first admin can't be created
// through the API. Run manually, once, outside the app:
//
//   node scripts/seedAdmin.js
//
// Override the defaults with env vars if needed:
//   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_NAME = process.env.ADMIN_NAME || 'System Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@healthlink.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe@Admin123';

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to:', mongoose.connection.name, '@', mongoose.connection.host);

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
        console.log(`Admin already exists for ${ADMIN_EMAIL} (role: ${existing.role}) — nothing to do.`);
        await mongoose.disconnect();
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'Admin',
    });
    await admin.save();

    console.log('Admin account created:');
    console.log('  email:', ADMIN_EMAIL);
    console.log('  password:', ADMIN_PASSWORD, '(change this / use your own via env vars for anything beyond local testing)');

    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
