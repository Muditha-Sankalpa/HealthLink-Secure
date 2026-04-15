const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  patientId: { type: String, required: true },
  appointmentId: { type: String, required: true },
  diagnosis: { type: String },
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String },
    instructions: { type: String }
  }],
  notes: { type: String },
  followUpDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);