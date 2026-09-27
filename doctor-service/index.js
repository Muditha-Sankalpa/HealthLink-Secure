const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser'); //Parse httpOnly auth cookie (V09)
require('dotenv').config();
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();
app.use(cookieParser()); //Enable cookie parsing (V09)
app.use(cors({
    origin: 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());
app.use('/api/doctors', doctorRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to doctors_db');
    app.listen(process.env.PORT, () =>
      console.log(`Doctor Service running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error('DB connection error:', err));