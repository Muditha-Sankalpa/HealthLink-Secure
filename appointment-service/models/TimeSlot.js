const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    slotId: { type: String, required: true, unique: true },
    doctorId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    queueNumber: { type: Number } // next patient number
}, { timestamps: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);