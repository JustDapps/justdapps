/* eslint-disable import/no-extraneous-dependencies */
const chai = require('chai');
const sinon = require('sinon');
const initApp = require('../app');
const { createToken } = require('../auth/token.js');
const { tokenCookieSetter, createInvalidAuthTokenTest } = require('./utils');
chai.use(require('chai-http'));

const { expect } = chai;
const authUserId = 'id1';

const modelId = 'modelId';
const dappId = 'dappId';
const entityName = 'storage';
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

    const method = 'uintData';
    const args = [1, 2, 'three'];
    const entityModel = {
      address: '0x1',
      name: 'test',
      abi: '[{"name": "method1","outputs": [{"internalType": "uint256", "name": "", "type": "uint256"},{"internalType": "bool","name": "","type": "bool"},{"internalType": "string", "name": "","type": "string"}]}, {"name": "method2"}]',
    };
    const ethCallResult = { 0: 'result1', 1: 'result2' };

    before(async () => {
      dataSource = {
        model: {
          checkOwner: sinon.stub().resolves(true),
          getDappEntity: sinon.stub().resolves(entityModel),
        },
      };
      ethSource = {
        callContract: sinon.stub().resolves(ethCallResult),
      };
      app = initApp(dataSource, ethSource);
    });

    it('return code 200 and call result in case of success, eth.callContract is called with correct arguments',
      async () => {
        const request = setTokenCookie(
          chai.request(app)
            .post('/eth/call')
            .send({
              modelId,
              dappId,
              entityName,
              method,
              args,
              options: {
                from: allowedAddress,
              },
            }),
        );

        const response = await request;
        console.log(response.body);
        expect(response).to.have.status(200);
        expect(ethSource.callContract.called).to.equal(true);

        // check result object argument types
      });

    it('return 403 if ', async () => {

    });
  });

  describe('/methodtx', () => {

  });

  describe('/deploytx', () => {

  });

  describe('/send', () => {

  });
});
