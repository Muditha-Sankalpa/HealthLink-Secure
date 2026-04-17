const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ── Shared branded email shell ──────────────────────────────────────────────
// Every notification uses this — just pass a title, body HTML, and optional footer note
const buildEmailHTML = ({ title, bodyHTML, footerNote = '' }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F0F2FA;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F2FA;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ── Header ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D1B4B 0%,#122056 60%,#1e3575 100%);
                        border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <span style="font-size:28px;">🏥</span>
                      <span style="font-family:Georgia,serif;font-size:24px;color:#ffffff;
                                   letter-spacing:-0.5px;vertical-align:middle;">
                        HealthLink
                      </span>
                    </div>
                    <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.55);
                               letter-spacing:2px;text-transform:uppercase;">
                      Smart Healthcare Platform
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #E8EAF4;
                        border-right:1px solid #E8EAF4;">

              <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:26px;
                          color:#122056;font-weight:400;line-height:1.3;">
                ${title}
              </h1>

              ${bodyHTML}

            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background:#F8F9FF;border:1px solid #E8EAF4;border-top:none;
                        border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              ${footerNote ? `
              <p style="margin:0 0 12px;font-size:13px;color:#8A90B8;">${footerNote}</p>
              ` : ''}
              <p style="margin:0;font-size:11px;color:#B0B8D4;line-height:1.6;">
                This is an automated message from HealthLink Medical System.<br/>
                Please do not reply to this email.
                &nbsp;·&nbsp;
                <a href="#" style="color:#5B65DC;text-decoration:none;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="#" style="color:#5B65DC;text-decoration:none;">Support</a>
              </p>
              <p style="margin:12px 0 0;font-size:10px;color:#C8CDE0;">
                © ${new Date().getFullYear()} HealthLink · Smart Healthcare Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

// ── Detail row helper — use inside bodyHTML ─────────────────────────────────
const detailRow = (label, value) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #F0F2FA;
               font-size:13px;color:#8A90B8;font-weight:500;width:160px;
               vertical-align:top;">
      ${label}
    </td>
    <td style="padding:10px 0;border-bottom:1px solid #F0F2FA;
               font-size:13px;color:#122056;font-weight:600;vertical-align:top;">
      ${value}
    </td>
  </tr>
`;

// ── Status badge helper ─────────────────────────────────────────────────────
const badge = (text, color = '#16A34A', bg = '#F0FDF4', border = '#BBF7D0') => `
  <span style="display:inline-block;background:${bg};border:1px solid ${border};
               color:${color};font-size:11px;font-weight:600;letter-spacing:0.5px;
               text-transform:uppercase;padding:4px 12px;border-radius:100px;">
    ${text}
  </span> 
`;

// ── Named template builders ─────────────────────────────────────────────────

const buildAppointmentConfirmedEmail = ({ recipientName, isDoctor, doctorName, patientName, date, time, appointmentType, queueNumber, specialty }) => {
  const person = isDoctor ? patientName : `${doctorName}`;
  const role   = isDoctor ? 'patient' : 'doctor';

  const bodyHTML = `
    <p style="margin:0 0 20px;font-size:15px;color:#4A5280;line-height:1.7;">
      Hi <strong style="color:#122056;">${recipientName}</strong>,<br/>
      ${isDoctor
        ? `You have a new appointment with your ${role} <strong>${person}</strong>. Details are below.`
        : `Your appointment with <strong>${person}</strong> has been confirmed. See you soon!`
      }
    </p> 

    ${badge('Confirmed')}

    <table width="100%" cellpadding="0" cellspacing="0"
           style="margin:20px 0 28px;border-collapse:collapse;">
      ${detailRow('Doctor',           `${doctorName}`)}
      ${detailRow('Specialty',        specialty || '—')}
      ${detailRow('Patient',          patientName)}
      ${detailRow('Date',             date)}
      ${detailRow('Time Slot',        time)}
      ${detailRow('Type',             appointmentType || 'Physical')}
      ${queueNumber ? detailRow('Queue Number', `#${queueNumber}`) : ''}
    </table>

    <div style="background:#EEEFFD;border-radius:10px;padding:16px 20px;margin-bottom:8px;">
      <p style="margin:0;font-size:13px;color:#5B65DC;line-height:1.6;">
        <strong>📋 What to bring:</strong> Please arrive 10 minutes early with any relevant 
        medical records, previous prescriptions, and your national ID.
      </p>
    </div>
  `;

  return buildEmailHTML({
    title: isDoctor ? 'New Appointment Scheduled' : 'Appointment Confirmed!',
    bodyHTML,
    footerNote: isDoctor
      ? 'You can manage your schedule via the HealthLink Doctor Portal.'
      : 'Need to reschedule? Log in to HealthLink to manage your appointments.'
  });
};

const buildCancellationEmail = ({ recipientName, isDoctor, doctorName, patientName, date, time }) => {
  const bodyHTML = `
    <p style="margin:0 0 20px;font-size:15px;color:#4A5280;line-height:1.7;">
      Hi <strong style="color:#122056;">${recipientName}</strong>,<br/>
      The following appointment has been <strong style="color:#DC2626;">cancelled</strong>.
    </p>

    ${badge('Cancelled', '#DC2626', '#FEF2F2', '#FECACA')}

    <table width="100%" cellpadding="0" cellspacing="0"
           style="margin:20px 0 28px;border-collapse:collapse;">
      ${detailRow('Doctor',  `Dr. ${doctorName}`)}
      ${detailRow('Patient', patientName)}
      ${detailRow('Date',    date)}
      ${detailRow('Time',    time)}
    </table>

    <div style="background:#FEF2F2;border-radius:10px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#DC2626;line-height:1.6;">
        If this was unexpected, please log in to HealthLink or contact support.
      </p>
    </div>
  `;

  return buildEmailHTML({
    title: 'Appointment Cancelled',
    bodyHTML,
    footerNote: 'You can book a new appointment anytime via the HealthLink Patient Portal.'
  });
};

const buildRescheduleEmail = ({ recipientName, isDoctor, doctorName, patientName, newDate, newTime }) => {
  const bodyHTML = `
    <p style="margin:0 0 20px;font-size:15px;color:#4A5280;line-height:1.7;">
      Hi <strong style="color:#122056;">${recipientName}</strong>,<br/>
      Your appointment has been <strong>rescheduled</strong> to a new date and time.
    </p>

    ${badge('Rescheduled', '#D97706', '#FFFBEB', '#FDE68A')}

    <table width="100%" cellpadding="0" cellspacing="0"
           style="margin:20px 0 28px;border-collapse:collapse;">
      ${detailRow('Doctor',   `Dr. ${doctorName}`)}
      ${detailRow('Patient',  patientName)}
      ${detailRow('New Date', newDate)}
      ${detailRow('New Time', newTime)}
    </table>
  `;

  return buildEmailHTML({
    title: 'Appointment Rescheduled',
    bodyHTML,
    footerNote: 'Log in to HealthLink to view your updated schedule.'
  });
};

const buildDoctorVerificationEmail = ({ doctorName, approved }) => {
  const bodyHTML = `
    <p style="margin:0 0 20px;font-size:15px;color:#4A5280;line-height:1.7;">
      Hi <strong style="color:#122056;">Dr. ${doctorName}</strong>,<br/>
      ${approved
        ? 'Congratulations! Your HealthLink account has been <strong style="color:#16A34A;">verified</strong>. You can now log in and start accepting appointments.'
        : 'Unfortunately, your verification request has been <strong style="color:#DC2626;">rejected</strong>. Please contact our support team for more information.'
      }
    </p>

    ${approved
      ? badge('Verified ✓')
      : badge('Rejected', '#DC2626', '#FEF2F2', '#FECACA')
    }

    <div style="margin-top:24px;background:${approved ? '#F0FDF4' : '#FEF2F2'};
                border-radius:10px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:${approved ? '#15803D' : '#DC2626'};line-height:1.6;">
        ${approved
          ? '🎉 Welcome to HealthLink! Log in to your Doctor Portal to set your availability and start helping patients.'
          : '📧 Please reach out to support@healthlink.lk if you believe this is an error.'
        }
      </p>
    </div>
  `;

  return buildEmailHTML({
    title: approved ? 'Account Verified!' : 'Verification Rejected',
    bodyHTML
  });
};

const buildSessionLinkEmail = ({ recipientName, isDoctor, doctorName, patientName, sessionDate, sessionTime, sessionLink }) => {
  const bodyHTML = `
    <p style="margin:0 0 20px;font-size:15px;color:#4A5280;line-height:1.7;">
      Hi <strong style="color:#122056;">${recipientName}</strong>,<br/>
      Your telemedicine session is coming up. Click below to join at the scheduled time.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="margin:0 0 28px;border-collapse:collapse;">
      ${detailRow('Doctor',  `Dr. ${doctorName}`)}
      ${detailRow('Patient', patientName)}
      ${detailRow('Date',    sessionDate)}
      ${detailRow('Time',    sessionTime)}
    </table>

    <div style="text-align:center;margin-bottom:8px;">
      <a href="${sessionLink}"
         style="display:inline-block;background:#122056;color:#ffffff;
                font-size:15px;font-weight:600;text-decoration:none;
                padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
        🎥 Join Session
      </a>
    </div>
    <p style="text-align:center;font-size:11px;color:#8A90B8;margin:8px 0 0;">
      Or copy this link: <a href="${sessionLink}" style="color:#5B65DC;">${sessionLink}</a>
    </p>
  `;

  return buildEmailHTML({
    title: 'Your Telemedicine Session is Ready',
    bodyHTML,
    footerNote: 'Please join from a quiet location with a stable internet connection.'
  });
};

// ── Core send function ──────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
  await transporter.sendMail({
    from: `"HealthLink Medical" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,                          // rich HTML version
    text: text || subject          // plain-text fallback
  });
};

module.exports = {
  sendEmail,
  buildAppointmentConfirmedEmail,
  buildCancellationEmail,
  buildRescheduleEmail,
  buildDoctorVerificationEmail,
  buildSessionLinkEmail,
};