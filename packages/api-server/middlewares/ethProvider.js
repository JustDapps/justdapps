/**
 * This middleware populates request object with ethSource object
 * EthSource is an instance of Eth, located in '@justdapps/eth-core/src/eth.js'
 * Later usage example:
 * req.ethSource.callContract(...)
 */
module.exports = (ethSource) => (req, res, next) => {
  req.ethSource = ethSource;
  next();
};
