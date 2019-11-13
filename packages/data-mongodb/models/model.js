const mongoose = require('mongoose');

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
  userId: mongoose.Schema.Types.ObjectId,

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

const model = mongoose.model('Model', modelSchema);
module.exports = model;
