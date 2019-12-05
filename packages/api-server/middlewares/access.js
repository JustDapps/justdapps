/** This modules exports middlewares that check if authenticated user stored in req.user object
 *  has enough permissions to work with certain objects */

const { responseError } = require('../utils');

/** This middleware check if `req.user` has permissions to modify model specified by `req.body.id`
 * Requires dataProvider middleware as it relies on `req.dataSource` object
 * In case of success calls next middleware,
 * If access is restricted returns 403 code.
 * In case of invalid model identifier returns 400 code
*/
const accessModel = (req, res, next) => {
  req.dataSource.model.checkOwner(req.user.id, req.body.modelId)
    .then((isOwner) => (isOwner
      ? next()
      : res.status(403).json(responseError('Attempt to access a model of another user'))
    ))
    .catch((err) => res.status(400).json(responseError('Invalid input')));
};

module.exports = {
  accessModel,
};
