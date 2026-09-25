const User = require('../models/User');

/**
 * findOrCreateGoogleUser
 * -----------------------
 * Given a verified Google profile, returns the matching HealthLink User
 * document, creating one if this is the person's first Google sign-in.
 *
 * Policy decision (for the report's discussion section): matching is done
 * purely on email. If a local (email/password) account already exists
 * with the same email, a Google sign-in logs straight into that account
 * rather than blocking the sign-in or creating a duplicate — a duplicate
 * wouldn't even be possible, since email has a unique index on the User
 * schema. This trusts Google's own email verification, which is the
 * standard assumption behind "Sign in with Google" everywhere.
 *
 * Idempotent: calling this twice with the same email returns the same
 * document both times.
 *
 * @param {{ email: string, name: string }} profile
 * @returns {Promise<import('mongoose').Document>}
 */
async function findOrCreateGoogleUser({ email, name }) {
    if (!email) {
        throw new Error('findOrCreateGoogleUser: Google profile had no email');
    }

    const existing = await User.findOne({ email });
    if (existing) {
        return existing;
    }

    // role always defaults to 'Patient' here — deliberately mirrors the
    // V01 fix, role is never taken from client-controlled input, Google
    // profile data included.
    const newUser = new User({
        name: name || email,
        email,
        role: 'Patient',
        authProvider: 'google'
    });

    await newUser.save();
    return newUser;
}

module.exports = { findOrCreateGoogleUser };