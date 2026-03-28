const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription');
const axios = require('axios');

// POST /api/doctors/profile - Create doctor profile
const createProfile = async (req, res) => {
  try {
    const existing = await Doctor.findOne({ userId: req.user.id });
    if (existing) return res.status(400).json({ message: 'Profile already exists' });
    
    const doctor = new Doctor({ userId: req.user.id, ...req.body });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/doctors/profile - Get doctor's own profile
const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: 'Profile not found' });
    if (doctor.status === 'inactive') return res.status(403).json({ message: 'Account is inactive' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/doctors/profile - Update doctor profile
const updateProfile = async (req, res) => {
  try {
    const existing = await Doctor.findOne({ userId: req.user.id });
    if (!existing) return res.status(404).json({ message: 'Profile not found' });
    if (existing.status === 'inactive') return res.status(403).json({ message: 'Account is inactive' });
    
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/doctors/availability - Set availability schedule
const setAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: 'Profile not found' });
    
    doctor.availability = req.body.availability;
    await doctor.save();
    res.json({ message: 'Availability updated', doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/doctors/appointments - View doctor's appointments
const getAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    // Call Appointment Service to get appointments for this doctor
    const response = await axios.get(
      `http://localhost:5003/api/appointments/doctor/${doctor._id}`,
      { headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` } }
    );
    
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
};

// PUT /api/doctors/appointments/:id/status - Accept/Reject appointment
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Confirmed' or 'Rejected'
    const { id } = req.params;
    
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Call Appointment Service to update status
    const response = await axios.put(
      `http://localhost:5003/api/appointments/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` } }
    );
    
    res.json({ message: `Appointment ${status}`, appointment: response.data.appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment', details: err.message });
  }
};

// POST /api/doctors/prescription - Issue digital prescription
const issuePrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const { patientId, appointmentId, diagnosis, medications, notes, followUpDate } = req.body;
    
    const prescription = new Prescription({
      doctorId: doctor._id,
      patientId,
      appointmentId,
      diagnosis,
      medications,
      notes,
      followUpDate
    });
    
    await prescription.save();
    
    // Mock notification
    console.log(`[NOTIFICATION] Prescription issued to patient ${patientId}`);
    
    res.status(201).json({ message: 'Prescription issued successfully', prescription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/doctors/prescriptions/history - View prescription history
const getPrescriptionHistory = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/doctors/patient/:id/reports - View patient medical reports
const viewPatientReports = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    const { id: patientId } = req.params;
    
    // Call Patient Service to fetch reports
    const response = await axios.get(
      `http://localhost:5001/api/patients/${patientId}`,
      { headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` } }
    );
    
    res.json({ message: 'Patient verified', patient: response.data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient reports', details: err.message });
  }
};

// POST /api/doctors/telemedicine/start - Start video consultation
const startTelemedicineSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Call Telemedicine Service to create room
    const response = await axios.post(
      'http://localhost:5004/api/telemedicine/create-room',
      { doctorId: doctor._id, appointmentId },
      { headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` } }
    );
    
    res.json({ roomUrl: response.data.roomUrl, roomId: response.data.roomId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start session', details: err.message });
  }
};

// GET /api/doctors/all - Get all doctors (public - for patient search)
const getAllDoctors = async (req, res) => {
  try {
    const { specialty } = req.query;
    let query = { status: 'active', verified: true };
    
    if (specialty) {
      query.specialty = new RegExp(specialty, 'i');
    }
    
    const doctors = await Doctor.find(query).select('-userId');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: GET /api/doctors/admin/all - List all doctors
const getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('name specialty licenseNumber status verified createdAt');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: PUT /api/doctors/admin/:id/verify - Verify doctor
const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor verified successfully', doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProfile,
  getProfile,
  updateProfile,
  setAvailability,
  getAppointments,
  updateAppointmentStatus,
  issuePrescription,
  getPrescriptionHistory,
  viewPatientReports,
  startTelemedicineSession,
  getAllDoctors,
  getAllDoctorsAdmin,
  verifyDoctor
};