// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();

const { createPaymentIntent, confirmPayment, getAllPayments, getPaymentsByPatient, getPaymentByAppointment } = require('../controllers/paymentController');

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);

router.get('/', getAllPayments);
router.get('/patient/:patientId', getPaymentsByPatient);
router.get('/appointment/:appointmentId', getPaymentByAppointment);

module.exports = router;