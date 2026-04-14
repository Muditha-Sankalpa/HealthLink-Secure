const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, body }) => {
  await transporter.sendMail({
    from: `"Smart Healthcare" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: body
  });
};

module.exports = { sendEmail };