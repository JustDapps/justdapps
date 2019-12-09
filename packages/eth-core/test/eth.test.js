/* eslint-disable import/no-extraneous-dependencies */

/**
 * Prior to running this test ganache-cli and migrations should be run.
 * See `contracts` and `migrations` folders for more information
 */

const fs = require('fs');
const chai = require('chai');
const Eth = require('../src/eth');
const EthError = require('../src/ethError');

chai.use(require('chai-http'));
chai.use(require('chai-as-promised'));

const { expect } = chai;
const networkId = 999;

let testData;
let storageContract;
let managerContract;

const loadTestData = () => {
  testData = JSON.parse(
    fs.readFileSync('test/migrations.log'),
  );
  storageContract = testData.contracts.storage;
  managerContract = testData.contracts.manager;
};

/** Makes new abi array with a single item of `methodName` */
const getMethodAbi = (contract, methodName) => [
  contract.abi.find(({ name }) => name === methodName),
];

describe('eth', () => {
  let eth;

  before(() => {
    loadTestData();
    eth = new Eth(new Eth.NodeProvider({
      [networkId.toString()]: 'http://localhost:8545',
    }));
  });

  describe('call', () => {
    it('return single value: string', async () => {
      const abi = getMethodAbi(storageContract, 'stringData');

      const result = await eth.call(storageContract.address, abi, networkId, 'stringData', []);

      return expect(result).to.equal('Initial');
    });

    it('return single value: number', async () => {
      const abi = getMethodAbi(storageContract, 'uintData');

      const result = await eth.call(storageContract.address, abi, networkId, 'uintData', []);

      return expect(result).to.equal('5');
    });

    it('return single value: address', async () => {
      const abi = getMethodAbi(storageContract, 'owner');

      const result = await eth.call(storageContract.address, abi, networkId, 'owner', []);

      return expect(result).to.equal(testData.params.owner);
    });

    it('return multiple values', async () => {
      const result = await eth.call(
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
      const request = eth.call(storageContract.address, [], networkId, 'uintData', []);

      return expect(request).to.eventually.be.rejectedWith(EthError, 'No method in ABI');
    });

    it('throw EthError in case of invalid method (contract doesn`t have such method)', async () => {
      const abi = getMethodAbi(storageContract, 'getSomeValues');

      const request = eth.call(managerContract.address, abi, networkId, 'getSomeValues', [testData.params.owner]);

      return expect(request).to.eventually.be.rejectedWith(EthError);
    });

    it('throw EthError in case of invalid parameters', async () => {
      const abi = getMethodAbi(storageContract, 'getSomeValues');

      const request = eth.call(storageContract.address, abi, networkId, 'getSomeValues', ['0x0']);

      return expect(request).to.eventually.be.rejectedWith(EthError);
    });

    it('throw EthError in case of revert during call', async () => {
      const request = eth.call(storageContract.address, storageContract.abi, networkId, 'getAlwaysRevert', []);
      return expect(request)
        .to.eventually.be.rejectedWith(EthError);
    });
  });
});
