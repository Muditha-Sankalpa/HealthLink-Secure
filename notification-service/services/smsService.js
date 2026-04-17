const axios = require('axios');

const sendSMS = async ({ to, message }) => {
  const cleanTo = to ? to.replace(/^\+/, '') : to; // strip leading +
  await axios.post('https://app.notify.lk/api/v1/send', {
    user_id: process.env.NOTIFY_USER_ID,
    api_key: process.env.NOTIFY_API_KEY,
    sender_id: process.env.NOTIFY_SENDER_ID,
    to: cleanTo,
    message
  });
};

module.exports = { sendSMS };