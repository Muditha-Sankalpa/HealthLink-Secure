const Appointment = require('../models/Appointment');
const TimeSlot = require('../models/TimeSlot');
const { v4: uuidv4 } = require('uuid');

// --- DUMMY DOCTOR DATA ---
const DUMMY_DOCTORS =[
    { id: "d1", name: "Dr. Amal Silva", specialty: "Cardiologist" },
    { id: "d2", name: "Dr. Sunethra Perera", specialty: "Dermatologist" },
    { id: "d3", name: "Dr. Nuwan Fernando", specialty: "Cardiologist" },
    { id: "d4", name: "Dr. Keshani Jayasuriya", specialty: "Pediatrician" }
];

const generateNextSlot = async (doctorId, date) => {
    // FIX 1: Sort by queueNumber instead of string endTime
    const lastSlot = await TimeSlot.find({ doctorId, date })
        .sort({ queueNumber: -1 })
        .limit(1);

    let startHour = 9; // default start time if no slots exist
    let startMinute = 0;

    if (lastSlot.length > 0) {
        const [hour, minute] = lastSlot[0].endTime.split(':').map(Number);
        startHour = hour;
        startMinute = minute;
    }

    // Compute next slot end time (30 mins per slot)
    let endHour = startHour;
    let endMinute = startMinute + 30;
    if (endMinute >= 60) {
        endMinute -= 60;
        endHour += 1;
    }

    // FIX 2: Zero-pad the hours so "9:30" becomes "09:30"
    const fmtStartHour = startHour.toString().padStart(2, '0');
    const fmtStartMin = startMinute.toString().padStart(2, '0');
    const fmtEndHour = endHour.toString().padStart(2, '0');
    const fmtEndMin = endMinute.toString().padStart(2, '0');

    // Keep slot ID formatting safe and consistent
    const slotId = `TS-${doctorId}-${date}-${fmtStartHour}-${fmtStartMin}`;
    const queueNumber = lastSlot.length > 0 ? lastSlot[0].queueNumber + 1 : 1;

    const newSlot = new TimeSlot({
        slotId,
        doctorId,
        date,
        startTime: `${fmtStartHour}:${fmtStartMin}`,
        endTime: `${fmtEndHour}:${fmtEndMin}`,
        queueNumber,
        isBooked: false
    });

    await newSlot.save();
    return newSlot;
};

// GET /timeslots/:doctorId/:date
const getAvailableSlots = async (req, res) => {
    const { doctorId, date } = req.params;

    const slots = await TimeSlot.find({
        doctorId,
        date,
        isBooked: false
    });

    res.json(slots);
};

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
        const { doctorId, date, appointmentType, notes } = req.body;

        if (!doctorId || !date || !appointmentType) {
            return res.status(400).json({ message: 'doctorId, date, and appointmentType are required.' });
        }

        // Find doctor
        const doctor = DUMMY_DOCTORS.find(d => d.id === doctorId);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        // Find earliest available slot
        let slot = await TimeSlot.findOne({ doctorId, date, isBooked: false }).sort({ queueNumber: 1 });

        // If no slot exists, generate dynamically
        if (!slot) {
            slot = await generateNextSlot(doctorId, date);
        }

        // Book the slot
        slot.isBooked = true;
        await slot.save();

        // Create appointment
        const newAppointment = new Appointment({
            appointmentId: `APPT-${uuidv4()}`,
            appointmentType,             // physical or online
            patientId: req.user.id,
            doctorId: doctor.id,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            date,
            timeSlotId: slot.slotId,
            queueNumber: slot.queueNumber,
            startTime: slot.startTime,
            endTime: slot.endTime,   
            notes
        });

        await newAppointment.save();

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment: newAppointment,
            queueNumber: slot.queueNumber,
            slotStart: slot.startTime,
            slotEnd: slot.endTime
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Track/View My Appointments
exports.getMyAppointments = async (req, res) => {
    try {
        // .lean() converts Mongoose documents to plain JavaScript objects 
        // so we can easily add new properties to them
        const appointments = await Appointment.find({ patientId: req.user.id })
            .sort({ date: 1 })
            .lean();

        // Loop through each appointment and fetch its corresponding TimeSlot details
        const appointmentsWithDetails = await Promise.all(
            appointments.map(async (appt) => {
                const slot = await TimeSlot.findOne({ slotId: appt.timeSlotId });
                
                return {
                    ...appt,
                    queueNumber: slot ? slot.queueNumber : null,
                    startTime: slot ? slot.startTime : null,
                    endTime: slot ? slot.endTime : null
                };
            })
        );

        res.status(200).json(appointmentsWithDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Modify/Reschedule Appointment
exports.updateAppointment = async (req, res) => {
    try {
        // The user only needs to send the NEW date and any updated notes
        const { date, notes } = req.body;

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: req.user.id
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // If the user is moving the appointment to a NEW date:
        if (date && date !== appointment.date) {
            
            // 🔓 1. Free the OLD slot
            await TimeSlot.findOneAndUpdate(
                { slotId: appointment.timeSlotId },
                { isBooked: false }
            );

            // 🔍 2. Find the earliest available slot on the NEW date
            let newSlot = await TimeSlot.findOne({ 
                doctorId: appointment.doctorId, 
                date: date, 
                isBooked: false 
            }).sort({ queueNumber: 1 });

            // ⚙️ 3. If no slot exists on the new date, dynamically generate the first one!
            if (!newSlot) {
                newSlot = await generateNextSlot(appointment.doctorId, date);
            }

            // 🔒 4. Lock the NEW slot
            newSlot.isBooked = true;
            await newSlot.save();

            // 📝 5. Update appointment with the new slot details
            appointment.date = date;
            appointment.timeSlotId = newSlot.slotId;
            
            // Update the queue details so the patient sees their new time!
            appointment.queueNumber = newSlot.queueNumber; 
            appointment.startTime = newSlot.startTime;
            appointment.endTime = newSlot.endTime;
        }

        // Update notes if provided in the request
        if (notes !== undefined) {
            appointment.notes = notes;
        }

        await appointment.save();

        res.status(200).json({
            message: 'Appointment rescheduled successfully',
            appointment
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Cancel Appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: req.user.id
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // 🔓 Free slot
        await TimeSlot.findOneAndUpdate(
            { slotId: appointment.timeSlotId },
            { isBooked: false }
        );

        appointment.status = 'Cancelled';
        await appointment.save();

        res.status(200).json({
            message: 'Appointment cancelled successfully',
            appointment
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.generateNextSlot = generateNextSlot;