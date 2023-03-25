const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const user = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'samples/myimage',
      format: 'png', // supports promises as well
      public_id: (req, file) => file.originalname,
    },
  });
  const upload = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'samples/letter',
      format: 'png', // supports promises as well
      public_id: (req, file) => file.originalname,
    },
  });
  const surveyor = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'samples/surveyor',
      format: 'png', // supports promises as well
      public_id: (req, file) => file.originalname,
    },
  });
  exports.surveyor = multer({ storage: surveyor });
  exports.uploadLetter = multer({ storage: upload });
  exports.profileStorage = multer({ storage: user });