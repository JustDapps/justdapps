const express = require('express');
const passport = require('passport');
const {generateToken} = require('../auth/token');
const {responseError} = require('../utils');

const router = express.Router();

const authPassport = function authPassport(req, res, next) {
  passport.authenticate('google-token', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json(responseError(
        info ? `${info.toString()}` : 'Authentication error',
      ));
    }

    req.user = user;
    return next();
  })(req, res, next);
};

/**
 * Authenticates user via its Google access token.
 *
 * Parameters in requrest body
 * access_token - Google access token, string
 *
 * Returns in cookies
 * token - encrypted JWT: {userId: user's database id}
 */
router.post('/google',
  // passport.authenticate('google-token', {session: false}),
  authPassport,
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(responseError('User Not Authenticated'));
    }
    req.auth = {
      id: req.user.key,
    };
    req.user = {
      displayName: req.user.displayName,
    };

    return next();
  },
  generateToken,
  // error handler
  (err, req, res, next) => res.status(401).json(responseError(err.toString())));

module.exports = router;
