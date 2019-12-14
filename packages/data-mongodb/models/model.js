/*
  This module describes dapp model collection
*/

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { modelName } = require('./user');

const entityType = mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, default: '' },
  abi: String,
}, { _id: false });

const relationType = mongoose.Schema({
  source: { type: String, required: true },
  target: { type: String, required: true },
  setOps: { type: String, required: true },
  validateOps: { type: String },
}, { _id: false });

const modelSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: modelName },

  name: { type: String, required: true, default: '' },
  description: { type: String, default: '' },

  entities: { type: [entityType], default: [] },
  relations: { type: [relationType], default: [] },

  dapps: {
    type: [{
      networkId: Number,
      description: { type: String, default: '' },

      entities: [entityType],
      relations: [relationType],
    }],
    default: [],
  },
});

modelSchema.statics.findByUser = function findByUser(userId) {
  return this
    .find({
      userId: new ObjectId(userId),
    })
    .lean()
    .exec();
};

/** Checks if specified user is owner of the specified model */
modelSchema.statics.checkOwner = function checkOwner(userId, modelId) {
  return this.findOne({ _id: new ObjectId(modelId) })
    .select('userId')
    .exec()
    .then(({ userId: modelUserId }) => userId === modelUserId.toString());
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

/** Deletes specific model and returns true. If model id doesn't exist, returns false. */
modelSchema.statics.delete = function deleteById(id) {
  return this.findByIdAndDelete(id).exec().then((response) => !!response);
};

/** Changes model with specified identifier and returns true.
 * If model id doesn't exist, returns false.
 * Properties to be changed are specified as 1st parameter */
modelSchema.statics.update = function update(modelProperties, id) {
  return this.findByIdAndUpdate(
    id,
    modelProperties,
    { useFindAndModify: false },
  ).exec()
    .then((response) => (!!response));
};

/**
 * Returns one of the dapp's entities by its name and a modelId-dappId pair
 * If specific dapp or entity can't be found, return null
 */
modelSchema.statics.getDappEntity = function getDappEntity(name, modelId, dappId) {
  return this.findById(modelId)
    .select({ dapps: { $elemMatch: { _id: new ObjectId(dappId) } } })
    .then(({ dapps }) => (dapps.length > 0
      ? (dapps[0].entities.find((entity) => entity.name === name) || null)
      : null));
};


const model = mongoose.model('Model', modelSchema);
module.exports = model;
