/**
 * Provides simple utils for populating database with specific records, useful for tests
 */

const {User, Model} = require('../models');

const clearDatabase = () => User.deleteMany({}).exec().then(
  () => Model.deleteMany({}).exec(),
);

const saveUsers = (users) => User.insertMany(users);
const saveModels = (models) => Promise.all(
  models.map((item) => {
    const newModel = new Model(item);
    return User.findOne({'profile.displayName': item.userId}).exec().then(
      (res) => {
        newModel.userId = res._id;
        return newModel.save();
      },
      (err) => { throw err; },
    );
  }),
);

const cleanupAndSave = (users, models) => clearDatabase()
  .then(() => saveUsers(users))
  .then(() => saveModels(models));

module.exports = {
  clearDatabase,
  saveUsers,
  saveModels,
  cleanupAndSave,
};
