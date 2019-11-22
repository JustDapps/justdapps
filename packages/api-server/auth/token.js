/**
 * This small module serves for sending authentication information back to client (browser)
 * Exported `generateToken` middleware writes into `cookies.token` an encrypted token that contains
 * `userId` - app user unique identifier (usually database id).
 *
 * It requires request to contain:
 * 1. `user` object with the `id` property
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

const secret = process.env.TOKEN_PRIVATE_KEY;

/**
 * Creates JWT containing `userId` signed with app secret,
 * @param {*} user user object containing `id` property
 * Returns signed JWT with `userId` property
 */
const createToken = (user) => jwt.sign(
  {
    userId: user.id,
  },
  secret,
  {
    expiresIn: config.tokenExpiresIn,
  },
);

/**
 * Verifies JWT and passes result to callback function.  If no callback specified, returns decoded value
 * @param {*} token JWT with auth information , string
 * @param {*} cb callback that takes parameters (err, decodedToken).
 */
const verifyToken = (token, cb) => jwt.verify(token, secret, cb);

module.exports = {
  createToken,
  verifyToken,
};
