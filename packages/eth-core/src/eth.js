/**
 * This module provides functions for interaction with Etherum blockchain.
 * Requires node endpoints information to be passed in a constructor
 */

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

module.exports = Eth;
