require('dotenv').config();

const mongoose = require('mongoose');
const {users, models} = require('./sampleData.js');
const {User, Model} = require('../models');

const clearDatabase = () => User.deleteMany({}).then(
  () => Model.deleteMany({}),
);

const saveUsers = () => User.insertMany(users);

const saveModels = () => Promise.all(
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


const cleanupAndSave = () => clearDatabase()
  .then(saveUsers)
  .then(saveModels);

const selectAndPopulate = () => Model
  .find({})
  .populate('userId')
  .exec()
  .then((results) => console.log(results[0].userId.profile.displayName));

const testMethods = () => Model
  .findByUser('5dcc22f444ad273dc0852cd6', (err, results) => {
    console.log(results);
  });


// connect, execute specified handler and disconnect
const main = (handler) => mongoose.connect(
  process.env.DB_PATH,
  {useNewUrlParser: true, useUnifiedTopology: true},
).then(
  () => handler().then(() => { console.log('DONE'); return mongoose.disconnect(); }),
  (err) => console.log(err),
);

// entry point
main(cleanupAndSave);
