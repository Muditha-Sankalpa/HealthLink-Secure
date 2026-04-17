const axios = require('axios');
const cloudinary = require('../config/cloudinary'); 
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

const updateAvatar = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Profile not found' });
    if (patient.status === 'deactivated') return res.status(403).json({ message: 'Account is deactivated' });

    const updatedPatient = await Patient.findOneAndUpdate(
      { userId: req.user.id },
      { avatarUrl: req.file.path },
      { new: true }
    );

    res.json(updatedPatient);
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

    const report = new MedicalReport({ 
      
      patientId: patient._id,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      fileType: req.file.mimetype,

    });

    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Profile not found' });
    if (patient.status === 'deactivated') return res.status(403).json({ message: 'Account is deactivated' });

    const report = await MedicalReport.findOne({
      _id: req.params.reportId,
      patientId: patient._id
    });
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.fileUrl && report.fileUrl.includes('cloudinary.com')) {
      const urlAfterUpload = report.fileUrl.split('/upload/')[1];
      const withoutVersion = urlAfterUpload.replace(/^v\d+\//, '');
      const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
      const resourceType = report.fileType?.startsWith('image/') ? 'image' : 'raw';

      const cloudinaryResult = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

      if (cloudinaryResult.result !== 'ok' && cloudinaryResult.result !== 'not found') {
        return res.status(500).json({ message: 'Failed to delete file from storage' });
      }
    }

    await MedicalReport.findByIdAndDelete(req.params.reportId);
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('=== DELETE REPORT ERROR ===', err);
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

    //API call to doctor-service to get prescriptions
    let prescriptions = [];

    try {
      const doctorRes = await axios.get(`http://localhost:5002/api/doctors/prescriptions/patient/${patient._id}`,
        { headers: { Authorization: req.headers.authorization } }
      );
      prescriptions = doctorRes.data;
    } catch {
      prescriptions = [];
    }

    //API call to Telemedince service to get consultation history
    let consultations = [];

    try {
      const teleRes = await axios.get(

          `http://localhost:5004/api/telemedicine?status=COMPLETED`,
          { headers: { Authorization: req.headers.authorization } }

);
      consultations = teleRes.data;
    } catch(err) {
      console.log('Telemedicine error:', err.message);
      consultations = [];
    }

    res.json({ reports, prescriptions, consultations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getScheduledSessions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Profile not found' });

    const teleRes = await axios.get(
      `http://localhost:5004/api/telemedicine?status=SCHEDULED`,
      { headers: { Authorization: req.headers.authorization } }
    );
    console.log('Tele response:', teleRes.data);
    res.json(teleRes.data);
  } catch (err) {
    console.log('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/patients/:id (internal)
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select('_id userId name email contactNumber notificationPreference status');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/patients/all (Admin)
const getAllPatients = async (req, res) => {
  try {

    const query = req.query.search
      ? { name: { $regex: req.query.search, $options: 'i' } }
      : {};

    const patients = await Patient.find(query).select('name status createdAt');
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
    const active = await Patient.countDocuments({ status: 'active' });
    const deactivated = await Patient.countDocuments({ status: 'deactivated' });

    res.json({ total, newRegistrations, active, deactivated });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProfile, getProfile, updateAvatar, updateProfile,
  uploadReport, deleteReport, getHistory,getScheduledSessions, getPatientById,
  getAllPatients, updateStatus, getStats
};