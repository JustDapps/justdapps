require('dotenv').config();

const mongoose = require('mongoose');
const {users, models} = require('./sampleData.js');
const {User, Model} = require('../models');

const clearDatabase = () => User.deleteMany({}).then(
  () => Model.deleteMany({}),
);

const populateUsers = () => User.insertMany(users);

const populateModels = () => Promise.all(
  models.map((item) => {
    const newModel = new Model(item);
    return User.findOne({'profile.displayName': item.userId}).exec().then(
      (res) => {
        newModel.userId = res._id;
        return newModel.save();
      },
      (err) => console.log(err),
    );
  }),
);

mongoose.connect(process.env.DB_PATH, {useNewUrlParser: true, useUnifiedTopology: true}).then(
  () => clearDatabase()
    .then(populateUsers)
    .then(populateModels)
  // populateModels()
    .then(() => {
      console.log('DONE');
      return mongoose.disconnect();
    }),
  (err) => console.log(err),
);
