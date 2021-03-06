/**
 * This module provides functions for interaction with Etherum blockchain.
 * Requires node endpoints information to be passed in a constructor
 */

const request = require('superagent');
const EthError = require('./ethError');
const NodeProvider = require('./nodeProvider');


/** Creates Ethereum bridge. Accepts NodeProvider as a construction parameter.
 * See {@link NodeProvider} for more information.
 *
 * @example
 * new Eth(new Eth.NodeProvider({'1':'http://localhost:8545'}))
 */
const Eth = function Eth(nodeProvider) {
  this.nodeProvider = nodeProvider;
};

Eth.NodeProvider = NodeProvider;

/**
 * Calls contract method (i.e. without sending a transaction) and returns the resulted value
 *
 * @param {string} address address of a contract, checksum is not required
 * @param {Object[]} abi ABI-array of a contract
 * @param {(string|number)} networkId network id of a contract
 * @param {string} method name of a method to call
 * @param {*[]} args array of arguments for a method
 * @param {Object} options Web3 options for a call (gasPrice, from, etc.)
 *
 * @returns {Promise} Resulting value of a web3.eth.Contract.method.call
 * @throws Exception is thrown if contract reverts or no method exists, or any other error occurs
 */
Eth.prototype.callContract = async function call(
  address, abi, networkId, method, args = [], options = {},
) {
  const contract = this.createContract(address, abi, networkId);
  if (contract.methods[method]) {
    try {
      return await contract.methods[method](...args).call(options);
    } catch (err) {
      throw new EthError(err.message);
    }
  }
  throw new EthError('No method in ABI');
};

/**
 * Creates unsigned transaction object. \
 * If options.gas is not set calls web3.eth.estimatesGas to calculate the amount \
 * If options.nonce is not set, it calculates current nonce \
 * If options.value is not set, it sets to '0'
 * If options.gasPrice is not set, it calls web3.eth.getGasPrice to calculate it
 * If options.from is not set, it rejects with EthError
 *
 * @param {string} address address of a contract, checksum is not required
 * @param {Object[]} abi ABI-array of a contract
 * @param {(string|number)} networkId network id of a contract
 * @param {string} method name of a method to call
 * @param {*[]} args array of arguments for a method
 * @param {Object} options Web3 options for a call (nonce, gasPrice, from, value)
 * @returns {Promise} Resulting web3 transaction object {from, to, data, ...}
 */
Eth.prototype.createUnsignedTx = async function createUnsignedTx(
  address, abi, networkId, method, args = [], options = {},
) {
  if (!options.from) {
    throw new EthError('No sender address specified');
  }
  const web3 = this.nodeProvider.web3For(networkId);

  const contract = this.createContract(address, abi, networkId);
  const contractMethod = contract.methods[method](...args);
  const data = contractMethod.encodeABI();

  const nonce = options.nonce
    || (await web3.eth.getTransactionCount(options.from, 'pending'));
  const gasPrice = options.gasPrice
    || (await web3.eth.getGasPrice());

  const gas = options.gas || await this.estimateGas(contractMethod, options);

  return {
    from: options.from,
    to: address,
    value: options.value || 0,
    nonce,
    gas,
    gasPrice,
    data,
  };
};

/**
 * Sends signed transaction to the blockchain
 * @param {string} signedTx signed transaction in HEX format, string starting with '0x'
 * @returns {Promise} Transaction hash that is available immediately
 */
Eth.prototype.sendSignedTx = function sendSignedTx(
  signedTx, networkId,
) {
  return request.post(this.nodeProvider.endpointFor(networkId))
    .send({
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [signedTx],
      id: '1',
    })
    .then(({ body }) => {
      if (body.result) {
        return body.result;
      } if (body.error) {
        throw new EthError(body.error.message);
      } else {
        throw new EthError('Unknown result');
      }
    });
};


/**
 * Creates contract object to call its methods later
 *
 *  @param {string} address address of a contract, checksum is not required
 * @param {Object[]} abi ABI-array of a contract
 * @param {(string|number)} networkId network id of a contract
 *
 * @returns {*} Web3 contract object
 */
Eth.prototype.createContract = function createContract(address, abi, networkId) {
  const web3 = this.nodeProvider.web3For(networkId);
  return new web3.eth.Contract(abi, address);
};

/**
 * web3's estimateGas wrapper. returns 0 in case of contract method revert
 */
Eth.prototype.estimateGas = async function estimateGas(contractMethod, options) {
  try {
    return await contractMethod.estimateGas(options);
  } catch (err) {
    if (err.message.indexOf('execution error: revert')) {
      return 0;
    }
    throw new EthError(err.message);
  }
};


module.exports = Eth;
