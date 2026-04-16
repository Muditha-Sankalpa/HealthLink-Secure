const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const {
  createProfile, getProfile, updateProfile, setAvailability,
  getAppointments, updateAppointmentStatus, issuePrescription, 
  getPrescriptionHistory, getPrescriptionsByPatientId, viewPatientReports,
  startTelemedicineSession, acceptConsultation,
  getAllDoctors, getAllDoctorsAdmin, verifyDoctor, getDoctorById
} = require('../controllers/doctorController');

// ✅ PUBLIC ROUTES
router.get('/all', getAllDoctors);

// ✅ SPECIFIC ROUTES (MUST COME BEFORE /:id)
router.get('/profile', verifyToken, authorizeRole('Doctor'), getProfile);
router.post('/profile', verifyToken, authorizeRole('Doctor'), createProfile);
router.put('/profile', verifyToken, authorizeRole('Doctor'), updateProfile);

router.post('/availability', verifyToken, authorizeRole('Doctor'), setAvailability);

router.get('/appointments', verifyToken, authorizeRole('Doctor'), getAppointments);
router.put('/appointments/:id/status', verifyToken, authorizeRole('Doctor'), updateAppointmentStatus);

router.post('/prescription', verifyToken, authorizeRole('Doctor'), issuePrescription);
router.get('/prescriptions/history', verifyToken, authorizeRole('Doctor'), getPrescriptionHistory);
router.get('/prescriptions/patient/:patientId', verifyToken, authorizeRole('Doctor'), getPrescriptionsByPatientId);

router.get('/patient/:id/reports', verifyToken, authorizeRole('Doctor'), viewPatientReports);

router.post('/telemedicine/start', verifyToken, authorizeRole('Doctor'), startTelemedicineSession);
router.put('/consultation/:appointmentId/accept', verifyToken, authorizeRole('Doctor'), acceptConsultation);

// ✅ DYNAMIC ROUTES (MUST COME LAST)
router.get('/:id', getDoctorById);

// ✅ ADMIN ROUTES
router.get('/admin/all', verifyToken, authorizeRole('Admin'), getAllDoctorsAdmin);
router.put('/admin/:id/verify', verifyToken, authorizeRole('Admin'), verifyDoctor);

module.exports = router;