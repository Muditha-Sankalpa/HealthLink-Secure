const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');
const { generateNextSlot } = appointmentController;

// ==========================================
// USER ROUTES
// ==========================================
router.post('/book', verifyToken, appointmentController.bookAppointment);
router.get('/my-appointments', verifyToken, appointmentController.getMyAppointments);
router.put('/:id', verifyToken, appointmentController.updateAppointment);
router.put('/:id/cancel', verifyToken, appointmentController.cancelAppointment);
router.get('/check-slot', verifyToken, appointmentController.checkNextAvailableSlot);
router.post('/generate-slots', async (req, res) => {
    try {
        const { doctorId, date } = req.body;
        await generateNextSlot(doctorId, date);
        res.json({ message: 'Slots generated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all appointments in the system (allows query params: ?doctorId=d1&date=2023-11-01)
router.get('/admin/appointments', verifyToken, verifyAdmin, appointmentController.getAllAppointments);

// Admin cancel an appointment
router.put('/admin/appointments/:id/cancel', verifyToken, verifyAdmin, appointmentController.adminCancelAppointment);

// View all time slots (allows query params: ?doctorId=d1&isBooked=false)
router.get('/admin/timeslots', verifyToken, verifyAdmin, appointmentController.getAllTimeSlots);

// Get general statistics for an admin dashboard
router.get('/admin/stats', verifyToken, verifyAdmin, appointmentController.getAdminStats);

module.exports = router;