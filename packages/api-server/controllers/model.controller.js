const db = require('@justdapps/data-mongodb');
const {responseBody, responseError} = require('../utils');


module.exports.find = function find(req, res) {
  db.model.findByUser(req.user.id).then((models) => res.json(responseBody(models)));
};


module.exports.create = function create(req, res) {
  db.model.addForUser(req.body.model)
    .then((modelId) => res.json(responseBody({modelId})));
};


module.exports.update = function update(req, res) {
  db.model.checkOwner(req.user.id, req.body.modelId)
    .then((isOwner) => (isOwner
      ? db.model.update(req.body.model, req.body.modelId).then(() => res.json(responseBody(null)))
      : res.status(403).json(responseError('Attempt to update model of another user'))
    ));
};


module.exports.delete = function deleteModel(req, res) {
  db.model.checkOwner(req.user.id, req.body.modelId)
    .then((isOwner) => (isOwner
      ? db.model.delete(req.body.modelId)
        .then(() => res.json(responseBody(null)))
      : res.status(403).json(responseError('Attempt to delete model of another user'))
    ));
};
