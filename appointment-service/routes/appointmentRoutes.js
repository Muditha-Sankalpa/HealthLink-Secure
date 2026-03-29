const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');
const { generateNextSlot } = appointmentController;

router.get('/doctors/search', appointmentController.searchDoctors);
router.post('/book', verifyToken, appointmentController.bookAppointment);
router.get('/my-appointments', verifyToken, appointmentController.getMyAppointments);
router.put('/:id', verifyToken, appointmentController.updateAppointment);
router.put('/:id/cancel', verifyToken, appointmentController.cancelAppointment);
router.post('/generate-slots', async (req, res) => {
    try {
        const { doctorId, date } = req.body;
        await generateNextSlot(doctorId, date);
        res.json({ message: 'Slots generated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;