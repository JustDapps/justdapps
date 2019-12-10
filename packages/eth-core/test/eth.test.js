/* eslint-disable import/no-extraneous-dependencies */

/**
 * Prior to running this test ganache-cli and migrations should be run.
 * See `contracts` and `migrations` folders for more information
 */

const fs = require('fs');
const chai = require('chai');
const Eth = require('../src/eth');
const EthError = require('../src/ethError');
const Utils = require('./truffleutils');

chai.use(require('chai-as-promised'));
chai.use(require('chai-string'));

const { expect } = chai;
const networkId = 999;

// for manipulating ganache-cli
const utils = new Utils({ networkId });

// stores ganache-cli snapshot id
let snapshot;

/** Makes new abi array with a single item of `methodName` */
const getMethodAbi = (contract, methodName) => [
  contract.abi.find(({ name }) => name === methodName),
];

describe('eth', () => {
  let eth;
  let testData;
  let storageContract;
  let managerContract;

  before(async () => {
    snapshot = await utils.makeSnapshot();

    testData = JSON.parse(
      fs.readFileSync('test/migrations.log'),
    );
    storageContract = testData.contracts.storage;
    managerContract = testData.contracts.manager;

    eth = new Eth(new Eth.NodeProvider({
      [networkId.toString()]: 'http://localhost:8545',
    }));
  });

  describe('call', () => {
    it('return single value: string', async () => {
      const abi = getMethodAbi(storageContract, 'stringData');

      const result = await eth.callContract(storageContract.address, abi, networkId, 'stringData', []);

      return expect(result).to.equal('Initial');
    });

    it('return single value: number', async () => {
      const abi = getMethodAbi(storageContract, 'uintData');

      const result = await eth.callContract(storageContract.address, abi, networkId, 'uintData', []);

      return expect(result).to.equal('5');
    });

    it('return single value: address', async () => {
      const abi = getMethodAbi(storageContract, 'owner');

      const result = await eth.callContract(storageContract.address, abi, networkId, 'owner', []);

      return expect(result).to.equal(testData.params.owner);
    });

    it('return multiple values', async () => {
      const result = await eth.callContract(
        storageContract.address,
        storageContract.abi,
        networkId,
        'getSomeValues',
        [testData.params.owner],
      );

      return expect(result).to.deep.equal({
        0: '1',
        1: false,
        2: 'Initial',
      });
    });

    it('throw EthError `No method in ABI` in case of ABI error (no function in ABI)', async () => {
      const request = eth.callContract(storageContract.address, [], networkId, 'uintData', []);

      return expect(request).to.eventually.be.rejectedWith(EthError, 'No method in ABI');
    });

    it('throw EthError in case of invalid method (contract doesn`t have such method)', async () => {
      const abi = getMethodAbi(storageContract, 'getSomeValues');

      const request = eth.callContract(managerContract.address, abi, networkId, 'getSomeValues', [testData.params.owner]);

      return expect(request).to.eventually.be.rejectedWith(EthError);
    });

    it('throw EthError in case of invalid parameters', async () => {
      const abi = getMethodAbi(storageContract, 'getSomeValues');

      const request = eth.callContract(storageContract.address, abi, networkId, 'getSomeValues', ['0x0']);

      return expect(request).to.eventually.be.rejectedWith(EthError);
    });

    it('throw EthError in case of revert during call', async () => {
      const request = eth.callContract(storageContract.address, storageContract.abi, networkId, 'getAlwaysRevert', []);
      return expect(request)
        .to.eventually.be.rejectedWith(EthError);
    });
  });

  describe('createUnsignedTx', () => {
    let sender;
    const param = 100;
    const hexParam = '64';
    let abi;
    let paramAddress;
    const gas = 10000;
    const gasPrice = '100000000000';
    const nonce = 9;
    const value = 100000;
    const methodName = 'setMapData';

    before(() => {
      abi = getMethodAbi(storageContract, methodName);
      sender = testData.params.owner;
      paramAddress = testData.params.admin;
    });

    describe('create transaction with all possible options provided', () => {
      let result;
      before(async () => {
        result = await eth.createUnsignedTx(
          storageContract.address,
          abi,
          networkId,
          methodName,
          [paramAddress, param],
          {
            from: sender, gas, gasPrice, nonce, value,
          },
        );
      });

      it('`data` should start with the method signature and end with a parameter',
        () => expect(result.data).to.startWith(abi[0].signature).and.endWith(hexParam));

      it('`from` should be equal to options.from', () => expect(result.from).to.be.equal(sender));
      it('`to` should be equal to contract address', () => expect(result.to).to.be.equal(storageContract.address));
      it('`nonce` should be equal to options.nonce', () => expect(result.nonce).to.be.equal(nonce));
      it('`gas` should be equal to options.gas', () => expect(result.gas).to.be.equal(gas));
      it('`gasPrice` should be equal to options.gasPrice', () => expect(result.gasPrice).to.be.equal(gasPrice));
      it('`value` should be equal to options.value', () => expect(result.value).to.be.equal(value));
    });

    describe('create transaction when some of options are missing', () => {
      let result;
      before(async () => {
        result = await eth.createUnsignedTx(
          storageContract.address,
          abi,
          networkId,
          methodName,
          [paramAddress, param],
          {
            from: sender,
          },
        );
      });

      it('`data` should still start with the method signature and end with a parameter',
        () => expect(result.data).to.startWith(abi[0].signature).and.endWith(hexParam));

      it('nonce is calculated as number if not set', () => expect(result.nonce).to.be.a('number'));

      it('value is set to 0 if not set', () => expect(result.value).to.equal(0));

      it('gas is calculated as number if not set', () => expect(result.gas).to.be.a('number'));

      it('gasPrice is calculated as string if not set', () => expect(result.gasPrice).to.be.a('string').and.not.empty);
    });

    describe('errors', () => {
      it('estimated gas of reverted method should equal to 0', async () => {
        const result = await eth.createUnsignedTx(
          storageContract.address,
          storageContract.abi,
          networkId,
          'setBoolData',
          [true],
          { from: testData.params.admin },
        );
        return expect(result.gas).to.equal(0);
      });

      it('missing options: from, expect throw `No sender address specified`', () => {
        const request = eth.createUnsignedTx(
          storageContract.address,
          storageContract.abi,
          networkId,
          'setBoolData',
          [true],
          {},
        );

        return expect(request).to.eventually.be.rejectedWith(EthError, 'No sender address specified');
      });
    });
  });

  describe.only('sendSignedTx', () => {
    let web3;
    const ownerPrivateKey = '0x5aeeaa1762e08e2de4ad467a4344c5942259eeb24031e356cdef26268099542f';
    const adminPrivateKey = '0x4e25652bfc657f12de0f968fdd798f862a5fe58d7ef347da37d715aa868a2202';

    before(async () => {
      web3 = eth.nodeProvider.web3For(networkId);
    });

    afterEach(async () => {
      await utils.revertTo(snapshot);
    });

    it('should return transactionHash immediately after transaction is sent', async () => {
      // create transferOwnership(admin) transaction
      const tx = await eth.createUnsignedTx(
        storageContract.address,
        storageContract.abi,
        networkId,
        'transferOwnership',
        [testData.params.admin],
        {
          gas: 100000,
          from: testData.params.owner,
        },
      );
      const signedTx = await web3.eth.accounts.signTransaction(tx, ownerPrivateKey);

      const result = await eth.sendSignedTx(signedTx.rawTransaction, networkId);
      return expect(result).to.be.a('string').with.lengthOf(66).and.startWith('0x');
    });

    it.only('should return transactionHash even in case of failed transaction', async () => {
      // create transferOwnership(admin, {from:admin}) transaction
      const tx = await eth.createUnsignedTx(
        storageContract.address,
        storageContract.abi,
        networkId,
        'transferOwnership',
        [testData.params.admin],
        {
          gas: 100000,
          from: testData.params.admin,
        },
      );
      console.log(tx);
      const signedTx = await web3.eth.accounts.signTransaction(tx, adminPrivateKey);

      const result = await eth.sendSignedTx(signedTx.rawTransaction, networkId);
      console.log(result);
      return expect(result).to.be.a('string').with.lengthOf(66).and.startWith('0x');
    });
  });
});
