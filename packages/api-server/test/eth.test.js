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
const nonEntityName = 'administrator';
const entityAddress = '0x3333333333333333333333333333333333333333';
const allowedAddress = '0x2222222222222222222222222222222222222222';
const nonEntityAddress = '0x1111111111111111111111111111111111111111';

describe('/eth', () => {
  let dataSource;
  let errorDataSource;
  const methodArgs = [1, 2, 'three'];
  const method = 'method1';
  const contract1Abi = '[{"name": "method1","outputs": [{"internalType": "uint256", "name": "", "type": "uint256"},{"internalType": "bool","name": "","type": "bool"},{"internalType": "string", "name": "","type": "string"}]}, {"name": "method2"}]';
  const contract1AbiArray = JSON.parse(contract1Abi);
  const entityModel = {
    address: entityAddress,
    name: entityName,
    abi: contract1Abi,
    networkId,
  };
  const nonEntity = {
    address: nonEntityAddress,
    name: nonEntityName,
  };

  // setting helpers
  const setTokenCookie = tokenCookieSetter(authUserId);
  const testInvalidAuthToken = createInvalidAuthTokenTest(expect);

  // setting stubs
  const checkOwnerStub = sinon.stub().resolves(false);
  checkOwnerStub.withArgs(authUserId, modelId).resolves(true);

  const getDappEntityStub = sinon.stub().resolves(null);
  getDappEntityStub.withArgs(entityName, modelId, dappId).resolves(entityModel);
  getDappEntityStub.withArgs(nonEntityName, modelId, dappId).resolves(nonEntity);

  before(() => {
    dataSource = {
      model: {
        checkOwner: checkOwnerStub,
        getDappEntity: getDappEntityStub,
      },
    };

    errorDataSource = {
      model: {
        checkOwner: sinon.stub().resolves(true),
        getDappEntity: sinon.stub().rejects({ message: 'UNKNOWN ERROR' }),
        getModelEntity: sinon.stub().rejects({ message: 'UNKNOWN ERROR' }),
      },
    };
  });

  describe('/call', () => {
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
        dataSource.model.getDappEntity.resetHistory();
        dataSource.model.checkOwner.resetHistory();

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
        expect(response.body.body.results).to.deep.equal([{
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
          entityModel.address, contract1AbiArray, networkId, method, methodArgs, options,
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

      it('return code 400 if entity is not smart contract', async () => {
        const request = setTokenCookie(
          chai.request(app)
            .post('/eth/call')
            .send({
              modelId,
              dappId,
              entity: nonEntityName,
              method,
              args: methodArgs,
            }),
        );

        const response = await request;

        expect(response).to.have.status(400);
        return expect(response.body.error).to.equal('Not a smart contract');
      });

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
        entityAddress, contract1AbiArray, networkId, method, methodArgs, options,
      ).resolves(resultingTx);

      app = initApp(dataSource, ethSource);
    });

    describe('successful request should ...', () => {
      let response;

      before(async () => {
        dataSource.model.getDappEntity.resetHistory();
        dataSource.model.checkOwner.resetHistory();

        const request = createRequest();
        response = await request;
      });

      after(() => {
        ethSource.createUnsignedTx.resetHistory();
      });

      it('return code 200', () => expect(response).to.have.status(200));

      it('return a tx object in response body', () => expect(
        response.body.body.tx,
      ).has.all.keys('from', 'to', 'gas', 'gasPrice', 'value', 'nonce', 'data'));

      it('call dataSource.getDappEntity with correct parameters', () => expect(
        dataSource.model.getDappEntity.calledWith(entityName, modelId, dappId),
      )
        .to.equal(true));

      it('call ethSource.createUnsignedTx with correct parameters', () => expect(
        ethSource.createUnsignedTx.calledWith(
          entityModel.address, contract1AbiArray, networkId, method, methodArgs, options,
        ),
      ).to.equal(true));
    });

    describe('errors', () => {
      testInvalidAuthToken(() => chai.request(app).post('/eth/methodtx'));

      it('return code 400 if entity is not smart contract', async () => {
        const request = createRequest({ entity: nonEntityName });

        const response = await request;

        expect(response).to.have.status(400);
        return expect(response.body.error).to.equal('Not a smart contract');
      });

      it('should return code 400 if EthError is thrown', async () => {
        const response = await createRequest({ options: {} });

        expect(response).to.have.status(400);
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
    let app;
    let getModelEntityStub;
    let ethSource;
    let resultingTx;
    const bytecode = 'bytecode';

    const options = { from: allowedAddress };

    // creates request with specific paramers, set in `data` object
    const createRequest = (data = {}, requestApp = app) => setTokenCookie(
      chai.request(requestApp)
        .post('/eth/deploytx')
        .send({
          bytecode: data.bytecode || bytecode,
          modelId: data.modelId || modelId,
          networkId: data.networkId || networkId,
          entity: data.entity || entityName,
          args: data.args || methodArgs,
          options: data.options || options,
        }),
    );

    before(async () => {
      resultingTx = {
        from: options.from,
        nonce: 1,
        data: '0x1',
        gas: 1,
        gasPrice: '100',
        value: 0,
      };

      getModelEntityStub = sinon.stub().resolves(null);
      getModelEntityStub.withArgs(entityName, modelId)
        .resolves({ name: entityModel.name, abi: entityModel.abi });
      getModelEntityStub.withArgs(nonEntityName, modelId)
        .resolves({ name: nonEntityName });

      ethSource = {
        createUnsignedDeployTx: sinon.stub().rejects({ name: 'EthError', message: 'ERROR' }),
      };
      ethSource.createUnsignedDeployTx.withArgs(
        bytecode, contract1AbiArray, networkId, methodArgs, options,
      ).resolves(resultingTx);

      app = initApp(
        {
          model: {
            checkOwner: checkOwnerStub,
            getModelEntity: getModelEntityStub,
          },
        },
        ethSource,
      );
    });

    describe('successful request should ...', () => {
      let response;

      before(async () => {
        const request = createRequest();
        response = await request;
      });

      after(() => {
        ethSource.createUnsignedDeployTx.resetHistory();
      });

      it('return code 200', () => expect(response).to.have.status(200));

      it('return a tx object in response body', () => expect(
        response.body.body.tx,
      ).has.all.keys('from', 'gas', 'gasPrice', 'value', 'nonce', 'data'));

      it('call dataSource.getModelEntity with correct parameters', () => expect(
        getModelEntityStub.calledWith(entityName, modelId),
      )
        .to.equal(true));

      it('call ethSource.createUnsignedTx with correct parameters', () => expect(
        ethSource.createUnsignedDeployTx.calledWith(
          bytecode, contract1AbiArray, networkId, methodArgs, options,
        ),
      ).to.equal(true));
    });

    describe('errors', () => {
      testInvalidAuthToken(() => chai.request(app).post('/eth/methodtx'));

      it('return code 400 if entity is not smart contract', async () => {
        const request = createRequest({ entity: nonEntityName });

        const response = await request;

        expect(response).to.have.status(400);
        return expect(response.body.error).to.equal('Not a smart contract');
      });

      it('should return code 400 if EthError is thrown', async () => {
        const response = await createRequest({ options: {} });

        expect(response).to.have.status(400);
      });

      it('return code 403 if user doesn`t have access to model', async () => {
        const response = await createRequest({ modelId: anotherModelId });

        expect(response).to.have.status(403);
      });

      it('return code 500 if unknown error occurs', async () => {
        const errorApp = initApp(errorDataSource, ethSource);
        const response = await createRequest({}, errorApp);

        expect(response).to.have.status(500);
        expect(response.body.error).to.equal('UNKNOWN ERROR');
      });
    });
  });

  describe('/send', () => {
    let app;
    let ethSource;
    const tx = 'signedTx';
    const txHash = 'txhash';

    const createRequest = (data = {}, requestApp = app) => setTokenCookie(
      chai.request(requestApp).post('/eth/send').send({
        tx: data.tx || tx,
        networkId: data.networkId || networkId,
      }),
    );

    before(() => {
      ethSource = {
        sendSignedTx: sinon.stub().rejects({ name: 'EthError', message: 'ERROR' }),
      };
      ethSource.sendSignedTx.withArgs(tx, networkId).resolves(txHash);
      app = initApp(dataSource, ethSource);
    });

    it('should return code 200 and tx hash in case of successful response', async () => {
      const response = await createRequest();
      expect(response).to.have.status(200);
      return expect(response.body.body.txHash).to.equal(txHash);
    });

    testInvalidAuthToken(createRequest);

    it('should return code 400 in case of EthError', async () => {
      const response = await createRequest({ tx: 'errorData' });
      return expect(response).to.have.status(400);
    });
  });
});
