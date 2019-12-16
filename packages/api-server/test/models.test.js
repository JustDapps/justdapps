/* eslint-disable import/no-extraneous-dependencies */
/**
 * To simulate auth process first we need to obtain application-signed token
 * Obtained token should be sent in cookies
 */

const chai = require('chai');
const sinon = require('sinon');
const initApp = require('../app');
const { tokenCookieSetter, createInvalidAuthTokenTest } = require('./utils');
chai.use(require('chai-http'));

const { expect } = chai;

const authUserId = 'id1';

describe('/models', () => {
  let setTokenCookie;
  const testInvalidAuthToken = createInvalidAuthTokenTest(expect);

  before(() => {
    setTokenCookie = tokenCookieSetter(authUserId);
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

    afterEach(() => {
      dataSource.model.findByUser.resetHistory();
    });


    it('return code 200, and list of 2 models in response body. Database `findByUser` called with authenticated user id', async () => {
      const request = setTokenCookie(chai.request(app).get('/models'));

      const response = await request;

      expect(response).to.have.status(200, 'invalid status code');
      expect(response.body.body.models).to.have.lengthOf(2, 'invalid response');
      expect(dataSource.model.findByUser.calledWith(authUserId)).to.equal(true, 'invalid method call');
    });

    testInvalidAuthToken(() => chai.request(app).get('/models'));

    it('return code 401 in case of no auth token in cookies', async () => {
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

    afterEach(() => {
      dataSource.model.addForUser.resetHistory();
    });


    testInvalidAuthToken(() => chai.request(app).post('/models'));

    it('return code 200 and new model id in response body, Database `addForUser` methods called with correct parameters', async () => {
      const request = setTokenCookie(
        chai.request(app).post('/models').send({ model: newModel }),
      );

      const response = await request;

      expect(response).to.have.status(200, 'invalid status');
      expect(response.body.body.modelId).to.equal(newModelId, 'invalid response');
      expect(dataSource.model.addForUser.calledWithMatch({ name: newModel.name }, authUserId)).to.equal(true, 'invalid method call');
    });
  });

  describe('/PUT - update model', () => {
    let app;
    let dataSource;
    const modelId = 'modelId1';
    const nonExistingModelId = 'modelId2';
    const invalidModelId = 'invalidid3';
    const updateProperties = {
      descripton: 'UPDATED DESCRIPTION',
    };

    before(() => {
      dataSource = {
        model: {
          checkOwner: sinon.stub().resolves(false),
          update: sinon.stub().resolves(true),
        },
      };
      dataSource.model.checkOwner.withArgs(authUserId, modelId).resolves(true);
      dataSource.model.checkOwner.withArgs(authUserId, invalidModelId).rejects();
      app = initApp(dataSource);
    });

    afterEach(() => {
      dataSource.model.update.resetHistory();
    });

    it('return code 200, {result:true} in response body. Database `update` method is called', async () => {
      const request = setTokenCookie(chai.request(app).put('/models').send({
        modelId, model: updateProperties,
      }));

      const response = await request;

      expect(response).to.have.status(200, 'invalid status code');
      expect(response.body.body.result).to.equal(true, 'invalid response body');
      expect(dataSource.model.update.calledWith(updateProperties, modelId)).to.equal(true, 'invalid method call');
    });

    it('return code 403 if user is not an owner of modelId, body contains error. Database `update` method not called', async () => {
      const request = setTokenCookie(chai.request(app).put('/models').send({
        modelId: nonExistingModelId, model: updateProperties,
      }));

      const response = await request;

      expect(response).to.have.status(403, 'invalid status code');
      expect(response.body.error).to.be.a('string', 'invalid response').and.not.empty;
      expect(dataSource.model.update.called).to.equal(false, 'invalid method call');
    });

    it('return code 400 if invalid model id specified (checkOwner throws)', async () => {
      const request = setTokenCookie(chai.request(app).put('/models').send({
        modelId: invalidModelId, model: updateProperties,
      }));

      const response = await request;
      expect(response).to.have.status(400, 'invalid status code');
      expect(response.body.error).to.be.a('string', 'invalid response').and.not.empty;
    });

    testInvalidAuthToken(() => chai.request(app).put('/models'));
  });

  describe('/DELETE - delete specific model', () => {
    let app;
    let dataSource;
    const modelId = 'modelId1';
    const nonExistingModelId = 'modelId2';
    const invalidModelId = 'invalidid3';

    before(() => {
      dataSource = {
        model: {
          checkOwner: sinon.stub().resolves(false),
          delete: sinon.stub().resolves(true),
        },
      };
      dataSource.model.checkOwner.withArgs(authUserId, modelId).resolves(true);
      dataSource.model.checkOwner.withArgs(authUserId, invalidModelId).rejects();
      app = initApp(dataSource);
    });

    afterEach(() => {
      dataSource.model.delete.resetHistory();
    });

    it('return code 200, {result:true} in response body. Database `delete` method called', async () => {
      const request = setTokenCookie(chai.request(app).delete('/models').send({ modelId }));

      const response = await request;

      expect(response).to.have.status(200, 'invalid status code');
      expect(response.body.body.result).to.equal(true, 'invalid response body');
    });

    it('return code 403 if user is not an owner of modelId, body contains error. Database `delete` method not called', async () => {
      const request = setTokenCookie(chai.request(app).delete('/models').send({
        modelId: nonExistingModelId,
      }));

      const response = await request;

      expect(response).to.have.status(403, 'invalid status code');
      expect(response.body.error).to.be.a('string', 'invalid response').and.not.empty;
      expect(dataSource.model.delete.called).to.equal(false, 'invalid method call');
    });

    it('return code 400 if invalid model id specified (checkOwner throws)', async () => {
      const request = setTokenCookie(chai.request(app).delete('/models').send({
        modelId: invalidModelId,
      }));

      const response = await request;
      expect(response).to.have.status(400, 'invalid status code');
      expect(response.body.error).to.be.a('string', 'invalid response').and.not.empty;
    });

    testInvalidAuthToken(() => chai.request(app).delete('/models'));
  });
});
