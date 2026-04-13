const axios = require('axios');

const sendSMS = async ({ to, message }) => {
  await axios.post('https://app.notify.lk/api/v1/send', {
    user_id: process.env.NOTIFY_USER_ID,
    api_key: process.env.NOTIFY_API_KEY,
    sender_id: process.env.NOTIFY_SENDER_ID,
    to,
    message
  });
};

module.exports = { sendSMS };