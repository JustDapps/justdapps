require('dotenv').config();

const mongoose = require('mongoose');
const {users, models} = require('./sampleData.js');
const {User, Model} = require('../models');
const {cleanupAndSave} = require('../utils');

const selectAndPopulate = () => Model
  .find({})
  .populate('userId')
  .exec()
  .then((results) => console.log(results[0].userId.profile.displayName));

const testMethods = () => Model
  .findByUser('5dcd7646cdc6821e408e4e7d').then((results) => {
    console.log(results);
  });


// connect, execute specified handler and disconnect
const main = (handler) => mongoose.connect(
  process.env.TEST_DB_PATH,
  {useNewUrlParser: true, useUnifiedTopology: true},
).then(
  () => handler().then(() => {
    console.log('DONE');
    return mongoose.disconnect();
  }),
  (err) => console.log(err),
);

// entry point
// main(() => cleanupAndSave(users, models));
main(() => testMethods());
