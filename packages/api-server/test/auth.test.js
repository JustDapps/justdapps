require('dotenv').config();

// eslint-disable-next-line import/no-extraneous-dependencies
const chai = require('chai');
const passport = require('passport');
const MockStrategy = require('passport-mock-strategy');
const initPassport = require('../auth/passport');
const {createToken, verifyToken} = require('../auth/token');
const initApp = require('../app');
const {extractCookie} = require('./utils');

chai.use(require('chai-http'));

const {expect} = chai;

// mock database
const mockedGoogleId = 'googleid0123';
const mockedMongoId = 'mongoid0123';
const mockUpsertGoogleUser = (id, displayName) => Promise.resolve({
  id: mockedMongoId,
  displayName,
});

const mockDataProvider = {
  user: {
    upsertGoogleUser: mockUpsertGoogleUser,
  },
};


describe('/auth/google', () => {
  const app = initApp(mockDataProvider);
  initPassport(mockDataProvider);

  const userProfile = {
    id: mockedGoogleId,
    displayName: 'jsmith@gmail.com',
  };

  describe('authentication success', () => {
    let response;
    before(async () => {
      passport.use(new MockStrategy({
        name: 'google-token',
        user: userProfile,
      }));

      response = await chai.request(app).post('/auth/google');
    });

    it('should save JWT token in cookies.token with userId and return displayName in response bdy ', async () => {
      expect(response).to.have.cookie('token');
    });
    it('decoded cookie should contain userId property equal to database id', () => {
      const token = extractCookie(response, 'token');
      const decoded = verifyToken(token);
      expect(decoded.userId).to.equal(mockedMongoId);
    });
    it('response body should contain displayName property equal to user email', () => {
      expect(response.body.displayName).to.equal(userProfile.displayName);
    });
  });

  describe('authentication failure', () => {
    it('return 401 code in case of error in strategy', async () => {
      // mock strategy with custom callback to return user:null
      passport.use(new MockStrategy({
        name: 'google-token',
        user: userProfile,
      },
      (user, done) => {
        done(null, null, 'Additional info');
      }));

      const res = await chai.request(app).post('/auth/google');

      expect(res).to.have.status(401);
    });
  });
});