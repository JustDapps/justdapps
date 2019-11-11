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
    version: '1',
    account: 'test@gmail.com', // will be converted to MongoDb ObjectID
    entities: [{
      name: 'storage',
      abi: [],
    }, {
      name: 'payment',
      abi: [],
    }, {
      name: 'owner',
    }, {
      name: 'admin',
    }],
    relations: [{
      source: 'owner',
      target: 'storage',
      set: 'target.transferOwnership(source)',
      validate: '',
    }, {
      source: 'owner',
      target: 'payment',
      set: 'target.transferOwnership(source)',
      validate: '',
    }, {
      source: 'admin',
      target: 'storage',
      set: 'target.setManager(source)',
      validate: '',
    }, {
      source: 'admin',
      target: 'payment',
      set: 'target.setManager(source)',
      validate: '',
    }, {
      source: 'payment',
      target: 'storage',
      set: 'target.setManager(source)',
      validate: '',
    }],
  },
];

const dapps = [{
  desciption: 'dev contracts',
  networkId: '3',
  version: 'bcshop-1', // will be converted to MongoDB ObjectID
  addresses: {
    owner: '0x14e0E823829Cf38038A7586824b8a22dDaddeE99',
    admin: '0x14e0E823829Cf38038A7586824b8a22dDaddeE99',
    storage: '0xD1a8C9a603676925fa319DCB639BC86b5036735B',
    payment: '0x1AB4711a76b64095D9ECA763c678b74099c943C4',
  },
}];

module.exports = {
  users,
  models,
  dapps,
};
