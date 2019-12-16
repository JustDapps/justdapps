/* eslint-disable import/no-extraneous-dependencies */
const chai = require('chai');
const sinon = require('sinon');
const initApp = require('../app');
const { createToken } = require('../auth/token.js');
const { tokenCookieSetter, createInvalidAuthTokenTest } = require('./utils');
chai.use(require('chai-http'));

const { expect } = chai;
const authUserId = 'id1';
const networkId = 1;
const modelId = 'modelId1';
const anotherModelId = 'anotherModelId1';
const dappId = 'dappId1';
const entityName = 'storage';
const entityAddress = '0x3333333333333333333333333333333333333333';
const allowedAddress = '0x2222222222222222222222222222222222222222';
const nonallowedAddress = '0x1111111111111111111111111111111111111111';

describe('/eth', () => {
  let setTokenCookie;
  const testInvalidAuthToken = createInvalidAuthTokenTest(expect);

  before(() => {
    setTokenCookie = tokenCookieSetter(
      createToken({
        id: authUserId,
      }),
    );
  });

  describe.only('/call', () => {
    let app;
    let dataSource;
    let ethSource;

    const method = 'method1';
    const args = [1, 2, 'three'];
    const contract1Abi = '[{"name": "method1","outputs": [{"internalType": "uint256", "name": "", "type": "uint256"},{"internalType": "bool","name": "","type": "bool"},{"internalType": "string", "name": "","type": "string"}]}, {"name": "method2"}]';
    const entityModel = {
      address: entityAddress,
      name: entityName,
      abi: contract1Abi,
      networkId,
    };
    const ethCallResult = { 0: '123', 1: 'false', 2: 'it is a string' };

    before(async () => {
      // dataSource methods don't work by default
      dataSource = {
        model: {
          checkOwner: sinon.stub().resolves(false),
          getDappEntity: sinon.stub().resolves(null),
        },
      };
      // resolve true only if authUserId requests for modelId
      dataSource.model.checkOwner.withArgs(authUserId, modelId).resolves(true);

      // return model only in specific case
      dataSource.model.getDappEntity.withArgs(entityName, modelId, dappId).resolves(entityModel);


      ethSource = {
        callContract: sinon.stub().rejects({ name: 'EthError', message: 'No method in ABI' }),
      };
      // return call result only in specific case
      ethSource.callContract.withArgs(
        entityAddress, sinon.match.any, networkId, method, sinon.match.any, sinon.match.any,
      ).resolves(ethCallResult);

      app = initApp(dataSource, ethSource);
    });

    describe('succesful response', () => {
      let response;
      const options = { from: allowedAddress };
      before(async () => {
        const request = setTokenCookie(
          chai.request(app)
            .post('/eth/call')
            .send({
              modelId,
              dappId,
              entity: entityName,
              method,
              args,
              options,
            }),
        );

        response = await request;
      });

      it('return code 200', async () => expect(response).to.have.status(200));

      it('model.getDappEntity is called with correct arguments', () => expect(
        dataSource.model.getDappEntity.calledWith(entityName, modelId, dappId),
      ).to.equal(true));

      it('eth.callContract is called with correct arguments', () => expect(
        ethSource.callContract.calledWith(
          entityModel.address, JSON.parse(entityModel.abi), networkId, method, args, options,
        ),
      ).to.equal(true));

      it('response body is array of {value, type}', () => {
        expect(response.body.body).to.deep.equal([{
          value: ethCallResult[0],
          type: 'uint256',
        }, {
          value: ethCallResult[1],
          type: 'bool',
        }, {
          value: ethCallResult[2],
          type: 'string',
        }]);
      });
    });

    describe('errors', () => {
      testInvalidAuthToken(() => chai.request(app)
        .post('/eth/call')
        .send({
          modelId,
          dappId,
          entity: entityName,
          method,
          args,
        }));

      it('return 403 if user doesn`t have access to model', async () => {
        const request = setTokenCookie(
          chai.request(app)
            .post('/eth/call')
            .send({
              anotherModelId, dappId, entity: entityName, method, args,
            }),
        );

        const response = await request;
        expect(response).to.have.status(403);
      });

      it('return 400 if no method exists in the contract', async () => {
        const request = setTokenCookie(
          chai.request(app)
            .post('/eth/call')
            .send({
              modelId, dappId, entity: entityName, method: 'UNKNOWN', args,
            }),
        );

        const response = await request;
        expect(response).to.have.status(400);
      });

      it('return 500 if unknown error occurs', async () => {
        const errorDataSource = {
          model: {
            checkOwner: sinon.stub().resolves(true),
            getDappEntity: sinon.stub().rejects({ message: 'UNKNOWN ERROR' }),
          },
        };
        const errorApp = initApp(errorDataSource, ethSource);
        const request = setTokenCookie(
          chai.request(errorApp)
            .post('/eth/call')
            .send({
              modelId, dappId, entity: entityName, method, args,
            }),
        );

        const response = await request;
        expect(response).to.have.status(500);
        expect(response.body.error).to.equal('UNKNOWN ERROR');
      });
    });

    describe('/methodtx', () => {

    });

    describe('/deploytx', () => {

    });

    describe('/send', () => {

    });
  });
});
