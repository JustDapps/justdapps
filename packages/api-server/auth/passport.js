const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleStrategy = require('passport-google-token').Strategy;

const init = () => {
  passport.use(
    new GoogleStrategy({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, { user: profile });
    }),
  );
};

module.exports = init;
