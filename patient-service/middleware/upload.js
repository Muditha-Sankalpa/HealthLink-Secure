const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medical-reports',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto',
  },
});

module.exports = multer({ storage });