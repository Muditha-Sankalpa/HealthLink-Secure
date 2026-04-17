// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

// Patient Service
app.use("/api/patients", createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL || "http://localhost:5001",
  changeOrigin: true,
}));

// Doctor Service
app.use("/api/doctors", createProxyMiddleware({
  target: process.env.DOCTOR_SERVICE_URL || "http://localhost:5002",
  changeOrigin: true,
}));

// Appointment Service
app.use("/api/appointments", createProxyMiddleware({
  target: process.env.APPOINTMENT_SERVICE_URL || "http://localhost:5003",
  changeOrigin: true,
}));

// Telemedicine Service
app.use("/api/telemedicine", createProxyMiddleware({
  target: process.env.TELEMEDICINE_SERVICE_URL || "http://localhost:5004",
  changeOrigin: true,
}));

// Payment Service
app.use("/api/payment", createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL || "http://localhost:5005",
  changeOrigin: true,
}));

// Auth Service
app.use("/api/auth", createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || "http://localhost:5006",
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' }
}));

// Notification Service
app.use("/api/notifications", createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5007",
  changeOrigin: true,
}));

// AI Symptom Checker Service
app.use("/api/symptom-checker", createProxyMiddleware({
  target: process.env.SYMPTOM_CHECKER_URL || "http://localhost:5008",
  changeOrigin: true,
  pathRewrite: { "^/api/symptom-checker": "" }
}));

// Default Gateway Route
app.get('/', (req, res) => {
    res.send('API Gateway is running. Routing traffic to microservices...');
});

app.listen(PORT, () => {
  console.log(`🚦 API Gateway is running on http://localhost:${PORT}`);
});