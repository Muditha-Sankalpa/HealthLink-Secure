// models/Payment.js

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  
  paymentIntentId: {
    type: String,
    required: true,
    unique: true
  },

  appointmentId: {
    type: String,
    required: true
  },

  patientId: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  currency: {
    type: String,
    default: 'usd'
  },

  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  },

  // Optional but useful
  paymentMethod: {
    type: String,
    default: 'card'
  }

}, {
  timestamps: true // adds createdAt & updatedAt
});

module.exports = mongoose.model('Payment', paymentSchema);