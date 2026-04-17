const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  createProfile, getProfile, updateProfile, updateAvatar,
  uploadReport,deleteReport, getHistory, getScheduledSessions, getPatientById,
  getAllPatients, updateStatus, getStats
} = require('../controllers/patientController');

// Patient routes
router.post('/profile', verifyToken, authorizeRole('Patient'), createProfile);
router.get('/profile', verifyToken, authorizeRole('Patient'), getProfile);
router.put('/profile', verifyToken, authorizeRole('Patient'), updateProfile);
router.put('/profile/avatar', verifyToken, authorizeRole('Patient'), upload.single('file'), updateAvatar);
router.post('/upload-report', verifyToken, authorizeRole('Patient'), upload.single('file'),uploadReport);
router.delete('/reports/:reportId', verifyToken, authorizeRole('Patient'), deleteReport);
router.get('/history', verifyToken, authorizeRole('Patient'), getHistory);
router.get('/scheduled-sessions', verifyToken, authorizeRole('Patient'), getScheduledSessions);

// Admin routes
router.get('/all', verifyToken, authorizeRole('Admin'), getAllPatients);
router.get('/stats', verifyToken, authorizeRole('Admin'), getStats);
router.put('/:id/status', verifyToken, authorizeRole('Admin'), updateStatus);

// Internal (service-to-service) — no auth
router.get('/:id', getPatientById);

// Internal lookup by userId (no auth)
router.get('/internal/by-user/:userId', async (req, res) => {
  const Patient = require('../models/Patient');
  try {
    const patient = await Patient.findOne({ userId: req.params.userId })
      .select('_id userId name email contactNumber notificationPreference status');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;