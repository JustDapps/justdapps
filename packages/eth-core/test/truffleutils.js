/**
 * Provides utilities for manipulating the ganache-cli process
 */
const request = require('superagent');

const Utils = function Utils({ networkId, node } = {}) {
  this.networkId = networkId || '999';
  this.node = node || 'http://localhost:8545';
  console.log(`Utils created for ${this.networkId} id ${this.node}`);
};

Utils.prototype.makeSnapshot = function reset() {
  return request
    .post(this.node)
    .send({
      id: this.networkId,
      jsonrpc: '2.0',
      method: 'evm_snapshot',
      params: [],
    })
    .then((res) => res.body.result)
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
    });
};


Utils.prototype.revertTo = function revertTo(snapshot) {
  return request
    .post(this.node)
    .send({
      id: this.networkId,
      jsonrpc: '2.0',
      method: 'evm_revert',
      params: [snapshot],
    })
    .then((res) => res.body.result)
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
    });
};

module.exports = Utils;
