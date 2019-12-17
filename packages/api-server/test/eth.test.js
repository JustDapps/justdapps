/* eslint-disable import/no-extraneous-dependencies */
const chai = require('chai');
const sinon = require('sinon');
const initApp = require('../app');
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
  let dataSource;
  let errorDataSource;
  const methodArgs = [1, 2, 'three'];
  const method = 'method1';
  const contract1Abi = '[{"name": "method1","outputs": [{"internalType": "uint256", "name": "", "type": "uint256"},{"internalType": "bool","name": "","type": "bool"},{"internalType": "string", "name": "","type": "string"}]}, {"name": "method2"}]';
  const entityModel = {
    address: entityAddress,
    name: entityName,
    abi: contract1Abi,
    networkId,
  };

  let setTokenCookie;
  const testInvalidAuthToken = createInvalidAuthTokenTest(expect);

  before(() => {
    setTokenCookie = tokenCookieSetter(authUserId);

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

    errorDataSource = {
      model: {
        checkOwner: sinon.stub().resolves(true),
        getDappEntity: sinon.stub().rejects({ message: 'UNKNOWN ERROR' }),
      },
    };
  });

  afterEach(() => {
    dataSource.model.getDappEntity.resetHistory();
    dataSource.model.checkOwner.resetHistory();
    errorDataSource.model.getDappEntity.resetHistory();
    errorDataSource.model.checkOwner.resetHistory();
  });

  describe.only('/call', () => {
    let app;
    let ethSource;

    const ethCallResult = { 0: '123', 1: 'false', 2: 'it is a string' };

    before(async () => {
      ethSource = {
        callContract: sinon.stub().rejects({ name: 'EthError', message: 'No method in ABI' }),
      };
      // return call result only in specific case
      ethSource.callContract.withArgs(
        entityAddress, sinon.match.any, networkId, method, sinon.match.any, sinon.match.any,
      ).resolves(ethCallResult);

      app = initApp(dataSource, ethSource);
    });

    describe('succesful request should ...', () => {
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
              args: methodArgs,
              options,
            }),
        );

        response = await request;
      });

      it('return code 200', async () => expect(response).to.have.status(200));

      it('return an array of {value, type} in the response body', () => {
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

      it('call dataSource.model.getDappEntity with correct arguments', () => expect(
        dataSource.model.getDappEntity.calledWith(entityName, modelId, dappId),
      ).to.equal(true));

      it('call ethSource.callContract with correct arguments', () => expect(
        ethSource.callContract.calledWith(
          entityModel.address, JSON.parse(entityModel.abi), networkId, method, args, options,
        ),
      ).to.equal(true));
    });

    describe('errors', () => {
      testInvalidAuthToken(() => chai.request(app)
        .post('/eth/call')
        .send({
          modelId,
          dappId,
          entity: entityName,
          method,
          args: methodArgs,
        }));

      it('return code 403 if user doesn`t have access to model', async () => {
        const request = setTokenCookie(
          chai.request(app)
            .post('/eth/call')
            .send({
              anotherModelId, dappId, entity: entityName, method, args: methodArgs,
            }),
        );

        const response = await request;
        expect(response).to.have.status(403);
      });

      it('return code 400 if no method exists in the contract', async () => {
        const request = setTokenCookie(
          chai.request(app)
            .post('/eth/call')
            .send({
              modelId, dappId, entity: entityName, method: 'UNKNOWN', args: methodArgs,
            }),
        );

        const response = await request;
        expect(response).to.have.status(400);
      });

      it('return code 500 if unknown error occurs', async () => {
        const errorApp = initApp(errorDataSource, ethSource);
        const request = setTokenCookie(
          chai.request(errorApp)
            .post('/eth/call')
            .send({
              modelId, dappId, entity: entityName, method, args: methodArgs,
            }),
        );

        const response = await request;
        expect(response).to.have.status(500);
        expect(response.body.error).to.equal('UNKNOWN ERROR');
      });
    });
  });

  describe('/methodtx', () => {
    let app;
    let ethSource;
    let resultingTx;

    const options = { from: allowedAddress };

    // creates request with specific paramers, set in `data` object
    const createRequest = (data = {}, requestApp = app) => setTokenCookie(
      chai.request(requestApp)
        .post('/eth/methodtx')
        .send({
          modelId: data.modelId || modelId,
          dappId: data.dappId || dappId,
          entity: data.entity || entityName,
          method: data.method || method,
          args: data.args || methodArgs,
          options: data.options || options,
        }),
    );

    before(async () => {
      resultingTx = {
        from: options.from,
        nonce: 1,
        to: entityAddress,
        data: '0x1',
        gas: 1,
        gasPrice: '100',
        value: 0,
      };

      ethSource = {
        createUnsignedTx: sinon.stub().rejects({ name: 'EthError', message: 'ERROR' }),
      };
      ethSource.createUnsignedTx.withArgs(
        entityAddress, contract1Abi, networkId, method, methodArgs, options,
      ).resolves(resultingTx);
      app = initApp(dataSource, ethSource);
    });

    afterEach(() => {
      ethSource.createUnsignedTx.resetHistory();
    });

    describe.only('successful request should ...', () => {
      let response;

      before(async () => {
        const request = createRequest();
        response = await request;
      });

      it('return code 200', () => expect(response).to.have.status(200));

      it('return a tx object in response body', () => expect(
        response.body.body,
      ).has.all.keys('from', 'to', 'gas', 'gasPrice', 'value', 'nonce', 'data'));

      it('call dataSource.getDappEntity with correct parameters', () => expect(
        dataSource.model.getDappEntity.calledWith(entityName, modelId, dappId),
      )
        .to.equal(true));

      it('call ethSource.createUnsignedTx with correct parameters', () => expect(
        ethSource.createUnsignedTx.calledWith(
          entityModel.address, JSON.parse(entityModel.abi), networkId, method, [], options,
        ),
      ).to.equal(true));
    });

    describe('errors', () => {
      testInvalidAuthToken(() => app.post('/eth/methodtx'));

      it('should return code 400 if no `from` address specified in options', async () => {
        const response = await createRequest({ options: {} });

        expect(response).to.have.status(400);
        expect(response.body.error).to.equal('No sender address specified');
      });

      it('return code 403 if user doesn`t have access to model', async () => {
        const response = await createRequest({ modelId: anotherModelId });

        expect(response).to.have.status(403);
      });

      it('return code 400 if no method exists in the contract', async () => {
        const response = await createRequest({ method: 'UNKNOWN' });

        expect(response).to.have.status(400);
      });

      it('return code 500 if unknown error occurs', async () => {
        const errorApp = initApp(errorDataSource, ethSource);
        const response = await createRequest({}, errorApp);

        expect(response).to.have.status(500);
        expect(response.body.error).to.equal('UNKNOWN ERROR');
      });
    });
  });

  describe('/deploytx', () => {

  });

  describe('/send', () => {

  });
});
