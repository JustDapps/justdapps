const { responseBody, responseError } = require('../utils');
const { accessModel } = require('../middlewares/access');

module.exports.find = function find(req, res) {
  req.dataSource.model.findByUser(req.user.id).then((models) => res.json(responseBody({ models })));
};


module.exports.create = function create(req, res) {
  req.dataSource.model.addForUser(req.body.model, req.user.id)
    .then((modelId) => res.json(responseBody({ modelId })));
};

module.exports.update = [
  accessModel,
  (req, res) => req.dataSource.model.update(
    req.body.model,
    req.body.modelId,
  )
    .then((result) => res.json(responseBody({ result }))),
];

module.exports.delete = [
  accessModel,
  (req, res) => req.dataSource.model.delete(req.body.modelId)
    .then((result) => res.json(responseBody({ result }))),
];
