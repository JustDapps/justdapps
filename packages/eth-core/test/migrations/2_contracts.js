const fs = require('fs');

const Storage = artifacts.require('Storage');
const Manager = artifacts.require('Manager');

let storage;
let manager;

const initialData = 5;

module.exports = function (deployer, network, accounts) {
  deployer.deploy(Storage, initialData)
    .then(() => Storage.deployed())
    .then((storageInstance) => {
      storage = storageInstance;
      return storage;
    })
    .then(() => deployer.deploy(Manager, storage.address))
    .then((managerInstance) => {
      manager = managerInstance;
      return manager;
    })
    .then(() => storage.setManager(manager.address, true))
    .then(() => storage.setManager(accounts[1], true))
    .then(() => {
      fs.writeFileSync(
        './migrations.json',
        JSON.stringify({
          params: {
            initialData,
            owner: accounts[0],
            admin: accounts[1],
          },
          contracts: {
            storage: {
              address: storage.address,
              abi: storage.abi,
            },
            manager: {
              address: manager.address,
              abi: manager.abi,
            },
          },
        },
        null,
        '\t'),
      );
    });
};
