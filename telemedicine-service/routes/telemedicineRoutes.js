// routes/telemedicineRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

const {
getAllSessions,
  createSession,
  getSessionById,
  startSession,
  endSession,
  deleteSession
} = require('../controllers/telemedicineController');

// Get all sessions (with optional filters)
// router.get('/', getAllSessions);
// router.get('/', verifyToken, authorizeRole('Patient', 'Doctor'), getAllSessions);

// // Create new session
// router.post('/create', createSession);

// // Get session
// router.get('/:id', getSessionById);

// // Start session
// router.put('/start/:id', startSession);

// // End session
// router.put('/end/:id', endSession);

router.get('/', verifyToken, authorizeRole('Patient', 'Admin', 'Doctor'), getAllSessions);

router.post('/create', verifyToken, authorizeRole('Admin', 'Patient', 'Doctor'), createSession);

router.get('/:id', verifyToken, authorizeRole('Patient', 'Admin', 'Doctor'), getSessionById);

router.put('/start/:id', verifyToken, authorizeRole('Admin', 'Doctor'), startSession);

router.put('/end/:id', verifyToken, authorizeRole('Admin', 'Doctor'), endSession);

router.delete('/:id', deleteSession);

module.exports = router;