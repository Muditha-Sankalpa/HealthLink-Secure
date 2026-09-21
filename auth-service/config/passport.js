const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

// TEMPORARY inline stub — matches the contract shape of Yonika's
// findOrCreateGoogleUser() (feature/oauth-user-linking). Swap this out
// for a `require('../services/userLinking')` call once that branch merges.
// Uses a random placeholder password because the current User schema still
// requires one; her branch makes it optional for Google accounts.
async function findOrCreateGoogleUser(profile) {
    const email = profile.emails[0].value;

    let user = await User.findOne({ email });
    if (user) return user;

    const randomPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    user = new User({
        name: profile.displayName,
        email,
        password: randomPassword,
        role: 'Patient',
    });
    await user.save();
    return user;
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await findOrCreateGoogleUser(profile);
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport;
