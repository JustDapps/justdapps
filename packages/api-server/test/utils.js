/**
 * Extracts specific cookie from the response
 * @param {*} res response as in Chai-http
 * @param {*} cookieName name of cookie to extract
 */
const extractCookie = (res, cookieName) => {
  const rawCookie = res.header['set-cookie'].find((item) => item.startsWith(`${cookieName}=`));
  const match = rawCookie.match(new RegExp(
    `${cookieName}=([^;]+)`,
  ));
  return match ? match[1] : null;
};
module.exports = {
  extractCookie,
};
