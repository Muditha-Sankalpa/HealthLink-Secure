const Appointment = require('../models/Appointment');

// --- DUMMY DOCTOR DATA ---
const DUMMY_DOCTORS =[
    { id: "d1", name: "Dr. Amal Silva", specialty: "Cardiologist" },
    { id: "d2", name: "Dr. Sunethra Perera", specialty: "Dermatologist" },
    { id: "d3", name: "Dr. Nuwan Fernando", specialty: "Cardiologist" },
    { id: "d4", name: "Dr. Keshani Jayasuriya", specialty: "Pediatrician" }
];

// 1. Search Doctors by Specialty
exports.searchDoctors = (req, res) => {
    const { specialty } = req.query;
    if (specialty) {
        const filtered = DUMMY_DOCTORS.filter(d => d.specialty.toLowerCase() === specialty.toLowerCase());
        return res.status(200).json(filtered);
    }
    res.status(200).json(DUMMY_DOCTORS);
};

// 2. Book an Appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, notes } = req.body;
        
        // Find doctor from dummy data to get name and specialty
        const doctor = DUMMY_DOCTORS.find(d => d.id === doctorId);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const newAppointment = new Appointment({
            patientId: req.user.id,
            patientName: req.user.name,
            doctorId: doctor.id,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            date,
            time,
            notes
        });

        await newAppointment.save();

        // MOCK NOTIFICATION SERVICE
        console.log(`[MOCK NOTIFICATION] SMS & Email sent to Patient ${req.user.id}: Appointment booked with ${doctor.name} on ${date} at ${time}.`);

        res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Track/View My Appointments
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user.id }).sort({ date: 1 });
        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Modify/Reschedule Appointment
exports.updateAppointment = async (req, res) => {
    try {
        const { date, time, notes } = req.body;
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, patientId: req.user.id}, // Ensure patient owns it
            { date, time, notes },
            { new: true }
        );

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        console.log(`[MOCK NOTIFICATION] Appointment modified. New time: ${date} ${time}`);
        res.status(200).json({ message: 'Appointment updated', appointment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Cancel Appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, patientId: req.user.id },
            { status: 'Cancelled' },
            { new: true }
        );

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        console.log(`[MOCK NOTIFICATION] Appointment Cancelled with ${appointment.doctorName}.`);
        res.status(200).json({ message: 'Appointment cancelled successfully', appointment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};