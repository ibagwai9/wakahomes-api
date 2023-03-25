const { Strategy, ExtractJwt }  = require ("passport-jwt")
// import { placeholder } from "sequelize/types/lib/operators";
const models =  require("../models");

const Users = models.User;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secret";

module.exports = (passport) => {
  passport.use(
    new Strategy(opts, (jwt_payload, done) => {
      Users.findOne({ where: { id: jwt_payload.id } })
      .then((user) => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      });
    })
  );
};
