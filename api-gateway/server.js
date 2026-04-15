// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

// Patient Service
app.use("/api/patients", createProxyMiddleware({
  target: "http://localhost:5001",
  changeOrigin: true,
}));

// Doctor Service
app.use("/api/doctors", createProxyMiddleware({
  target: "http://localhost:5002",
  changeOrigin: true,
}));

// Appointment Service
app.use("/api/appointments", createProxyMiddleware({
  target: "http://localhost:5003",
  changeOrigin: true,
}));

// Telemedicine Service
app.use("/api/telemedicine", createProxyMiddleware({
  target: "http://localhost:5004",
  changeOrigin: true,
}));

// Payment Service
app.use("/api/payment", createProxyMiddleware({
  target: "http://localhost:5005",
  changeOrigin: true,
}));

// Auth Service
app.use("/api/auth", createProxyMiddleware({
  target: "http://localhost:5006",
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' }
}));

// AI Symptom Checker Service
app.use("/api/symptom-checker", createProxyMiddleware({
  target: "http://localhost:5007",
  changeOrigin: true,
}));

// Default Gateway Route
app.get('/', (req, res) => {
    res.send('API Gateway is running. Routing traffic to microservices...');
});

app.listen(PORT, () => {
  console.log(`🚦 API Gateway is running on http://localhost:${PORT}`);
});