const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

router.get('/doctors/search', appointmentController.searchDoctors);

router.post('/book', verifyToken, appointmentController.bookAppointment);
router.get('/my-appointments', verifyToken, appointmentController.getMyAppointments);
router.put('/:id', verifyToken, appointmentController.updateAppointment);
router.put('/:id/cancel', verifyToken, appointmentController.cancelAppointment);

module.exports = router;