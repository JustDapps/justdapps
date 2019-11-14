/*
  This module describes dapp model collection
*/

const mongoose = require('mongoose');

const {ObjectId} = mongoose.Types;
const {modelName} = require('./user');

const entityType = mongoose.Schema({
  name: {type: String, required: true},
  address: {type: String, default: ''},
  abi: String,
  code: String,
  compiler: String,
}, {_id: false});

const relationType = mongoose.Schema({
  source: {type: String, required: true},
  target: {type: String, required: true},
  setOps: {type: String, required: true},
  validateOps: {type: String},
}, {_id: false});

const modelSchema = new mongoose.Schema({
  _id: {type: mongoose.Schema.Types.ObjectId, auto: true},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: modelName},

  name: {type: String, required: true},
  description: {type: String, default: ''},

  entities: [entityType],
  relations: [relationType],

  dapps: [{
    networkId: Number,
    description: {type: String, default: ''},

    entities: [entityType],
    relations: [relationType],
  }],
});

/*
methods:
- select by userId
- add empty by userId
*/
modelSchema.statics.findByUser = function findByUser(userId) {
  return this
    .find({
      userId: new ObjectId(userId),
    })
    .lean()
    .exec();
};

modelSchema.statics.addEmpty = function findByUser(name, description, userId) {
  return this.create({
    name,
    description,
    userId: new ObjectId(userId),
  });
};

const model = mongoose.model('Model', modelSchema);
module.exports = model;
