const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

const createToken = (auth) => jwt.sign({
  id: auth.id,
},
process.env.TOKEN_PRIVATE_KEY, {
  expiresIn: config.tokenExpiresIn,
});

const generateToken = (req, res, next) => {
  req.token = createToken(req.auth);
  return res.cookie('token', req.token, { httpOnly: true }).status(200).send(JSON.stringify(req.user.displayName));
};

module.exports = {
  generateToken,
};
