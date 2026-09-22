// Dev/testing convenience: ensures one known-password account exists per
// role (Patient, Doctor, Admin) so the team can log in during manual
// testing / the demo video without hunting for real credentials. Idempotent
// — safe to re-run, skips any account that already exists by email.
//
//   node scripts/seedTestUsers.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const TEST_USERS = [
    { name: 'Test Patient', email: 'patient.test@healthlink.local', password: 'Patient@Test123', role: 'Patient' },
    { name: 'Test Doctor', email: 'doctor.test@healthlink.local', password: 'Doctor@Test123', role: 'Doctor' },
    { name: 'Test Admin', email: 'admin.test@healthlink.local', password: 'Admin@Test123', role: 'Admin' },
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to:', mongoose.connection.name, '@', mongoose.connection.host);
    console.log('');

    for (const u of TEST_USERS) {
        const existing = await User.findOne({ email: u.email });
        if (existing) {
            console.log(`[skip] ${u.role} already exists: ${u.email} (role: ${existing.role})`);
            continue;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);

        const user = new User({ name: u.name, email: u.email, password: hashedPassword, role: u.role });
        await user.save();
        console.log(`[created] ${u.role}: ${u.email} / ${u.password}`);
    }

    console.log('');
    console.log('Done. Use these for testing/demo — never real accounts.');
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
