const passport = require('passport');

// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleStrategy = require('passport-google-token').Strategy;

const init = (dataSource) => {
  passport.use(
    new GoogleStrategy({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      dataSource.user.upsertGoogleUser(profile.id, profile.emails[0].value)
        .then((user) => {
          done(null, user);
        })
        .catch((err) => {
          done(err, null);
        });
    }),
  );
};

module.exports = init;
