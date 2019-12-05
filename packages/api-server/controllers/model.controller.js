const { responseBody, responseError } = require('../utils');


module.exports.find = function find(req, res) {
  req.dataSource.model.findByUser(req.user.id).then((models) => res.json(responseBody({ models })));
};


module.exports.create = function create(req, res) {
  req.dataSource.model.addForUser(req.body.model, req.user.id)
    .then((modelId) => res.json(responseBody({ modelId })));
};


module.exports.update = function update(req, res) {
  req.dataSource.model.checkOwner(req.user.id, req.body.modelId)
    .then((isOwner) => (isOwner
      ? req.dataSource.model.update(
        req.body.model,
        req.body.modelId,
      )
        .then((result) => res.json(responseBody({ result })))
      : res.status(403).json(responseError('Attempt to update model of another user'))
    ))
    .catch((err) => res.status(400).json(responseError('Invalid input')));
};


module.exports.delete = function deleteModel(req, res) {
  req.dataSource.model.checkOwner(req.user.id, req.body.modelId)
    .then((isOwner) => (isOwner
      ? req.dataSource.model.delete(req.body.modelId)
        .then((result) => res.json(responseBody({ result })))
      : res.status(403).json(responseError('Attempt to delete model of another user'))
    ))
    .catch((err) => res.status(400).json(responseError('Invalid input')));
};
