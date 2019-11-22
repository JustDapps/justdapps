const express = require('express');
const passport = require('passport');
const {generateToken} = require('../middlewares/auth');
const {responseError} = require('../utils');

const router = express.Router();

const authPassport = (req, res, next) => {
  passport.authenticate('google-token', (err, user, info) => {
    if (err) {
      // TODO log error message
      return next(err);
    }
    if (!user) {
      // TODO log error message `info && info.toString()`
      return res.status(401).json(responseError('Authentication error'));
    }

    req.user = user;
    return next();
  })(req, res, next);
};


/**
 * Saves req.user to database
 * req.user is an object with `googleId`, `displayName` properties
 */
const saveUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(responseError('User Not Authenticated'));
  }

  return req.dataSource.user.upsertGoogleUser(req.user.googleId, req.user.displayName)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => next(err));
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
  authPassport,
  saveUser,
  generateToken);

module.exports = router;
