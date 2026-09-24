const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const { verifyToken, authorizeRole } = require('./middleware/authMiddleware');
const passport = require('./config/passport');
const { rateLimit } = require('express-rate-limit');
const {
  generateOAuthState,
  validateOAuthState,
} = require("./middleware/oauthState");

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());
// app.use(cookieParser());
//OAuth - security hardening
app.use(cookieParser(process.env.JWT_SECRET));
app.use(passport.initialize());

//V08 - fix
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        message: 'Too many login attempts. Please try again later.'
    }
});

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        message: 'Too many registration attempts. Please try again later.'
    }
});

//Dinuri - OAuth - security hardening
const oauthStartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many OAuth login attempts. Please try again later.",
  },
});

const oauthCallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many OAuth callback attempts. Please try again later.",
  },
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to:', mongoose.connection.name, '@', mongoose.connection.host))
    .catch((err) => console.error('❌ DB connection error:', err));

// ==========================================
// 1. REGISTER ROUTE
// ==========================================
// app.post('/register', async (req, res) => {
//V08 - fix
app.post('/register', registrationLimiter, async (req, res) => {    
    try {
        // role is intentionally NOT read from the request body here — public
        // self-registration always creates a Patient account. Elevated roles
        // (Doctor, Admin) can only be created via POST /admin/register by an
        // already-authenticated Admin. See fix for V01.
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ name, email, password: hashedPassword, role: 'Patient' });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!',
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 1b. ADMIN-ONLY: CREATE USER WITH ELEVATED ROLE
// ==========================================
app.post('/admin/register', verifyToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!['Patient', 'Doctor', 'Admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully!',
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 2. LOGIN ROUTE
// ==========================================
// app.post('/login', async (req, res) => {
    //V08 - fix
app.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // V07 - FIX: Prevents attackers to map which emails are registered accounts 
        // Previously, returning a 404 "user not found" vs 400 "invalid credentials" 
        // let an attacker map which emails are registered accounts before brute-forcing them.
        if(!email || !password){
            return res.status(401).json({message: 'Invalid email or password'});
        }

        //Find user
        const user = await User.findOne({email});

        // V07 FIX: Check password only if user exists
        let isMatch = false;
        if(user){
            isMatch = await bcrypt.compare(password, user.password);
        }

        //V07 FIX: Always returns the exact same status code and message 
        // regardless of whether the user doesn't exist OR the password is wrong.
        if(!user || !isMatch){
            (`[AUTH SECURITY] Failed login attempt for email: ${email}`);
            return res.status(401).json({message:'Invalid email or password'});
        }

        // Generate JWT Token (Includes User ID and Role)
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // Token valid for 1 day
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (err) {
        //logs the failed attempt for the admin to review, without revealing to the attacker why it faild
        console.error('Login error:', err);
        //V07 FIX: Generic error message to prevent internal server detail leakage
        res.status(500).json({ message:'Internal server error'});
    }
});

// GET /users/:id — internal service-to-service lookup
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name email');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. GOOGLE OAUTH (OIDC) ROUTES
// ==========================================
//Commented by - Dinuri - fix: OAuth security hardening
// app.get('/auth/google', passport.authenticate('google', {
//     scope: ['profile', 'email'],
//     session: false,
// }));

// app.get('/auth/google/callback',
//     passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login' }),
//     (req, res) => {
//         const user = req.user;
//         const token = jwt.sign(
//             { id: user._id, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: '1d' }
//         );

//         res.cookie('token', token, {
//             httpOnly: true,
//             sameSite: 'lax',
//             maxAge: 24 * 60 * 60 * 1000, // 1 day
//         });

//         res.redirect('http://localhost:5173/oauth-success');
//     }
// );

app.get(
  "/auth/google",
  oauthStartLimiter,
  generateOAuthState,
  (req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      state: req.oauthState,
    })(req, res, next);
  }
);

app.get(
  "/auth/google/callback",
  oauthCallbackLimiter,
  validateOAuthState,
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173/oauth-success");
  }
);

// Returns the current user based on the httpOnly cookie set above.
// Used by the frontend's /oauth-success page to fetch who just logged in.
app.get('/auth/me', async (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });

        const user = await User.findById(decoded.id).select('name email role');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    });
});

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`🔐 Auth Service running on port ${PORT}`));