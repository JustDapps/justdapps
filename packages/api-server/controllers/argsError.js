/**
 * Creates module-specific error object
 * @param {String} message error message
 */
function ArgsError(message) {
    this.message = message;
}
ArgsError.prototype = Object.create(Error.prototype);
ArgsError.prototype.constructor = ArgsError;
ArgsError.prototype.name = 'ArgsError';

module.exports = ArgsError;
