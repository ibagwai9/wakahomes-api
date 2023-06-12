const passport  = require("passport");
const config  = require("../config/config");
const properties = require("../controllers/properties");
const multer = require("../config/multer");
module.exports = (app) => {
  const { api, requireAuth } = config;

  app.post(`${api}/properties`, properties.postProperties);
  app.post(`${api}/properties/upload`, multer.array('media'), (req, res) => {
    res.json(req.files);
  });
  
  app.get(`${api}/properties`, requireAuth, properties.getProperties);
  app.get(`${api}/properties/state-props`, properties.getStateProps);
  app.get(`${api}/properties/get-address`, properties.getPropAddress);
};
