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

  name: {type: String, required: true, default: ''},
  description: {type: String, default: ''},

  entities: {type: [entityType], default: []},
  relations: {type: [relationType], default: []},

  dapps: {
    type: [{
      networkId: Number,
      description: {type: String, default: ''},

      entities: [entityType],
      relations: [relationType],
    }],
    default: [],
  },
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

/** Saves new model with specified userId and returns its _id */
modelSchema.statics.addForUser = function addForUser(modelProperties, userId) {
  const newModel = new this({
    ...modelProperties,
    userId: new ObjectId(userId),
  });

  return newModel
    .save()
    .then((result) => result._id.toString());
};

modelSchema.statics.delete = function deleteById(id) {
  return this.findByIdAndDelete(id).exec();
};


const model = mongoose.model('Model', modelSchema);
module.exports = model;
