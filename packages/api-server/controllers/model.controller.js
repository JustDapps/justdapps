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
  // check valid user

  res.status(404).json(responseError('NOT IMPLEMENTED YET'));
};


module.exports.delete = function update(req, res) {
  // check valid user
  db.model.delete(req.body.modelId).then(() => res.json(responseBody(null)));
};
