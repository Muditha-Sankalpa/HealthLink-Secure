const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole, verifyInternalKey } = require('../middleware/authMiddleware');
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

// Internal (service-to-service) — requires x-internal-key (V06)
router.get('/:id', verifyInternalKey, getPatientById);

// Internal lookup by userId - requires x-internal-key (V06)
router.get('/internal/by-user/:userId', verifyInternalKey, async (req, res) => {
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

// Internal — creates a bare Patient profile for a new OAuth user (auth-service only)
router.post('/internal/provision', verifyInternalKey, async (req, res) => {
  const Patient = require('../models/Patient');
  try {
    const { userId, name, email } = req.body;
    const existing = await Patient.findOne({ userId });
    if (existing) return res.status(200).json(existing);
    const patient = await Patient.create({ userId, name, email });
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;