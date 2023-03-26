require('dotenv').config
const { api } = require ('../config/config');
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: 'drxkp1erj',
  api_key: '218187136849528',
  api_secret: 'dF879L426Z38DnkBvSKuG_IcSCo'
});

const cloudRoute = (app) => {
  app.post(`/cloud/upload`, (req, res) => {
    const image = req.body;
    console.log(image);
    cloudinary.uploader.upload(`${image}`, {
      upload_preset: "myimage",
    })
    .then(uploadedReponse => {
      res.json({ success: true, msg: "Done " + uploadedReponse });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ msg: "Error :" + error });
    });
  })
}

module.exports = { cloudinary, cloudRoute };