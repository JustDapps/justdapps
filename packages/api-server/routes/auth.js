const express = require('express');
const passport = require('passport');
const {generateToken} = require('../auth/token');

const router = express.Router();

router.post('/google',
  passport.authenticate('google-token', {session: false}),
  (req, res, next) => {
    if (!req.user) {
      return res.send(401, 'User Not Authenticated');
    }
    req.auth = {
      id: req.user.key,
    };
    req.user = {
      displayName: req.user.displayName,
    };

    return next();
  },
  generateToken);

module.exports = router;
