/* eslint-disable import/no-extraneous-dependencies */

/**
 * Prior to running this test ganache-cli and migrations should be run.
 * See `contracts` and `migrations` folders for more information
 */

const fs = require('fs');
const chai = require('chai');
const Eth = require('../src/eth');

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

      expect(result).to.equal('Initial');
    });

    it('return single value: number', async () => {
      const abi = getMethodAbi(storageContract, 'uintData');

      const result = await eth.call(storageContract.address, abi, networkId, 'uintData', []);

      expect(result).to.equal('5');
    });

    it.only('return single value: address', async () => {
      const abi = getMethodAbi(storageContract, 'owner');

      const result = await eth.call(storageContract.address, abi, networkId, 'owner', []);
      console.log(abi);
      expect(result).to.equal(testData.params.owner);
    });

    it('return multiple values', async () => {
      const result = await eth.call(
        storageContract.address,
        storageContract.abi,
        networkId,
        'getSomeValues',
        [testData.params.owner],
      );

      expect(result).to.be.an('array').with.lengthOf(3).and.equal([
        testData.params.owner,
        false,
        'Initial',
      ]);
    });

    it('throw in case of ABI error (contract doesn`t have such method)', () => {
      expect(eth.call(storageContract.address, [], networkId, 'uintData', []))
        .to.eventually.throw('No method');
    });

    it('throw in case of revert during call', () => {
      expect(eth.call(storageContract.address, storageContract.abi, networkId, 'getAlwaysRevert', []))
        .to.eventually.throw('Call reverts');
    });
  });
});
