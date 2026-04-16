// controllers/telemedicineController.js
const TelemedicineSession = require('../models/TelemedicineSession');
const { v4: uuidv4 } = require('uuid');

// Get All Sessions (with optional filters)
// exports.getAllSessions = async (req, res) => {
//   try {
//     const { doctorId, patientId, status } = req.query;

//     let filter = {};

//     if (doctorId) filter.doctorId = doctorId;
//     if (patientId) filter.patientId = patientId;
//     if (status) filter.status = status;

//     const sessions = await TelemedicineSession.find(filter)
//       .sort({ scheduledTime: -1 }); // latest first

//     res.json(sessions);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.getAllSessions = async (req, res) => {
  try {
    const { doctorId, patientId, status } = req.query;
    let filter = {};

    // 🔥 ROLE-BASED FILTERING
    if (req.user.role === 'Patient') {
      filter.patientId = req.user.id;
    }
    if (req.user.role === 'Doctor') {
      filter.doctorId = req.user.id;
    }

    // Admin filters
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;

    // ✨ ADD .populate() HERE
    const sessions = await TelemedicineSession.find(filter)
      .populate('doctorId', 'name specialty consultationFee') // Fetches name/specialty from Doctor model
      .populate('patientId', 'name email')                    // Fetches name from User model
      .sort({ scheduledTime: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Create Session - POST
// controllers/telemedicineController.js
exports.createSession = async (req, res) => {
  try {
    // Add doctorName and patientName to the destructuring
    const { appointmentId, doctorId, scheduledTime, doctorName, patientName } = req.body;

    const session = new TelemedicineSession({
      sessionId: uuidv4(),
      appointmentId,
      doctorId,
      patientId: req.user.id,
      doctorName,    // Save the name here
      patientName,   // Save the name here
      scheduledTime,
      roomId: `room-${uuidv4()}`,
      meetingLink: `https://meet.jit.si/room-${uuidv4()}`
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

// Delete Session by sessionId
exports.deleteSession = async (req, res) => {
  try {
    // Log this to your terminal to see what the ID is
    console.log("Deleting session with ID:", req.params.id);

    const query = { sessionId: req.params.id };
    
    // Safety check: req.user must exist (from your auth middleware)
    if (req.user && req.user.role === 'Patient') {
      query.patientId = req.user.id;
    }

    const session = await TelemedicineSession.findOne(query);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (req.user && req.user.role === 'Patient') {
      session.status = 'CANCELLED';
      await session.save();
      return res.json({ message: 'Cancelled' });
    }

    await TelemedicineSession.deleteOne({ sessionId: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error(error); // This will show you the real error in your backend console
    res.status(500).json({ message: error.message });
  }
};