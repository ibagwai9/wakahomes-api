const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const models = require('../models');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const FacebookStrategy = require('passport-facebook').Strategy;
const User = models.User;

require('dotenv').config();
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

module.exports = (passport) => {

  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findOne({ where: { id: jwt_payload.id } })
        .then((user) => {
          if (user) {
            return done(null, user.dataValues);
          }
          return done(null, false);
        })
        .catch((err) => {
          return done(err, false);
        });
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.G_CLIENT_ID,
        clientSecret:process.env.G_CLIENT_SECRATE,
        callbackURL: process.env.G_CALLBACK,
        redirect_uri:process.env.G_REDIRECT,
        scope:['profile','email']
      },
      (accessToken, refreshToken, profile, done) => {
      // Extract relevant information from the user profile
      const { id, displayName, email, photo } = profile;

      // Save the user information in your database

      console.log({profile});

      User.findOne({ google_id: id })
        .then((user) => {

          if (user) {
            // If the user already exists in the database, update the profile information

        console.log('UPDATE GOOGLE USER',{profile});
            user.name = displayName;
            user.email = email;
            user.picture = photo;
            user.token=accessToken;
            return user.save();
          } else {
            // If the user doesn't exist, create a new user in the database
            console.log('CREATE GOOGLE USER',profile);
            return User.create({
              google_id: id,
              name: displayName,
              email: email,
              picture: photo,
              token:accessToken
            });
          }
        })
        .then((user) => {
          // Save the user information in the session or generate a token for authentication
          // ...

          // Call the 'done' callback to proceed with authentication
          return done(null, user);
        })
        .catch((err) => {
          // Handle any errors that occurred during the process
          return done(err, false);
        });
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FB_APP_ID,
        clientSecret: process.env.FB_APP_SECRET,
        callbackURL: process.env.FB_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'email'],
      },
      (accessToken, refreshToken, profile, done) => {
       // Save the user information in your database
       User.findOne({ google_id: id })
       .then((user) => {
         if (user) {
           // If the user already exists in the database, update the profile information
           user.name = displayName;
           user.email = email;
           user.picture = photo;
           user.token=accessToken;
           return user.save();
         } else {
           // If the user doesn't exist, create a new user in the database
           return User.create({
             facebook_id: id,
             name: displayName,
             email: email,
             picture: photo,
             token:accessToken
           });
         }
       })
       .then((user) => {
         // Save the user information in the session or generate a token for authentication
         // Call the 'done' callback to proceed with authentication
         return done(null, user);
       })
       .catch((err) => {
         // Handle any errors that occurred during the process
         return done(err, false);
       });
      }
    )
  );
    // Serialize the user object
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });
  
    // Deserialize the user object
    passport.deserializeUser((id, done) => {
      User.findByPk(id)
        .then((user) => {
          done(null, user);
        })
        .catch((err) => {
          done(err, null);
        });
    });
    
};
   