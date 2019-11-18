module.exports.responseBody = (body, error = null) => ({body, error});
module.exports.responseError = (error) => ({body: null, error});
