const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { User, Model } = require('../models');
const {
  getTotalUsers, cleanup, addGoogleUsers, addModelsForUser,
} = require('./testUtils');
const db = require('../index.js');


chai.use(chaiAsPromised);
const { expect } = chai;


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
  let user1Models;
  let user2Models;

  console.log('Setup for tests');
  console.log('user1: [model1, model2]');
  console.log('user2: [model3]');
  console.log('user3: []');

  beforeEach(async () => {
    await cleanup();
    userIds = await addGoogleUsers(['user1', 'user2', 'user3']);
    user1Models = await addModelsForUser([{ name: 'model1' }, { name: 'model2' }], 'user1');
    user2Models = await addModelsForUser([{ name: 'model3' }], 'user2');
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
    it('should add new model for user1 and return its id as string', async () => {
      const { length: beforeCount } = await Model.findByUser(userIds.user1);

      const id = await db.model.addForUser({ name: '1', description: '2' }, userIds.user1);

      const { length: afterCount } = await Model.findByUser(userIds.user1);
      expect(afterCount - beforeCount).to.equal(1);
      expect(id).to.be.a('string').and.not.empty;
    });
  });

  describe('checkOwner', () => {
    let modelId;
    beforeEach(async () => {
      modelId = await db.model.addForUser({ name: 'test-checkOwner' }, userIds.user1);
    });

    it('should check if user1 is owner of model1 and return true', async () => {
      const check = await db.model.checkOwner(userIds.user1, modelId);
      expect(check).to.equal(true);
    });

    it('should check if user3 is owner of model3 and return false', async () => {
      const check = await db.model.checkOwner(userIds.user3, modelId);
      expect(check).to.equal(false);
    });

    it('should check if user3 is owner of user1 (non-model id) and throw', async () => {
      expect(db.model.checkOwner(userIds.user3, userIds.user1)).to.eventually.be.rejected;
    });
  });

  describe('delete', () => {
    it('should delete model specified by its id and return true', async () => {
      const id = await db.model.addForUser({ name: '1', description: '2' }, userIds.user3);
      const { length: beforeCount } = await Model.findByUser(userIds.user3);

      const result = await db.model.delete(id);

      const { length: afterCount } = await Model.findByUser(userIds.user3);
      expect(beforeCount - afterCount).to.equal(1);
      expect(result).to.equal(true);
    });

    it('should change nothing if model id does not exist, return false', async () => {
      const { length: beforeCount } = await Model.find({});

      const result = await db.model.delete(userIds.user1);

      const { length: afterCount } = await Model.find({});
      expect(beforeCount).to.equal(afterCount);
      expect(result).to.equal(false);
    });

    it('should throw error if invalid id provided', async () => expect(db.model.delete('012345')).to.eventually.be.rejected);
  });

  describe('update', () => {
    it('should update model1 with new description and return true', async () => {
      const id = user1Models.model1;
      const description = 'Updated description';

      const result = await db.model.update({ description }, user1Models.model1);

      const model = await Model.findOne({ _id: id });
      expect(model.description).to.equal(description);
      expect(model.name).to.equal('model1');
      expect(result).to.equal(true);
    });

    it('should throw error if invalid id provided', async () => {
      expect(db.model.update({ description: '' }, 'INVALID_ID')).to.eventually.be.rejected;
    });

    it('should change nothing if model id does not exist, return false', async () => {
      const result = await db.model.update({ description: '' }, userIds.user1);
      expect(result).to.equal(false);
    });
  });
});
