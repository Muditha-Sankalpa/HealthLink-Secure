const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const patientRoutes = require('./routes/patientRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use('/api/patients', patientRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to patients_db');
    app.listen(process.env.PORT, () =>
      console.log(`patient-service running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error('DB connection error:', err));