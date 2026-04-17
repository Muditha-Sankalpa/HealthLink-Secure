const NOTIFICATION_SERVICE_URL = 'http://localhost:5007/api/notifications';
const PATIENT_SERVICE_URL      = 'http://localhost:5001/api/patients'; // patient-service (no-auth internal route)
const DOCTOR_SERVICE_URL       = 'http://localhost:5002/api/doctors';

const Appointment = require('../models/Appointment');
const TimeSlot    = require('../models/TimeSlot');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch full patient profile from patient-service.
 * Uses the unauthenticated internal GET /:id route (patientRoutes.js).
 * Returns a safe fallback so a failed lookup never blocks the main action.
 */
const fetchPatient = async (patientId) => {
    try {
        const res = await axios.get(`${PATIENT_SERVICE_URL}/${patientId}`);
        return res.data; // { name, email, contactNumber, notificationPreference }
    } catch {
        return { name: 'Patient', email: null, contactNumber: null, notificationPreference: ['email'] };
    }
};

/**
 * Resolve notification channels for a party.
 * Always ensures 'email' is present as a baseline fallback.
 */
const resolveChannels = (preference) => {
    const prefs = Array.isArray(preference) && preference.length ? preference : ['email'];
    return prefs.includes('email') ? prefs : ['email', ...prefs];
};

/**
 * Fire-and-forget: POST to notification service.
 * Never throws — logs on failure so the main action always succeeds.
 */
const fireNotification = (endpoint, payload) => {
    axios
        .post(`${NOTIFICATION_SERVICE_URL}/${endpoint}`, payload)
        .catch(err => console.error(`[Notification/${endpoint}] failed:`, err.message));
};

// ─────────────────────────────────────────────────────────────────────────────
// Slot generator
// ─────────────────────────────────────────────────────────────────────────────

const generateNextSlot = async (doctorId, date) => {
    const lastSlot = await TimeSlot.find({ doctorId, date })
        .sort({ queueNumber: -1 })
        .limit(1);

    let startHour = 9, startMinute = 0;

    if (lastSlot.length > 0) {
        const [hour, minute] = lastSlot[0].endTime.split(':').map(Number);
        startHour = hour;
        startMinute = minute;
    }

    let endHour = startHour;
    let endMinute = startMinute + 30;
    if (endMinute >= 60) { endMinute -= 60; endHour += 1; }

    const fmtStartHour = startHour.toString().padStart(2, '0');
    const fmtStartMin  = startMinute.toString().padStart(2, '0');
    const fmtEndHour   = endHour.toString().padStart(2, '0');
    const fmtEndMin    = endMinute.toString().padStart(2, '0');

    const slotId      = `TS-${doctorId}-${date}-${fmtStartHour}-${fmtStartMin}`;
    const queueNumber = lastSlot.length > 0 ? lastSlot[0].queueNumber + 1 : 1;

    const newSlot = new TimeSlot({
        slotId, doctorId, date,
        startTime:   `${fmtStartHour}:${fmtStartMin}`,
        endTime:     `${fmtEndHour}:${fmtEndMin}`,
        queueNumber,
        isBooked: false
    });

    await newSlot.save();
    return newSlot;
};

// ─────────────────────────────────────────────────────────────────────────────
// Check next available slot (preview before booking)
// ─────────────────────────────────────────────────────────────────────────────

exports.checkNextAvailableSlot = async (req, res) => {
    try {
        const { doctorId, date } = req.query;
        if (!doctorId || !date) return res.status(400).json({ message: 'Missing doctorId or date' });

        let slot = await TimeSlot.findOne({ doctorId, date, isBooked: false }).sort({ queueNumber: 1 });

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
                startTime:   `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
                endTime:     `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
                queueNumber: lastSlot.length > 0 ? lastSlot[0].queueNumber + 1 : 1
            };
        }

        res.status(200).json(slot);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Book an Appointment
//    Notifications: appointment_confirmed → patient (email + sms)
//                                         → doctor  (email + sms per preference)
// ─────────────────────────────────────────────────────────────────────────────

exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, appointmentType, notes } = req.body;

        if (!doctorId || !date || !appointmentType) {
            return res.status(400).json({ message: 'doctorId, date, and appointmentType are required.' });
        }

        // 1. Fetch doctor (fatal if not found)
        let doctor;
        try {
            const doctorRes = await axios.get(`${DOCTOR_SERVICE_URL}/${doctorId}`);
            doctor = doctorRes.data;
        } catch {
            return res.status(404).json({ message: 'Doctor not found in the Doctor Service system.' });
        }

        // 2. Fetch patient profile (non-fatal — fallback used if unavailable)
        const patient = await fetchPatient(req.user.id);

        // 3. Find or generate slot
        let slot = await TimeSlot.findOne({ doctorId, date, isBooked: false }).sort({ queueNumber: 1 });
        if (!slot) slot = await generateNextSlot(doctorId, date);

        slot.isBooked = true;
        await slot.save();

        // 4. Save appointment
        const newAppointment = new Appointment({
            appointmentId:  `APPT-${uuidv4()}`,
            appointmentType,
            patientId:      req.user.id,
            doctorId:       doctor._id,
            doctorName:     doctor.name,
            specialty:      doctor.specialty,
            date,
            timeSlotId:     slot.slotId,
            queueNumber:    slot.queueNumber,
            startTime:      slot.startTime,
            endTime:        slot.endTime,
            notes
        });

        await newAppointment.save();

        // 5. Fire notification — email + sms to both patient and doctor
        fireNotification('appointment', {
            // Patient
            patientName:                   patient.name,
            patientEmail:                  patient.email,
            patientPhone:                  patient.contactNumber || null,
            patientNotificationPreference: resolveChannels(patient.notificationPreference),

            // Doctor
            doctorName:                   doctor.name,
            doctorEmail:                  doctor.email,
            doctorPhone:                  doctor.contactNumber || null,
            doctorNotificationPreference: resolveChannels(doctor.notificationPreference),

            // Appointment details
            appointmentDate: date,
            appointmentTime: `${slot.startTime} – ${slot.endTime}`,
            appointmentType,
            queueNumber:     slot.queueNumber,
            specialty:       doctor.specialty,
        });

        res.status(201).json({
            message:     'Appointment booked successfully',
            appointment: newAppointment,
            queueNumber: slot.queueNumber,
            slotStart:   slot.startTime,
            slotEnd:     slot.endTime
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Track / View My Appointments
// ─────────────────────────────────────────────────────────────────────────────

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
                    startTime:   slot ? slot.startTime   : null,
                    endTime:     slot ? slot.endTime     : null
                };
            })
        );

        res.status(200).json(appointmentsWithDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Reschedule Appointment
//    Notifications: reschedule → patient (email + sms)
//                              → doctor  (email + sms per preference)
// ─────────────────────────────────────────────────────────────────────────────

exports.updateAppointment = async (req, res) => {
    try {
        const { date, notes } = req.body;

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: req.user.id
        });

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        let dateChanged = false;

        if (date && date !== String(appointment.date).split('T')[0]) {
            // Free old slot
            await TimeSlot.findOneAndUpdate({ slotId: appointment.timeSlotId }, { isBooked: false });

            // Claim new slot
            let newSlot = await TimeSlot.findOne({
                doctorId: appointment.doctorId, date, isBooked: false
            }).sort({ queueNumber: 1 });

            if (!newSlot) newSlot = await generateNextSlot(appointment.doctorId, date);

            newSlot.isBooked = true;
            await newSlot.save();

            appointment.date        = date;
            appointment.timeSlotId  = newSlot.slotId;
            appointment.queueNumber = newSlot.queueNumber;
            appointment.startTime   = newSlot.startTime;
            appointment.endTime     = newSlot.endTime;
            dateChanged = true;
        }

        if (notes !== undefined) appointment.notes = notes;

        await appointment.save();

        // Notify only when the date actually changed (not notes-only edits)
        if (dateChanged) {
            const [patient, doctor] = await Promise.all([
                fetchPatient(req.user.id),
                axios.get(`${DOCTOR_SERVICE_URL}/${appointment.doctorId}`)
                    .then(r => r.data)
                    .catch(() => ({ name: appointment.doctorName, email: null, contactNumber: null, notificationPreference: ['email'] }))
            ]);

            fireNotification('reschedule', {
                // Patient
                patientName:                   patient.name,
                patientEmail:                  patient.email,
                patientPhone:                  patient.contactNumber || null,
                patientNotificationPreference: resolveChannels(patient.notificationPreference),

                // Doctor
                doctorName:                   doctor.name,
                doctorEmail:                  doctor.email,
                doctorPhone:                  doctor.contactNumber || null,
                doctorNotificationPreference: resolveChannels(doctor.notificationPreference),

                // New slot details
                newDate: appointment.date,
                newTime: `${appointment.startTime} – ${appointment.endTime}`,
            });
        }

        res.status(200).json({ message: 'Appointment rescheduled successfully', appointment });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Cancel Appointment (patient)
//    Notifications: cancellation → patient (email + sms)
//                                → doctor  (email + sms per preference)
// ─────────────────────────────────────────────────────────────────────────────

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

        // Fetch patient + doctor in parallel (non-fatal)
        const [patient, doctor] = await Promise.all([
            fetchPatient(req.user.id),
            axios.get(`${DOCTOR_SERVICE_URL}/${appointment.doctorId}`)
                .then(r => r.data)
                .catch(() => ({ name: appointment.doctorName, email: null, contactNumber: null, notificationPreference: ['email'] }))
        ]);

        fireNotification('cancellation', {
            // Patient
            patientName:                   patient.name,
            patientEmail:                  patient.email,
            patientPhone:                  patient.contactNumber || null,
            patientNotificationPreference: resolveChannels(patient.notificationPreference),

            // Doctor
            doctorName:                   doctor.name,
            doctorEmail:                  doctor.email,
            doctorPhone:                  doctor.contactNumber || null,
            doctorNotificationPreference: resolveChannels(doctor.notificationPreference),

            // Appointment details for the email body
            appointmentDate: appointment.date,
            appointmentTime: `${appointment.startTime} – ${appointment.endTime}`,
        });

        res.status(200).json({ message: 'Appointment cancelled successfully', appointment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin functions
// ─────────────────────────────────────────────────────────────────────────────

exports.getAllAppointments = async (req, res) => {
    try {
        const { doctorId, date, status } = req.query;
        const query = {};
        if (doctorId) query.doctorId = doctorId;
        if (date)     query.date     = date;
        if (status)   query.status   = status;

        const appointments = await Appointment.find(query).sort({ date: 1, queueNumber: 1 }).lean();
        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin cancel — also notifies patient + doctor
exports.adminCancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (appointment.timeSlotId) {
            await TimeSlot.findOneAndUpdate({ slotId: appointment.timeSlotId }, { isBooked: false });
        }

        appointment.status = 'Cancelled';
        appointment.notes  = appointment.notes
            ? appointment.notes + ' (Cancelled by Admin)'
            : 'Cancelled by Admin';
        await appointment.save();

        // Fetch patient + doctor in parallel (non-fatal)
        const [patient, doctor] = await Promise.all([
            fetchPatient(appointment.patientId),
            axios.get(`${DOCTOR_SERVICE_URL}/${appointment.doctorId}`)
                .then(r => r.data)
                .catch(() => ({ name: appointment.doctorName, email: null, contactNumber: null, notificationPreference: ['email'] }))
        ]);

        fireNotification('cancellation', {
            patientName:                   patient.name,
            patientEmail:                  patient.email,
            patientPhone:                  patient.contactNumber || null,
            patientNotificationPreference: resolveChannels(patient.notificationPreference),

            doctorName:                   doctor.name,
            doctorEmail:                  doctor.email,
            doctorPhone:                  doctor.contactNumber || null,
            doctorNotificationPreference: resolveChannels(doctor.notificationPreference),

            appointmentDate: appointment.date,
            appointmentTime: `${appointment.startTime} – ${appointment.endTime}`,
        });

        res.status(200).json({ message: 'Appointment cancelled successfully by Admin', appointment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTimeSlots = async (req, res) => {
    try {
        const { doctorId, date, isBooked } = req.query;
        const query = {};
        if (doctorId)             query.doctorId = doctorId;
        if (date)                 query.date     = date;
        if (isBooked !== undefined) query.isBooked = isBooked === 'true';

        const slots = await TimeSlot.find(query).sort({ date: 1, queueNumber: 1 });
        res.status(200).json(slots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const totalAppointments     = await Appointment.countDocuments();
        const activeAppointments    = await Appointment.countDocuments({ status: { $ne: 'Cancelled' } });
        const cancelledAppointments = await Appointment.countDocuments({ status: 'Cancelled' });

        res.status(200).json({ totalAppointments, activeAppointments, cancelledAppointments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/appointments/doctor/:doctorId
exports.getAppointmentsByDoctor = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.params.doctorId })
            .sort({ date: 1, queueNumber: 1 })
            .lean();
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.generateNextSlot = generateNextSlot;