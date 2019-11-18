const mongoose = require('mongoose');
const {User, Model} = require('./models');

module.exports = {
  connect: (path) => mongoose.connect(
    path,
    {useNewUrlParser: true, useUnifiedTopology: true},
  ),

  disconnect: () => mongoose.disconnect(),

  user: {
    upsertGoogleUser: (id, displayName, cb) => User
      .upsertGoogleUser(id, displayName, cb),
  },

  model: {
    checkOwner: (userId, modelId) => Model.checkOwner(userId, modelId),
    findByUser: (userId) => Model.findByUser(userId),
    addForUser: (modelProperties, userId) => Model.addForUser(modelProperties, userId),
    delete: (id) => Model.delete(id),
    update: (modelProperties, id) => Model.update(modelProperties, id),
  },
};
