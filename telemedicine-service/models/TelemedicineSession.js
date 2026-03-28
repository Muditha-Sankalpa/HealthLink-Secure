const mongoose = require('mongoose');

const telemedicineSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },

  appointmentId: {
    type: String,
    required: true
  },

  doctorId: {
    type: String,
    required: true
  },

  patientId: {
    type: String,
    required: true
  },

  sessionTitle: {
    type: String,
    default: "Telemedicine Consultation"
  },

  status: {
    type: String,
    enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED'
  },

  scheduledTime: {
    type: Date,
    required: true
  },

  startTime: Date,
  endTime: Date,

  // Jitsi fields
  roomId: {
    type: String,
    required: true
  },

  meetingLink: {
    type: String,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('TelemedicineSession', telemedicineSessionSchema);