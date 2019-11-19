const users = [
  {
    authProvider: 'Google',
    profile: {
      id: '1234567890',
      displayName: 'test@gmail.com',
    },
  },
  {
    authProvider: 'Google',
    profile: {
      id: 'abcdefghijk',
      displayName: 'example@gmail.com',
    },
  },
];

const models = [
  {
    name: 'bcshop',
    description: 'Simple BCShop.io model',
    userId: 'test@gmail.com', // will be converted to MongoDb ObjectID
    version: '1',
    entities: [{
      name: 'storage',
      abi: '[]',
    }, {
      name: 'payment',
      abi: '[]',
    }, {
      name: 'owner',
    }, {
      name: 'admin',
    }],
    relations: [{
      source: 'owner',
      target: 'storage',
      setOps: 'target.transferOwnership(source)',
      validate: '',
    }, {
      source: 'owner',
      target: 'payment',
      setOps: 'target.transferOwnership(source)',
      validate: '',
    }, {
      source: 'admin',
      target: 'storage',
      setOps: 'target.setManager(source)',
      validate: '',
    }, {
      source: 'admin',
      target: 'payment',
      setOps: 'target.setManager(source)',
      validate: '',
    }, {
      source: 'payment',
      target: 'storage',
      setOps: 'target.setManager(source)',
      validate: '',
    }],
    dapps: [{
      networkId: 3,
      description: 'dev ropsten contracts',
      entities: [{
        name: 'storage',
        address: '0xD1a8C9a603676925fa319DCB639BC86b5036735B',
        abi: '[]',
      }, {
        name: 'payment',
        address: '0x1AB4711a76b64095D9ECA763c678b74099c943C4',
        abi: '[]',
      }, {
        name: 'owner',
        address: '0x14e0E823829Cf38038A7586824b8a22dDaddeE99',
      }, {
        name: 'admin',
        address: '0x14e0E823829Cf38038A7586824b8a22dDaddeE99',
      }],
      relations: [{
        source: 'owner',
        target: 'storage',
        setOps: 'target.transferOwnership(source)',
        validate: '',
      }, {
        source: 'owner',
        target: 'payment',
        setOps: 'target.transferOwnership(source)',
        validate: '',
      }, {
        source: 'admin',
        target: 'storage',
        setOps: 'target.setManager(source)',
        validate: '',
      }, {
        source: 'admin',
        target: 'payment',
        setOps: 'target.setManager(source)',
        validate: '',
      }, {
        source: 'payment',
        target: 'storage',
        setOps: 'target.setManager(source)',
        validate: '',
      }],
    }],
  },
];


module.exports = {
  users,
  models,
};
