const mongoose = require('mongoose');
const {User, Model} = require('./models');

module.exports = {
  connect: (path, cb) => mongoose.connect(
    path,
    {useNewUrlParser: true, useUnifiedTopology: true},
    cb,
  ),

  user: {
    upsertGoogleUser: (id, displayName, cb) => User
      .upsertGoogleUser(id, displayName, cb),
  },

  model: {
    findByUser: (userId) => Model.findByUser(userId),
    addForUser: (modelProperties, userId) => Model.addForUser(modelProperties, userId),
    delete: (id) => Model.delete(id),
  },
};
