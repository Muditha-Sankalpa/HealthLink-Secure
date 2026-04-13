const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');

// Core send function — respects notificationPreference channels
const notify = async ({ email, phone, channels, subject, emailBody, smsMessage }) => {
  const tasks = [];
  if (channels.includes('email') && email) tasks.push(sendEmail({ to: email, subject, body: emailBody }));
  if (channels.includes('sms') && phone) tasks.push(sendSMS({ to: phone, message: smsMessage }));
  await Promise.all(tasks);
};

// Email-only send — used for system notifications
const notifyEmailOnly = async ({ email, subject, emailBody }) => {
  await sendEmail({ to: email, subject, body: emailBody });
};

const appointmentNotification = async (req, res) => {
  try {
    const {
      patientName, patientEmail, patientPhone, patientNotificationPreference,
      doctorName, doctorEmail, doctorPhone, doctorNotificationPreference,
      appointmentDate, appointmentTime
    } = req.body;

    const subject = 'Appointment Confirmation — Smart Healthcare';
    const patientMsg = `Hi ${patientName}, your appointment with Dr. ${doctorName} is confirmed on ${appointmentDate} at ${appointmentTime}.`;
    const doctorMsg = `Hi Dr. ${doctorName}, you have an appointment with ${patientName} on ${appointmentDate} at ${appointmentTime}.`;

    await Promise.all([
      notify({ email: patientEmail, phone: patientPhone, channels: patientNotificationPreference, subject, emailBody: patientMsg, smsMessage: patientMsg }),
      notify({ email: doctorEmail, phone: doctorPhone, channels: doctorNotificationPreference, subject, emailBody: doctorMsg, smsMessage: doctorMsg })
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

    const subject = 'Appointment Cancelled — Smart Healthcare';
    const patientMsg = `Hi ${patientName}, your appointment with Dr. ${doctorName} on ${appointmentDate} at ${appointmentTime} has been cancelled.`;
    const doctorMsg = `Hi Dr. ${doctorName}, your appointment with ${patientName} on ${appointmentDate} at ${appointmentTime} has been cancelled.`;

    await Promise.all([
      notify({ email: patientEmail, phone: patientPhone, channels: patientNotificationPreference, subject, emailBody: patientMsg, smsMessage: patientMsg }),
      notify({ email: doctorEmail, phone: doctorPhone, channels: doctorNotificationPreference, subject, emailBody: doctorMsg, smsMessage: doctorMsg })
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

    const subject = 'Appointment Rescheduled — Smart Healthcare';
    const patientMsg = `Hi ${patientName}, your appointment with Dr. ${doctorName} has been rescheduled to ${newDate} at ${newTime}.`;
    const doctorMsg = `Hi Dr. ${doctorName}, your appointment with ${patientName} has been rescheduled to ${newDate} at ${newTime}.`;

    await Promise.all([
      notify({ email: patientEmail, phone: patientPhone, channels: patientNotificationPreference, subject, emailBody: patientMsg, smsMessage: patientMsg }),
      notify({ email: doctorEmail, phone: doctorPhone, channels: doctorNotificationPreference, subject, emailBody: doctorMsg, smsMessage: doctorMsg })
    ]);

    res.json({ message: 'Reschedule notifications sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const telemedicineNotification = async (req, res) => {
  try {
    const {
      patientName, patientEmail, patientPhone, patientNotificationPreference,
      doctorName, doctorEmail, doctorPhone, doctorNotificationPreference,
      sessionDate, duration, prescriptionLink
    } = req.body;

    const subject = 'Telemedicine Session Completed — Smart Healthcare';
    const patientMsg = `Hi ${patientName}, your telemedicine session with Dr. ${doctorName} on ${sessionDate} (${duration}) is complete. View prescription: ${prescriptionLink || 'N/A'}`;
    const doctorMsg = `Hi Dr. ${doctorName}, your telemedicine session with ${patientName} on ${sessionDate} (${duration}) is now complete.`;

    await Promise.all([
      notify({ email: patientEmail, phone: patientPhone, channels: patientNotificationPreference, subject, emailBody: patientMsg, smsMessage: patientMsg }),
      notify({ email: doctorEmail, phone: doctorPhone, channels: doctorNotificationPreference, subject, emailBody: doctorMsg, smsMessage: doctorMsg })
    ]);

    res.json({ message: 'Telemedicine notifications sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const doctorVerificationNotification = async (req, res) => {
  try {
    const { doctorName, doctorEmail, status } = req.body;

    const subject = `Doctor Verification ${status === 'approved' ? 'Approved' : 'Rejected'} — Smart Healthcare`;
    const emailBody = status === 'approved'
      ? `Hi Dr. ${doctorName}, your account has been verified. You can now log in and start accepting appointments.`
      : `Hi Dr. ${doctorName}, unfortunately your verification request has been rejected. Please contact support for more information.`;

    await notifyEmailOnly({ email: doctorEmail, subject, emailBody });

    res.json({ message: 'Doctor verification notification sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sessionLinkNotification = async (req, res) => {
  try {
    const {
      patientName, patientEmail,
      doctorName, doctorEmail,
      sessionLink, sessionDate, sessionTime
    } = req.body;

    const subject = 'Your Telemedicine Session Link — Smart Healthcare';
    const patientBody = `Hi ${patientName}, your telemedicine session with Dr. ${doctorName} is scheduled on ${sessionDate} at ${sessionTime}. Join here: ${sessionLink}`;
    const doctorBody = `Hi Dr. ${doctorName}, your telemedicine session with ${patientName} is scheduled on ${sessionDate} at ${sessionTime}. Join here: ${sessionLink}`;

    await Promise.all([
      notifyEmailOnly({ email: patientEmail, subject, emailBody: patientBody }),
      notifyEmailOnly({ email: doctorEmail, subject, emailBody: doctorBody })
    ]);

    res.json({ message: 'Session link notifications sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  appointmentNotification,
  cancellationNotification,
  rescheduleNotification,
  telemedicineNotification,
  doctorVerificationNotification,
  sessionLinkNotification
};