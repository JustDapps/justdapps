/**
 * Creates module-specific error object
 * @param {String} message error message
 */
function EthError(message) {
  this.message = message;
}
EthError.prototype = Object.create(Error.prototype);
EthError.prototype.constructor = EthError;
EthError.prototype.name = 'EthException';

module.exports = EthError;
