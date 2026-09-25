const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser'); //Parse httpOnly auth cookie (V09)
require('dotenv').config();

const paymentRoutes  = require('./routes/paymentRoutes');

const app = express();
app.use(cookieParser()); //Enables req.cookies (V09)
app.use(cors({
    origin: 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

// Connect DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to Payment DB'))
    .catch((err) => console.error('❌ DB connection error:', err));

// Use Routes
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`🎥 Payment Service running on port ${PORT}`));