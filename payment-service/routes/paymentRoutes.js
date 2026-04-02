// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const { createPaymentIntent, confirmPayment, getAllPayments, getPaymentsByPatient, getPaymentByAppointment } = require('../controllers/paymentController');

router.post('/create-intent', verifyToken, authorizeRole('Patient', 'Admin'), createPaymentIntent);
router.post('/confirm', verifyToken, authorizeRole('Patient', 'Admin'), confirmPayment);

router.get('/', verifyToken, authorizeRole('Admin'), getAllPayments);
router.get('/patient/:patientId', verifyToken, authorizeRole('Patient', 'Admin'), getPaymentsByPatient);
router.get('/appointment/:appointmentId', verifyToken, authorizeRole('Patient', 'Admin'), getPaymentByAppointment);

module.exports = router;