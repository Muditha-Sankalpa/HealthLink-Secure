require('dotenv').config();
const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`Notification service running on port ${PORT}`));