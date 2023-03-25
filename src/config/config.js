require("dotenv").config();
const passport  = require("passport");

const config = module.exports;
const env = process.env.NODE_ENV || "development";

config.api = env === "development" ? `/api/v1` : "/api/v1";
config.protected = passport.authenticate("jwt", { session: false })
const userRoles = (config.userRoles = {
  guest: 1,
  user: 2,
  admin: 4,
  superAdmin: 8,
});
config.accessLevels = {
  guest:
    userRoles.guest | userRoles.user | userRoles.admin | userRoles.superAdmin,
  user: userRoles.user | userRoles.admin | userRoles.superAdmin,
  admin: userRoles.admin | userRoles.superAdmin,
  superAdmin: userRoles.superAdmin,
};
