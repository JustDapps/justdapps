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

module.exports.addModelsForUser = async (models, userName) => {
  const userId = await User.getUserId(userName);
  return Promise.all(models.map((model) => Model.addForUser(model, userId)));
};
