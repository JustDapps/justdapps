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

  describe('/GET - fetch by user id', () => {
    let app;
    let dataSource;

    before(() => {
      const findByUserStub = sinon.stub().resolves([]);
      findByUserStub.withArgs(authUserId).resolves([{}, {}]);
      dataSource = {
        model: {
          findByUser: findByUserStub,
        },
      };
      app = initApp(dataSource);
    });

    it('return code 200, and list of 2 models in response body. Database `findByUser` called with authenticated user id', async () => {
      const request = setCookie(chai.request(app).get('/models'), 'token', token);

      const response = await request;

      expect(response).to.have.status(200, 'invalid code');
      expect(response.body.body.models).to.have.lengthOf(2, 'invalid response');
      expect(dataSource.model.findByUser.calledWith(authUserId)).to.equal(true, 'invalid method call');
    });

    it('return code 401 in case of invalid token', async () => {
      const request = setCookie(chai.request(app).get('/models'), 'token', 'INVALID TOKEN');

      const response = await request;

      expect(response).to.have.status(401);
    });

    it('return code 401 in case of no token in cookies', async () => {
      const request = chai.request(app).get('/models');

      const response = await request;

      expect(response).to.have.status(401);
    });
  });

  describe('/POST - create new model for auth user ', () => {
    let app;
    let dataSource;
    const newModelId = 'modelId1';
    const newModel = {
      name: 'NEW TEST MODEL',
    };

    before(() => {
      dataSource = {
        model: {
          addForUser: sinon.stub().resolves(newModelId),
        },
      };
      app = initApp(dataSource);
    });

    it('return code 401 in case of invalid token', async () => {
      const request = setCookie(chai.request(app).post('/models'), 'token', 'INVALID TOKEN');

      const response = await request;

      expect(response).to.have.status(401);
    });

    it('return code 200 and new model id in response body, Database `addForUser` methods called with correct parameters', async () => {
      const request = setCookie(
        chai.request(app).post('/models').send({ model: newModel }),
        'token',
        token,
      );

      const response = await request;

      expect(response).to.have.status(200, 'invalid status');
      expect(response.body.body.modelId).to.equal(newModelId, 'invalid response');
      expect(dataSource.model.addForUser.calledWithMatch({ name: newModel.name }, authUserId)).to.equal(true, 'invalid method call');
    });
  });
});
