const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to:', mongoose.connection.name, '@', mongoose.connection.host))
    .catch((err) => console.error('❌ DB connection error:', err));

// ==========================================
// 1. REGISTER ROUTE
// ==========================================
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ name, email, password: hashedPassword, role });
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
// 2. LOGIN ROUTE
// ==========================================
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

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
        res.status(500).json({ error: err.message });
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

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`🔐 Auth Service running on port ${PORT}`));