const {expect} = require('chai');
const {User, Model} = require('../models');
const {
  getTotalUsers, cleanup, addGoogleUsers, addModelsForUser,
} = require('./testUtils');

describe('User', () => {
  beforeEach(async () => {
    cleanup();
  });

  describe('upsertGoogleUser', () => {
    const userName = 'user1@gmail.com';

    it(`should add new user: ${userName}`, async () => {
      const beforeCount = await getTotalUsers();

      await User.upsertGoogleUser('googleid1', userName);

      const afterCount = await getTotalUsers();
      expect(afterCount - beforeCount).to.equal(1);
    });

    it(`shouldn't add duplicate user ${userName}`, async () => {
      const firstTimeData = await User.upsertGoogleUser('googleid1', userName);
      const beforeCount = await getTotalUsers();

      const secondTimeData = await User.upsertGoogleUser('googleid1', userName);

      const afterCount = await getTotalUsers();
      expect(afterCount).to.equal(beforeCount);
      expect(firstTimeData.id).to.equal(secondTimeData.id);
    });
  });
});

describe.only('Model', () => {
  let userIds;
  beforeEach(async () => {
    await cleanup();
    userIds = await addGoogleUsers(['user1', 'user2']);
    await addModelsForUser([{name: 'model1'}, {name: 'model2'}], 'user1');
  });

  describe('findByUser', () => {
    it('should fetch all models (2) for user1 ', async () => {
      const models = await Model.findByUser(userIds[0]);
      expect(models).to.have.lengthOf(2);
    });
    it('should fetch no models for user2', async () => {
      const models = await Model.findByUser(userIds[1]);
      expect(models).to.have.lengthOf(0);
    });
  });

  describe('addForUser', () => {
    it('should add new model for user1', async () => {
      const {length: beforeCount} = await Model.findByUser(userIds[0]);

      await Model.addForUser({name: '1', description: '2'}, userIds[0]);

      const {length: afterCount} = await Model.findByUser(userIds[0]);
      expect(afterCount - beforeCount).to.equal(1);
    });
  });
});
