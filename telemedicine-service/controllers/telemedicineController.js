// controllers/telemedicineController.js
const TelemedicineSession = require('../models/TelemedicineSession');
const { v4: uuidv4 } = require('uuid');

// Get All Sessions (with optional filters)
exports.getAllSessions = async (req, res) => {
  try {
    const { doctorId, patientId, status } = req.query;

    let filter = {};

    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;

    const sessions = await TelemedicineSession.find(filter)
      .sort({ scheduledTime: -1 }); // latest first

    res.json(sessions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Session
exports.createSession = async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId, scheduledTime } = req.body;

    const sessionId = uuidv4();
    const roomId = `room-${sessionId}`;

    // Jitsi meeting link
    const meetingLink = `https://meet.jit.si/${roomId}`;

    const session = new TelemedicineSession({
      sessionId,
      appointmentId,
      doctorId,
      patientId,
      scheduledTime,
      roomId,
      meetingLink
    });

    await session.save();

    res.status(201).json(session);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Session by ID - pass the session ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await TelemedicineSession.findOne({
      sessionId: req.params.id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start Session
exports.startSession = async (req, res) => {
  try {
    const session = await TelemedicineSession.findOne({
      sessionId: req.params.id
    });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'ACTIVE';
    session.startTime = new Date();

    await session.save();

    res.json(session);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// End Session
exports.endSession = async (req, res) => {
  try {
    const session = await TelemedicineSession.findOne({
      sessionId: req.params.id
    });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'COMPLETED';
    session.endTime = new Date();

    await session.save();

    res.json(session);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};