/**
 * This middleware reads cookies and populates the request `user` object with its `id`
 */

const jwt = require('jsonwebtoken');

const secret = process.env.TOKEN_PRIVATE_KEY;

module.exports = (req, res, next) => {
  const {token} = req.cookies;
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.user = {id: decoded.userId};
        next();
      }
    });
  }
};
