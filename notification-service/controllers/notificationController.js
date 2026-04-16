const { sendEmail, 
        buildAppointmentConfirmedEmail,
        buildCancellationEmail,
        buildRescheduleEmail,
        buildDoctorVerificationEmail,
        buildSessionLinkEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');

const notify = async ({ email, phone, channels, subject, htmlEmail, smsMessage }) => {
  const tasks = [];
  if (channels.includes('email') && email) {
    tasks.push(sendEmail({ to: email, subject, html: htmlEmail, text: smsMessage }));
  }
  if (channels.includes('sms') && phone) {
    tasks.push(sendSMS({ to: phone, message: smsMessage }));
  }
  await Promise.all(tasks);
};

const appointmentNotification = async (req, res) => {
  try {
    const {
      patientName, patientEmail, patientPhone, patientNotificationPreference,
      doctorName, doctorEmail, doctorPhone, doctorNotificationPreference,
      appointmentDate, appointmentTime, appointmentType, queueNumber, specialty
    } = req.body;

    const subject = 'Appointment Confirmed — HealthLink';
    const plainPatient = `Hi ${patientName}, your appointment with Dr. ${doctorName} is confirmed on ${appointmentDate} at ${appointmentTime}.`;
    const plainDoctor  = `Hi Dr. ${doctorName}, you have an appointment with ${patientName} on ${appointmentDate} at ${appointmentTime}.`;

    await Promise.all([
      notify({
        email: patientEmail, phone: patientPhone,
        channels: patientNotificationPreference,
        subject,
        htmlEmail: buildAppointmentConfirmedEmail({
          recipientName: patientName, isDoctor: false,
          doctorName, patientName, specialty,
          date: appointmentDate, time: appointmentTime,
          appointmentType, queueNumber
        }),
        smsMessage: plainPatient
      }),
      notify({
        email: doctorEmail, phone: doctorPhone,
        channels: doctorNotificationPreference,
        subject,
        htmlEmail: buildAppointmentConfirmedEmail({
          recipientName: `Dr. ${doctorName}`, isDoctor: true,
          doctorName, patientName, specialty,
          date: appointmentDate, time: appointmentTime,
          appointmentType, queueNumber
        }),
        smsMessage: plainDoctor
      })
    ]);

    res.json({ message: 'Appointment notifications sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancellationNotification = async (req, res) => {
  try {
    const {
      patientName, patientEmail, patientPhone, patientNotificationPreference,
      doctorName, doctorEmail, doctorPhone, doctorNotificationPreference,
      appointmentDate, appointmentTime
    } = req.body;

    const subject = 'Appointment Cancelled — HealthLink';
    const args = { doctorName, patientName, date: appointmentDate, time: appointmentTime };

    await Promise.all([
      notify({
        email: patientEmail, phone: patientPhone,
        channels: patientNotificationPreference, subject,
        htmlEmail: buildCancellationEmail({ recipientName: patientName, isDoctor: false, ...args }),
        smsMessage: `Hi ${patientName}, your appointment with Dr. ${doctorName} on ${appointmentDate} at ${appointmentTime} has been cancelled.`
      }),
      notify({
        email: doctorEmail, phone: doctorPhone,
        channels: doctorNotificationPreference, subject,
        htmlEmail: buildCancellationEmail({ recipientName: `Dr. ${doctorName}`, isDoctor: true, ...args }),
        smsMessage: `Hi Dr. ${doctorName}, your appointment with ${patientName} on ${appointmentDate} at ${appointmentTime} has been cancelled.`
      })
    ]);

    res.json({ message: 'Cancellation notifications sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rescheduleNotification = async (req, res) => {
  try {
    const {
      patientName, patientEmail, patientPhone, patientNotificationPreference,
      doctorName, doctorEmail, doctorPhone, doctorNotificationPreference,
      newDate, newTime
    } = req.body;

    const subject = 'Appointment Rescheduled — HealthLink';
    const args = { doctorName, patientName, newDate, newTime };

    await Promise.all([
      notify({
        email: patientEmail, phone: patientPhone,
        channels: patientNotificationPreference, subject,
        htmlEmail: buildRescheduleEmail({ recipientName: patientName, isDoctor: false, ...args }),
        smsMessage: `Hi ${patientName}, your appointment with Dr. ${doctorName} has been rescheduled to ${newDate} at ${newTime}.`
      }),
      notify({
        email: doctorEmail, phone: doctorPhone,
        channels: doctorNotificationPreference, subject,
        htmlEmail: buildRescheduleEmail({ recipientName: `Dr. ${doctorName}`, isDoctor: true, ...args }),
        smsMessage: `Hi Dr. ${doctorName}, your appointment with ${patientName} has been rescheduled to ${newDate} at ${newTime}.`
      })
    ]);

    res.json({ message: 'Reschedule notifications sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const doctorVerificationNotification = async (req, res) => {
  try {
    const { doctorName, doctorEmail, status } = req.body;
    const approved = status === 'approved';

    await sendEmail({
      to: doctorEmail,
      subject: `Verification ${approved ? 'Approved' : 'Rejected'} — HealthLink`,
      html: buildDoctorVerificationEmail({ doctorName, approved }),
      text: approved
        ? `Hi Dr. ${doctorName}, your account has been verified.`
        : `Hi Dr. ${doctorName}, your verification was rejected. Please contact support.`
    });

    res.json({ message: 'Doctor verification notification sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sessionLinkNotification = async (req, res) => {
  try {
    const { patientName, patientEmail, doctorName, doctorEmail, sessionLink, sessionDate, sessionTime } = req.body;

    const subject = 'Your Telemedicine Session — HealthLink';
    const args = { doctorName, patientName, sessionDate, sessionTime, sessionLink };

    await Promise.all([
      sendEmail({ to: patientEmail, subject,
        html: buildSessionLinkEmail({ recipientName: patientName, isDoctor: false, ...args }),
        text: `Hi ${patientName}, join your session with Dr. ${doctorName} at: ${sessionLink}`
      }),
      sendEmail({ to: doctorEmail, subject,
        html: buildSessionLinkEmail({ recipientName: `Dr. ${doctorName}`, isDoctor: true, ...args }),
        text: `Hi Dr. ${doctorName}, join your session with ${patientName} at: ${sessionLink}`
      })
    ]);

    res.json({ message: 'Session link notifications sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const telemedicineNotification = async (req, res) => {
  try {
    const { patientName, patientEmail, patientPhone, patientNotificationPreference,
            doctorName, doctorEmail, doctorPhone, doctorNotificationPreference,
            sessionDate, duration, prescriptionLink } = req.body;

    const subject = 'Telemedicine Session Complete — HealthLink';
    const plainPatient = `Hi ${patientName}, your session with Dr. ${doctorName} on ${sessionDate} is complete. Prescription: ${prescriptionLink || 'N/A'}`;
    const plainDoctor  = `Hi Dr. ${doctorName}, your session with ${patientName} on ${sessionDate} is now complete.`;

    await Promise.all([
      notify({ email: patientEmail, phone: patientPhone, channels: patientNotificationPreference,
               subject, htmlEmail: plainPatient, smsMessage: plainPatient }),
      notify({ email: doctorEmail, phone: doctorPhone, channels: doctorNotificationPreference,
               subject, htmlEmail: plainDoctor, smsMessage: plainDoctor })
    ]);

    res.json({ message: 'Telemedicine notifications sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  appointmentNotification, cancellationNotification, rescheduleNotification,
  telemedicineNotification, doctorVerificationNotification, sessionLinkNotification
};