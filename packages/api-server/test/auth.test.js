/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

const chai = require('chai');
const sinon = require('sinon');
const passport = require('passport');
const MockStrategy = require('passport-mock-strategy');
const initPassport = require('../auth/passport');
const { verifyToken } = require('../auth/token');
const initApp = require('../app');
const { extractCookie } = require('./utils');

chai.use(require('chai-http'));

const { expect } = chai;


describe('/auth/google', () => {
  let app;

  const mockedGoogleId = 'googleid0123';
  const mockedMongoId = 'mongoid0123';
  const userName = 'jsmith@gmail.com';
  const userProfile = {
    id: mockedGoogleId,
    displayName: userName,
  };

  let dataSource;

  before(() => {
    // mock database
    dataSource = {
      user: {
        upsertGoogleUser: sinon.stub().resolves({
          id: mockedMongoId,
          displayName: userName,
        }),
      },
    };
    app = initApp(dataSource);
    initPassport(dataSource);
  });

  describe('authentication success', () => {
    let response;
    before(async () => {
      passport.use(new MockStrategy({
        name: 'google-token',
        user: userProfile,
      }));

      response = await chai.request(app).post('/auth/google');
    });

    it('upsertGoogleUser function should have been called', () => {
      expect(dataSource.user.upsertGoogleUser.calledOnce).to.equal(true);
    });

    it('save JWT token in cookies.token', async () => {
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
    it('return code 401 in case of error in strategy', async () => {
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
