/* eslint-disable import/no-extraneous-dependencies */
/**
 * To simulate auth process first we need to obtain application-signed token
 * Use `createToken` from auth/token.js for this purpose
 * Obtained token should be sent in cookies
 */

const chai = require('chai');
const sinon = require('sinon');
const initApp = require('../app');
const { createToken } = require('../auth/token.js');
const { setCookie } = require('./utils');
chai.use(require('chai-http'));

const { expect } = chai;

const authUserId = 'id1';
const nonAuthUserId = 'id2';

describe('/models', () => {
  let token;

  before(() => {
    token = createToken({
      id: authUserId,
    });
  });

  describe.only('/GET', () => {
    let app;

    before(() => {
      const dataSource = {
        model: {
          findByUser: sinon.stub().withArgs(authUserId).resolves([{}, {}]),
        },
      };
      app = initApp(dataSource);
    });

    it('should return code 200 and list of 2 models', async () => {
      const request = setCookie(chai.request(app).get('/models'), 'token', token);
      const response = await request;
      expect(response).to.have.status(200, 'invalid code');
      expect(response.body.body.models).to.have.lengthOf(2, 'invalid length');
    });

    it('should return 401 code in case of invalid token', async () => {
      const request = setCookie(chai.request(app).get('/models'), 'token', 'INVALID TOKEN');
      const response = await request;
      expect(response).to.have.status(401);
    });

    it('should return 401 code in case of no token in cookies', async () => {
      const request = chai.request(app).get('/models');
      const response = await request;
      expect(response).to.have.status(401);
    });
  });
});
