const jwt = require('jsonwebtoken');

const createToken = (auth) => jwt.sign({
  id: auth.id,
},
'my-secret', {
  expiresIn: 60 * 120,
});

const generateToken = (req, res, next) => {
  req.token = createToken(req.auth);
  res.setHeader('x-auth-token', req.token);
  return res.status(200).send(JSON.stringify(req.user));
};

module.exports = {
  generateToken,
};
