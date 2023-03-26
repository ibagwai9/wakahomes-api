const passport  = require("passport");
const config  = require("../config/config");
const properties = require("../controllers/properties");

module.exports = (app) => {
  const { api, requireAuth } = config;

  app.post(`/properties`, requireAuth, properties.postProperties);
  app.get(`/properties`, requireAuth, properties.getProperties);
  app.get(`/properties/state-props`, properties.getStateProps);
};
