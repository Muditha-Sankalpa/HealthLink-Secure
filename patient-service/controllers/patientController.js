const Patient = require('../models/Patient');
const MedicalReport = require('../models/MedicalReport');

// POST /api/patients/profile
const createProfile = async (req, res) => {
  try {
    const existing = await Patient.findOne({ userId: req.user.id });
    if (existing) return res.status(400).json({ message: 'Profile already exists' });

    const patient = new Patient({ userId: req.user.id, ...req.body });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/patients/profile
const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Profile not found' });
    if (patient.status === 'deactivated') return res.status(403).json({ message: 'Account is deactivated' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/patients/profile
const updateProfile = async (req, res) => {
  try {
    const existing = await Patient.findOne({ userId: req.user.id });
    if (!existing) return res.status(404).json({ message: 'Profile not found' });
    if (existing.status === 'deactivated') return res.status(403).json({ message: 'Account is deactivated' });

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/patients/upload-report
const uploadReport = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Profile not found' });
    if (patient.status === 'deactivated') return res.status(403).json({ message: 'Account is deactivated' });

    const report = new MedicalReport({ patientId: patient._id, ...req.body });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/patients/history
const getHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Profile not found' });
    if (patient.status === 'deactivated') return res.status(403).json({ message: 'Account is deactivated' });

    const reports = await MedicalReport.find({ patientId: patient._id });

    // Mocked until other services are ready
    const prescriptions = [{ id: 'mock1', medication: 'Paracetamol', date: '2026-01-01' }];
    const consultations = [{ id: 'mock1', sessionDate: '2026-01-10', duration: '20mins' }];

    res.json({ reports, prescriptions, consultations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/patients/:id (internal)
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select('_id userId status');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/patients/all (Admin)
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select('name status createdAt');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/patients/:id/status (Admin)
const updateStatus = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/patients/stats (Admin)
const getStats = async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newRegistrations = await Patient.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    res.json({ total, newRegistrations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProfile, getProfile, updateProfile,
  uploadReport, getHistory, getPatientById,
  getAllPatients, updateStatus, getStats
};