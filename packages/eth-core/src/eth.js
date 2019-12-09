/**
 * This module provides functions for interaction with Etherum blockchain.
 * Requires node endpoints information to be passed in a constructor
 */

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
 * @param {string} methid name of a method to call
 * @param {*[]} args array of arguments for a method
 * @param {Object} options Web3 options for a call (gasPrice, from, etc.)
 *
 * @returns {*} single or multiple resulting values of a call
 * @throws Exception is thrown if contract reverts or no method exists, or any other error occurs
 */
Eth.prototype.call = async function call(
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

Eth.prototype.createUnsignedTx = function createUnsignedTx(
  address, abi, networkId, method, args = [], options = {},
) {
  throw new EthError('Method not implemented');
};

Eth.prototype.sendSignedTx = function sendSignedTx(
  signedTx, networkId,
) {
  throw new EthError('Method not implemented');
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


module.exports = Eth;
