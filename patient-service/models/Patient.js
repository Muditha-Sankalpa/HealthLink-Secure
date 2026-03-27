const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String },
  contactNumber: { type: String },
  address: { type: String },
  bloodGroup: { type: String },
  status: { type: String, enum: ['active', 'deactivated'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);