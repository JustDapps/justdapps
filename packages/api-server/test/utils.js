const { createToken } = require('../auth/token.js');

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

/**
 * Attaches cookie `name`:`value` to chai-http request object
 * @param {*} req chai-http request object
 * @param {*} name name of cookie to set
 * @param {*} value cookie value
 * @returns request object with modified cookies header
 */
const setCookie = (req, name, value) => {
  const cookies = `${name}=${value}`;
  return req.set('Cookie', cookies);
};

/**
 * Attaches `token` cookie to request
 * @param {*} token auth token
 */
const tokenCookieSetter = (userId) => (req) => setCookie(req, 'token', createToken({ id: userId }));

/** Sets `token` cookie to some invalid value */
const setInvalidTokenCookie = (req) => setCookie(req, 'token', 'INVALID TOKEN');

const createInvalidAuthTokenTest = (expect) => (createRequest) => it(
  'return code 401 in case of invalid auth token',
  async () => {
    const request = setInvalidTokenCookie(createRequest());

    const response = await request;

    expect(response).to.have.status(401);
  },
);
module.exports = {
  extractCookie,
  setCookie,
  tokenCookieSetter,
  setInvalidTokenCookie,
  createInvalidAuthTokenTest,
};
