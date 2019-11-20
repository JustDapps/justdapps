/**
 * This middleware populates request object with dataSource object
 * Later usage:
 * req.dataSource.user.upsertGoolgeUser
 * req.dataSource.model.findByUser
 *
 * Full list of available methods is in '@justdapps/data-mongo-db/db.js'
 */
module.exports = (dataSource) => (req, res, next) => {
  req.dataSource = dataSource;
  next();
};
