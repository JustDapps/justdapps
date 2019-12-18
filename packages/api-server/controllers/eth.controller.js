const { responseBody, responseError } = require('../utils');
const { accessModel } = require('../middlewares/access');

const addTypesToCallResult = (callResult, abiOutputs) => {
  // check if it is a single value or multiple values
  if (callResult[0]) {
    return abiOutputs.map((item, index) => ({
      value: callResult[index],
      type: item.type,
    }));
  }
  return [{
    value: callResult,
    type: abiOutputs[0].type,
  }];
};

const handleError = (e, res) => {
  if (e.name === 'EthError') {
    return res.status(400).json(responseError(e.message));
  }
  return res.status(500).json(responseError(e.message));
};

/**
 * Params and returns are the same as /POST /eth/call route has
 */
module.exports.callContract = [
  accessModel,

  (req, res, next) => {
    let abiArray = [];
    const {
      entity, modelId, dappId, method, args, options,
    } = req.body;

    return req.dataSource.model.getDappEntity(entity, modelId, dappId)
      .then(({ address, abi, networkId }) => {
        abiArray = JSON.parse(abi);
        return req.ethSource.callContract(
          address, abiArray, networkId, method, args, options,
        );
      })
      .then((callResult) => {
        const { outputs } = abiArray.find(({ name }) => name === method);
        const richCallResult = addTypesToCallResult(callResult, outputs);
        res.status(200).json(responseBody(richCallResult));
      })
      .catch((e) => handleError(e, res));
  }];

/**
 * Params and returns are the same as /POST /eth/methodtx route has
 */
module.exports.createUnsignedTx = [
  accessModel,

  (req, res, next) => {
    let abiArray = [];
    const {
      entity, modelId, dappId, method, args, options,
    } = req.body;

    return req.dataSource.model.getDappEntity(entity, modelId, dappId)
      .then(({ address, abi, networkId }) => {
        abiArray = JSON.parse(abi);
        return req.ethSource.createUnsignedTx(
          address, abiArray, networkId, method, args, options,
        );
      })
      .then((txObj) => {
        res.status(200).json(responseBody(txObj));
      })
      .catch((e) => handleError(e, res));
  },
];

/**
 * Params and returns are the same as /POST /eth/deploytx route has
 */
module.exports.createUnsignedDeployTx = [
  accessModel,

  (req, res, next) => {
    let abiArray = [];
    const {
      bytecode, modelId, entity, networkId, args, options,
    } = req.body;

    return req.dataSource.model.getModelEntity(entity, modelId)
      .then(({ abi }) => {
        abiArray = JSON.parse(abi);
        return req.ethSource.createUnsignedDeployTx(
          bytecode, abiArray, networkId, args, options,
        );
      })
      .then((txObj) => {
        res.status(200).json(responseBody(txObj));
      })
      .catch((e) => handleError(e, res));
  },
];

module.exports.sendSignedTx = (req, res, next) => {
  const { tx, networkId } = req.body;
  req.ethSource.sendSignedTx(tx, networkId)
    .then((txHash) => res.status(200).json(responseBody({ txHash })))
    .catch((e) => handleError(e, res));
};
