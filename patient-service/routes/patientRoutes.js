const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const {
  createProfile, getProfile, updateProfile,
  uploadReport, getHistory, getPatientById,
  getAllPatients, updateStatus, getStats
} = require('../controllers/patientController');

// Patient routes
router.post('/profile', verifyToken, authorizeRole('Patient'), createProfile);
router.get('/profile', verifyToken, authorizeRole('Patient'), getProfile);
router.put('/profile', verifyToken, authorizeRole('Patient'), updateProfile);
router.post('/upload-report', verifyToken, authorizeRole('Patient'), uploadReport);
router.get('/history', verifyToken, authorizeRole('Patient'), getHistory);

// Admin routes
router.get('/all', verifyToken, authorizeRole('Admin'), getAllPatients);
router.get('/stats', verifyToken, authorizeRole('Admin'), getStats);
router.put('/:id/status', verifyToken, authorizeRole('Admin'), updateStatus);

// Internal (service-to-service) — no auth
router.get('/:id', getPatientById);

module.exports = router;