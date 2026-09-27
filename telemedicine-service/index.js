const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser'); //parse httpOnly auth cookie (V09)
require('dotenv').config();

const telemedicineRoutes  = require('./routes/telemedicineRoutes');

const app = express();
app.use(cookieParser()); //Enables req. cookies (V09)
app.use(cors({
    origin: 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

// Connect DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to Telemedicine DB'))
    .catch((err) => console.error('❌ DB connection error:', err));

// Use Routes
app.use('/api/telemedicine', telemedicineRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`🎥 Telemedicine Service running on port ${PORT}`));