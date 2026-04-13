const express = require('express');
const router = express.Router();
const {
  appointmentNotification,
  cancellationNotification,
  rescheduleNotification,
  telemedicineNotification,
  doctorVerificationNotification,
  sessionLinkNotification
} = require('../controllers/notificationController');

router.post('/appointment', appointmentNotification);
router.post('/cancellation', cancellationNotification);
router.post('/reschedule', rescheduleNotification);
router.post('/telemedicine', telemedicineNotification);
router.post('/doctor-verification', doctorVerificationNotification);
router.post('/session-link', sessionLinkNotification);

module.exports = router;