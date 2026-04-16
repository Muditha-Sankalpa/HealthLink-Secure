const NOTIFICATION_SERVICE_URL = 'http://localhost:5007/api/notifications';
const USER_SERVICE_URL = 'http://localhost:5006';
const Appointment = require('../models/Appointment');
const TimeSlot = require('../models/TimeSlot');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); // ADD AXIOS for microservice communication

// Base URL for the Doctor Service
const DOCTOR_SERVICE_URL = 'http://localhost:5002/api/doctors';

const generateNextSlot = async (doctorId, date) => {
    const lastSlot = await TimeSlot.find({ doctorId, date })
        .sort({ queueNumber: -1 })
        .limit(1);

    let startHour = 9; // default start time
    let startMinute = 0;

    if (lastSlot.length > 0) {
        const [hour, minute] = lastSlot[0].endTime.split(':').map(Number);
        startHour = hour;
        startMinute = minute;
    }

    let endHour = startHour;
    let endMinute = startMinute + 30;
    if (endMinute >= 60) {
        endMinute -= 60;
        endHour += 1;
    }

    const fmtStartHour = startHour.toString().padStart(2, '0');
    const fmtStartMin = startMinute.toString().padStart(2, '0');
    const fmtEndHour = endHour.toString().padStart(2, '0');
    const fmtEndMin = endMinute.toString().padStart(2, '0');

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

// Add this new function to check the estimated time slot BEFORE booking
exports.checkNextAvailableSlot = async (req, res) => {
    try {
        const { doctorId, date } = req.query;
        if (!doctorId || !date) return res.status(400).json({ message: "Missing doctorId or date" });

        // 1. Check if there's an existing unbooked slot
        let slot = await TimeSlot.findOne({ doctorId, date, isBooked: false }).sort({ queueNumber: 1 });

        // 2. If no slot exists, calculate what the NEXT one will be (without saving it to DB)
        if (!slot) {
            const lastSlot = await TimeSlot.find({ doctorId, date }).sort({ queueNumber: -1 }).limit(1);
            let startHour = 9, startMinute = 0;
            
            if (lastSlot.length > 0) {
                const [hour, minute] = lastSlot[0].endTime.split(':').map(Number);
                startHour = hour; startMinute = minute;
            }
            
            let endHour = startHour, endMinute = startMinute + 30;
            if (endMinute >= 60) { endMinute -= 60; endHour += 1; }

            slot = {
                startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
                endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
                queueNumber: lastSlot.length > 0 ? lastSlot[0].queueNumber + 1 : 1
            };
        }

        res.status(200).json(slot);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 1. Book an Appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, appointmentType, notes } = req.body;

        if (!doctorId || !date || !appointmentType) {
            return res.status(400).json({ message: 'doctorId, date, and appointmentType are required.' });
        }

        // 1. Fetch doctor details
        let doctor;
        try {
            const doctorRes = await axios.get(`${DOCTOR_SERVICE_URL}/${doctorId}`);
            doctor = doctorRes.data;
        } catch (err) {
            return res.status(404).json({ message: 'Doctor not found in the Doctor Service system.' });
        }

        // 2. Fetch patient details from User/Auth service
        let patient;
        try {
            const userRes = await axios.get(`${USER_SERVICE_URL}/users/${req.user.id}`);
            patient = userRes.data;
        } catch (err) {
            // Non-fatal — fall back to just the ID so booking still succeeds
            patient = { name: 'Patient', email: null, contactNumber: null };
        }

        // 3. Find or generate slot
        let slot = await TimeSlot.findOne({ doctorId, date, isBooked: false }).sort({ queueNumber: 1 });
        if (!slot) {
            slot = await generateNextSlot(doctorId, date);
        }

        slot.isBooked = true;
        await slot.save();

        // 4. Save appointment
        const newAppointment = new Appointment({
            appointmentId: `APPT-${uuidv4()}`,
            appointmentType,
            patientId: req.user.id,
            doctorId: doctor._id,
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

        // 5. Send notifications (fire-and-forget — don't let this block or fail the booking)
        const appointmentTime = `${slot.startTime} – ${slot.endTime}`;
        const doctorChannels = doctor.notificationPreference?.length
            ? doctor.notificationPreference
            : ['email']; // fallback to email if preference missing

        axios.post(`${NOTIFICATION_SERVICE_URL}/appointment`, {
            // Patient — always email
            patientName:                   patient.name,
            patientEmail:                  patient.email,
            patientPhone:                  patient.contactNumber || null,
            patientNotificationPreference: ['email'],

            // Doctor — use their saved preference, email always included
            doctorName:                   doctor.name,
            doctorEmail:                  doctor.email,
            doctorPhone:                  doctor.contactNumber || null,
            doctorNotificationPreference: doctorChannels.includes('email')
                ? doctorChannels                    // already has email
                : ['email', ...doctorChannels],     // force-prepend email

            appointmentDate: date,
            appointmentTime
        }).catch(err => console.error('[Notification] Appointment notify failed:', err.message));

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

// 2. Track/View My Appointments
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user.id })
            .sort({ date: 1 })
            .lean();

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

// 3. Modify/Reschedule Appointment
exports.updateAppointment = async (req, res) => {
    try {
        const { date, notes } = req.body;

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: req.user.id
        });

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (date && date !== appointment.date) {
            await TimeSlot.findOneAndUpdate({ slotId: appointment.timeSlotId }, { isBooked: false });

            let newSlot = await TimeSlot.findOne({ doctorId: appointment.doctorId, date: date, isBooked: false }).sort({ queueNumber: 1 });

            if (!newSlot) {
                newSlot = await generateNextSlot(appointment.doctorId, date);
            }

            newSlot.isBooked = true;
            await newSlot.save();

            appointment.date = date;
            appointment.timeSlotId = newSlot.slotId;
            appointment.queueNumber = newSlot.queueNumber; 
            appointment.startTime = newSlot.startTime;
            appointment.endTime = newSlot.endTime;
        }

        if (notes !== undefined) appointment.notes = notes;

        await appointment.save();

        res.status(200).json({ message: 'Appointment rescheduled successfully', appointment });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Cancel Appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: req.user.id
        });

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        await TimeSlot.findOneAndUpdate({ slotId: appointment.timeSlotId }, { isBooked: false });

        appointment.status = 'Cancelled';
        await appointment.save();

        res.status(200).json({ message: 'Appointment cancelled successfully', appointment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- ADMIN CONTROLLER FUNCTIONS ---

exports.getAllAppointments = async (req, res) => {
    try {
        const { doctorId, date, status } = req.query;
        let query = {};
        if (doctorId) query.doctorId = doctorId;
        if (date) query.date = date;
        if (status) query.status = status;

        const appointments = await Appointment.find(query).sort({ date: 1, queueNumber: 1 }).lean();
        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.adminCancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (appointment.timeSlotId) {
            await TimeSlot.findOneAndUpdate({ slotId: appointment.timeSlotId }, { isBooked: false });
        }

        appointment.status = 'Cancelled';
        appointment.notes = appointment.notes ? appointment.notes + ' (Cancelled by Admin)' : 'Cancelled by Admin';
        await appointment.save();

        res.status(200).json({ message: 'Appointment cancelled successfully by Admin', appointment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTimeSlots = async (req, res) => {
    try {
        const { doctorId, date, isBooked } = req.query;
        let query = {};
        if (doctorId) query.doctorId = doctorId;
        if (date) query.date = date;
        if (isBooked !== undefined) query.isBooked = isBooked === 'true';

        const slots = await TimeSlot.find(query).sort({ date: 1, queueNumber: 1 });
        res.status(200).json(slots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const totalAppointments = await Appointment.countDocuments();
        const activeAppointments = await Appointment.countDocuments({ status: { $ne: 'Cancelled' } });
        const cancelledAppointments = await Appointment.countDocuments({ status: 'Cancelled' });
        
        res.status(200).json({
            totalAppointments,
            activeAppointments,
            cancelledAppointments
            // Notice: I removed totalDoctors here. In microservices, the Admin Dashboard UI 
            // should fetch the Doctor count directly from the Doctor Service, not the Appointment service!
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/appointments/doctor/:doctorId - Get appointments for a specific doctor
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Optional: Verify the requesting doctor is requesting their own appointments
    if (req.user.role === 'Doctor' && req.user.id !== doctorId) {
      // If doctorId is MongoDB _id, you may need to resolve it first
      // For now, allow if token is valid (Doctor Service handles authorization)
    }
    
    const appointments = await Appointment.find({ doctorId })
      .sort({ date: 1, queueNumber: 1 })
      .lean();
    
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateNextSlot = generateNextSlot;