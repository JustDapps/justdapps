const {expect} = require('chai');
const {User, Model} = require('../models');
const {
  getTotalUsers, cleanup, addGoogleUsers, addModelsForUser,
} = require('./testUtils');
const db = require('../index.js');


describe('db.user', () => {
  beforeEach(async () => {
    cleanup();
  });

  describe('upsertGoogleUser', () => {
    const userName = 'user1@gmail.com';

    it(`should add new user: ${userName}`, async () => {
      const beforeCount = await getTotalUsers();

      await db.user.upsertGoogleUser('googleid1', userName);

      const afterCount = await getTotalUsers();
      expect(afterCount - beforeCount).to.equal(1);
    });

    it(`shouldn't add duplicate user ${userName}`, async () => {
      const firstTimeData = await User.upsertGoogleUser('googleid1', userName);
      const beforeCount = await getTotalUsers();

      const secondTimeData = await db.user.upsertGoogleUser('googleid1', userName);

      const afterCount = await getTotalUsers();
      expect(afterCount).to.equal(beforeCount);
      expect(firstTimeData.id).to.equal(secondTimeData.id);
    });
  });
});


describe('db.model', () => {
  let userIds;
  beforeEach(async () => {
    await cleanup();
    userIds = await addGoogleUsers(['user1', 'user2', 'user3']);
    await addModelsForUser([{name: 'model1'}, {name: 'model2'}], 'user1');
    await addModelsForUser([{name: 'model3'}], 'user2');
  });

  describe('findByUser', () => {
    it('should fetch all models (2) for user1 ', async () => {
      const models = await db.model.findByUser(userIds.user1);
      expect(models).to.have.lengthOf(2);
      expect(models.map((model) => model.name)).to.include('model1').and.include('model2');
    });
    it('should fetch no models for user3', async () => {
      const models = await db.model.findByUser(userIds.user3);
      expect(models).to.have.lengthOf(0);
    });
  });

  describe('addForUser', () => {
    it('should add new model for user1', async () => {
      const {length: beforeCount} = await Model.findByUser(userIds.user1);

      await db.model.addForUser({name: '1', description: '2'}, userIds.user1);

      const {length: afterCount} = await Model.findByUser(userIds.user1);
      expect(afterCount - beforeCount).to.equal(1);
    });

    it('should return new model id as string', async () => {
      const id = await db.model.addForUser({name: '1', description: '2'}, userIds.user1);
      expect(id).to.be.a('string').and.not.empty;
    });
  });

  describe('delete', () => {
    it('should delete model specified by its id', async () => {
      const id = await db.model.addForUser({name: '1', description: '2'}, userIds.user3);
      const {length: beforeCount} = await Model.findByUser(userIds.user3);

      await db.model.delete(id);

      const {length: afterCount} = await Model.findByUser(userIds.user3);
      expect(beforeCount - afterCount).to.equal(1);
    });
  });
});
