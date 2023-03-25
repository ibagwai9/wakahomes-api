const passport  = require("passport");
const config  = require("../config/config");
const properties = require("../controllers/properties");

module.exports = (app) => {
  const { api, protected } = config;

  app.post(`${api}/properties`, protected, properties.postProperties);
  app.get(`${api}/properties`, protected, properties.getProperties);
  app.get(`${api}/properties/state-props`, properties.getStateProps);
};
