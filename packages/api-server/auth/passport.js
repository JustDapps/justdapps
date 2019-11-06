const passport = require('passport');
const db = require('@justdapps/data-mongodb');

// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleStrategy = require('passport-google-token').Strategy;

const init = () => {
  passport.use(
    new GoogleStrategy({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      db.upsertGoogleUser(profile.id, profile.emails[0].value, (err, user) => {
        done(err, user);
      })
    },
  )
  );
};

module.exports = init;
