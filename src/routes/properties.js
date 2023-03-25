const passport  = require("passport");
const config  = require("../config/config");
const properties = require("../controllers/properties");

module.exports = (app) => {
  const { api, requireAuth } = config;

  app.post(`${api}/properties`, requireAuth, properties.postProperties);
  app.get(`${api}/properties`, requireAuth, properties.getProperties);
  app.get(`${api}/properties/state-props`, properties.getStateProps);
};
