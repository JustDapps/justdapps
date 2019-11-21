/**
 * This small module serves for sending authentication information back to client (browser)
 * Exported `generateToken` middleware writes into `cookies.token` an encrypted token that contains
 * `userId` - app user unique identifier.
 *
 * It requires request object to contain an `auth` object with the `id` property
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

const createToken = (auth) => jwt.sign({
  userId: auth.id,
},
process.env.TOKEN_PRIVATE_KEY, {
  expiresIn: config.tokenExpiresIn,
});

const generateToken = (req, res, next) => {
  req.token = createToken(req.auth);
  return res.cookie('token', req.token, {httpOnly: true}).status(200).json(req.user);
};

module.exports = {
  generateToken,
};
