const jwt = require('jsonwebtoken');

const createToken = (auth) => jwt.sign({
  id: auth.id,
},
'my-secret', {
  expiresIn: 60 * 120,
});

const generateToken = (req, res, next) => {
  req.token = createToken(req.auth);
  return res.cookie('token', req.token, {httpOnly: true}).status(200).send(JSON.stringify(req.user.displayName));
};

module.exports = {
  generateToken,
};
