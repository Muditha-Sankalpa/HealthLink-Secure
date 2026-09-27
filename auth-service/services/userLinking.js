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

    // Provision a bare Patient profile so a first-time Google sign-in isn't
    // left with an authenticated User but no profile record (patient-service
    // owns Patient documents in its own DB, so this is a service-to-service
    // call via the shared internal key — same boundary pattern as V06/V10).
    try {
        await fetch(`${process.env.PATIENT_SERVICE_URL}/api/patients/internal/provision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.INTERNAL_SERVICE_KEY,
            },
            body: JSON.stringify({
                userId: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }),
        });
    } catch (err) {
        // Don't fail the whole sign-in if patient-service is briefly
        // unreachable — the user can retry, and /profile GET will 404
        // until provisioning succeeds, same as today's known gap.
        console.error('Failed to provision Patient profile for OAuth user:', err.message);
    }

    return newUser;
}

module.exports = { findOrCreateGoogleUser };