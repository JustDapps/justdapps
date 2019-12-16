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

/**
 * Params and returns are the same as /POST /eth/call route has
 */
module.exports.callContract = [
  accessModel,

  (req, res, next) => {
    let abiArray = [];
    return req.dataSource.model.getDappEntity(req.body.entity, req.body.modelId, req.body.dappId)
      .then(({ address, abi, networkId }) => {
        abiArray = JSON.parse(abi);
        return req.ethSource.callContract(
          address, abiArray, networkId, req.body.method, req.body.args, req.body.options,
        );
      })
      .then((callResult) => {
        const { outputs } = abiArray.find(({ name }) => name === req.body.method);
        const richCallResult = addTypesToCallResult(callResult, outputs);
        res.status(200).json(responseBody(richCallResult));
      })
      .catch((e) => {
        if (e.name === 'EthError') {
          res.status(400).json(responseError(e.message));
        } else {
          res.status(500).json(responseError(e.message));
        }
      });
  }];
