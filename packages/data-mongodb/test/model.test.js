const {assert, expect} = require('chai');
const {User, Model} = require('../models');
const {cleanupAndSave} = require('./testUtils');

describe('Model', () => {
  // beforeEach(async () => {
  //   await cleanupAndSave();
  // });

  describe('findByUserId', () => {
    it('should fetch all models (1) for user:test@gmail.com ', async () => {
      const user = await User.findOne({'profile.displayName': 'test@gmail.com'}).exec();
      const userId = user._id.toString();
      const models = await Model.findByUser(userId);
      expect(models).to.have.lengthOf(1);
    });
  });
});
