const express = require('express');
const router = express.Router();
const verifyInternalKey = require('../middleware/verifyInternalKey'); //V10
const {
  appointmentNotification,
  cancellationNotification,
  rescheduleNotification,
  telemedicineNotification,
  doctorVerificationNotification,
  sessionLinkNotification
} = require('../controllers/notificationController');

router.post('/appointment', verifyInternalKey, appointmentNotification);
router.post('/cancellation', verifyInternalKey, cancellationNotification);
router.post('/reschedule', verifyInternalKey, rescheduleNotification);
router.post('/telemedicine', verifyInternalKey, telemedicineNotification);
router.post('/doctor-verification', verifyInternalKey, doctorVerificationNotification);
router.post('/session-link', verifyInternalKey, sessionLinkNotification);

module.exports = router;