const passport = require('passport');

const GoogleStrategy = require('passport-google-token').Strategy;

/**
 * Initializes passport.js with strategies
 */
const init = () => {
  /**
   * Google strategy requires acceess_token in request body.
   * Returns {googleid: Google Profile id, displayName: email} as user
   */
  passport.use(
    new GoogleStrategy({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, {
        googleId: profile.id,
        displayName: profile.emails[0].value,
      });
    }),
  );
};

module.exports = init;
