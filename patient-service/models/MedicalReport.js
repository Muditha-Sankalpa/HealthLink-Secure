const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalReport', medicalReportSchema);