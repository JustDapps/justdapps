const mongoose = require('mongoose');
const { User } = require('./models');

module.exports.connect = (path, cb) => mongoose.connect(path, { useNewUrlParser: true, useUnifiedTopology: true }, cb);

module.exports.upsertGoogleUser = (id, displayName, cb) => User.upsertGoogleUser(id, displayName, cb);
