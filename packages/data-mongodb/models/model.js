const mongoose = require('mongoose');

const entityType = {
  name: {type: String, required: true},
  address: {type: String, default: ''},
  abi: String,
  code: String,
  compiler: String,
};

const relationType = {
  source: {type: String, required: true},
  target: {type: String, required: true},
  setOps: {type: String, required: true},
  validateOps: {type: String},
};

const modelSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
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
