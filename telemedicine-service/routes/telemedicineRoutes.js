// routes/telemedicineRoutes.js
const express = require('express');
const router = express.Router();

const {
getAllSessions,
  createSession,
  getSessionById,
  startSession,
  endSession
} = require('../controllers/telemedicineController');

// Get all sessions (with optional filters)
router.get('/', getAllSessions);

// Create new session
router.post('/create', createSession);

// Get session
router.get('/:id', getSessionById);

// Start session
router.put('/start/:id', startSession);

// End session
router.put('/end/:id', endSession);

module.exports = router;