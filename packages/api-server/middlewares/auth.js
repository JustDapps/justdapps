const {createToken, verifyToken} = require('../auth/token');

/**
 * This middleware reads cookies and populates the request `user` object with its `id`
 */
const requireAuth = (req, res, next) => {
  const {token} = req.cookies;
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    verifyToken(token, (err, decoded) => {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.user = {id: decoded.userId};
        next();
      }
    });
  }
};

/**
 * Middleware that creates JWT and saves it to cookies.token.
 * Requires req.user object with `id` property
 */
const generateToken = (req, res, next) => {
  req.token = createToken(req.user);
  return res
    .cookie('token', req.token, {httpOnly: true})
    .status(200)
    .json(req.user);
};


module.exports = {
  requireAuth,
  generateToken,
};
