const mongoose = require('mongoose');
const { User, Model } = require('./models');

module.exports = {
  connect(path) {
    return mongoose.connect(
      path,
      { useNewUrlParser: true, useUnifiedTopology: true },
    );
  },

  disconnect() { return mongoose.disconnect(); },

  user: {
    upsertGoogleUser(id, displayName, cb) {
      return User
        .upsertGoogleUser(id, displayName, cb);
    },
  },

  model: {
    checkOwner(userId, modelId) {
      return Model.checkOwner(userId, modelId);
    },
    findByUser(userId) {
      return Model.findByUser(userId);
    },
    addForUser(modelProperties, userId) {
      return Model.addForUser(modelProperties, userId);
    },
    delete(id) {
      return Model.delete(id);
    },
    update(modelProperties, id) {
      return Model.update(modelProperties, id);
    },
  },
};
