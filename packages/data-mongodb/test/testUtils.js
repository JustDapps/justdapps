/**
 * This module contains utilities for testing mongodb related functions
 */

const {User, Model} = require('../models');
const {users: testUsers, models: testModels} = require('./testData');
const {cleanupAndSave, clearDatabase} = require('../utils');

module.exports.cleanupAndLoadFromFile = () => cleanupAndSave(testUsers, testModels);

module.exports.cleanup = () => clearDatabase();

module.exports.getTotalUsers = () => User
  .find({})
  .exec()
  .then((results) => results.length);

/** Inserts array of user names to User collection, returns object
 * {name1: id1, name2: id2, ...}
 */
module.exports.addGoogleUsers = (names) => Promise.all(
  names.map((name) => User
    .upsertGoogleUser(`id_${name}`, name)
    .then((user) => ({id: user.id, name}))),
)
  .then((users) => users.reduce(
    (accum, value) => ({...accum, [value.name]: value.id}),
    {},
  ));


/** Inserts array of models with specified User id, returns object
 * {modelname1: modelid1, modelname2: modelid2, ...}
 */
module.exports.addModelsForUser = async (rawModels, userName) => {
  const userId = await User.getUserId(userName);
  return Promise.all(
    rawModels.map(
      (model) => Model.addForUser(model, userId)
        .then((newModelId) => ({id: newModelId, name: model.name})),
    ),
  ).then((models) => models.reduce(
    (accum, value) => ({...accum, [value.name]: value.id}),
    {},
  ));
};
