const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const {
  createProfile,  getProfile,  updateProfile,    setAvailability,
  getAppointments,  updateAppointmentStatus,  issuePrescription, 
  getPrescriptionHistory,  viewPatientReports,  startTelemedicineSession,
  getAllDoctors,  getAllDoctorsAdmin,  verifyDoctor
} = require('../controllers/doctorController');

// Public routes
router.get('/all', getAllDoctors);

// Doctor routes (Protected - Doctor role only)
router.post('/profile', verifyToken, authorizeRole('Doctor'), createProfile);
router.get('/profile', verifyToken, authorizeRole('Doctor'), getProfile);
router.put('/profile', verifyToken, authorizeRole('Doctor'), updateProfile);
router.post('/availability', verifyToken, authorizeRole('Doctor'), setAvailability);
router.get('/appointments', verifyToken, authorizeRole('Doctor'), getAppointments);
router.put('/appointments/:id/status', verifyToken, authorizeRole('Doctor'), updateAppointmentStatus);
router.post('/prescription', verifyToken, authorizeRole('Doctor'), issuePrescription);
router.get('/prescriptions/history', verifyToken, authorizeRole('Doctor'), getPrescriptionHistory);
router.get('/patient/:id/reports', verifyToken, authorizeRole('Doctor'), viewPatientReports);
router.post('/telemedicine/start', verifyToken, authorizeRole('Doctor'), startTelemedicineSession);

// Admin routes
router.get('/admin/all', verifyToken, authorizeRole('Admin'), getAllDoctorsAdmin);
router.put('/admin/:id/verify', verifyToken, authorizeRole('Admin'), verifyDoctor);

module.exports = router;