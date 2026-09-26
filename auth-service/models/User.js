const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // OAuth: a Google-linked account has no local password at all, so this
    // can no longer be unconditionally required. Local (email/password)
    // registration still always supplies one — see auth-service/index.js
    // POST /register, which hashes and sets it before save — so this
    // relaxation doesn't change behaviour for existing local accounts.
    password: { type: String, required: false },
    role: { 
        type: String, 
        enum:['Patient', 'Doctor', 'Admin'],
        required: true 
    },

    // OAuth: tracks how this account was created/authenticates.
    // 'local'  = normal email + password registration (existing behaviour,
    //            default, so every pre-existing document stays valid with
    //            no migration needed).
    // 'google' = created via "Sign in with Google" and has no password.
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }
    
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);