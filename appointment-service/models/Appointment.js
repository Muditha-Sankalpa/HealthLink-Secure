const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        required: true,
        unique: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    queueNumber: { type: Number },
    startTime: { type: String },
    endTime: { type: String },
    // Foreign Key (Reference to Doctor collection)
    // doctorId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Doctor',
    //     required: true
    // },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    specialty: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlotId: {
        type: String,
        required: true
    },
    appointmentType: {
        type: String,
        enum: ['Physical', 'Online'],
        required: true
    },
    status: { 
        type: String, 
        enum: ['Scheduled', 'Completed', 'Cancelled'], 
        default: 'Scheduled' 
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);