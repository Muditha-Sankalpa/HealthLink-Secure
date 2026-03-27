const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  qualification: { type: String },
  experience: { type: Number },
  consultationFee: { type: Number, required: true },
  contactNumber: { type: String },
  email: { type: String },
  availability: [{
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    isAvailable: { type: Boolean, default: true }
  }],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);