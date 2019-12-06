/**
 * Simple module that stores node endpoints for various networkid values.
 *
 * Endpoints are stored along with corresponding networkId and web3 object in `this.nodes` object
 * {
 *  [networkId] : {endpoint, web3}, ...
 * }
 */

const Web3 = require('web3');

/**
 * Creates new NodeProvider
 * @param {object} endpoints An object containing the following properties: {[networkId] : endpoint}
 * @example new NodeProvider({
 * '1':'localhost:8545'
 * '3':'https://ropsten.infura.io'
 * })
 */
const NodeProvider = function NodeProvider(endpoints) {
  this.nodes = {};
  Object.keys(endpoints).forEach((networkId) => {
    this.nodes[networkId] = {
      endpoint: endpoints[networkId],
      web3: new Web3(endpoints[networkId]),
    };
  });
};

/**
 * Returns endpoint for specified network
 * @param {string} networkId network id according to EIP-155
 * @returns {string} URL of the endpoint
 */
NodeProvider.prototype.endpointFor = function endpointFor(networkId) {
  return this.nodes[networkId].endpoint;
};

/**
 * Returns web3 object connected to specified network
 * @param {string} networkId network id according to EIP-155
 * @returns {string} URL of the endpoint
 */
NodeProvider.prototype.web3For = function web3For(networkId) {
  return this.nodes[networkId].web3;
};


module.exports = NodeProvider;
