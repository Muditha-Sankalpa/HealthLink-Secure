require('dotenv').config();
const mongoose = require('mongoose');
const { findOrCreateGoogleUser } = require('../services/userLinking');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.collection('users').deleteOne({ email: 'test@x.com' });

    const first = await findOrCreateGoogleUser({ email: 'test@x.com', name: 'Test' });
    console.log('First call  ->', { id: first._id.toString(), authProvider: first.authProvider });

    const second = await findOrCreateGoogleUser({ email: 'test@x.com', name: 'Test' });
    console.log('Second call ->', { id: second._id.toString() });

    console.log(first._id.toString() === second._id.toString() ? '\n✅ PASS: idempotent' : '\n❌ FAIL');
    await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });