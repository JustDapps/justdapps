require('dotenv').config();
// eslint-disable-next-line import/no-extraneous-dependencies
const chai = require('chai');

const passport = require('passport');
const MockStrategy = require('passport-mock-strategy');
const initPassport = require('../auth/passport');

chai.use(require('chai-http'));
const initApp = require('../app');

const {expect} = chai;

const mockedGoogleId = '0123456778abc';
const mockUpsertGoogleUser = (id, displayName) => Promise.resolve({id: mockedGoogleId, displayName});

// mock database
const mockDataProvider = {
  user: {
    upsertGoogleUser: mockDataProvider,
  },
};

describe('/auth', () => {
  const app = initApp(mockDataProvider);

  const userProfile = {
    id: 'google-0123456789',
    name: 'John Smith',
    emails: [{value: 'jsmith@gmail.com'}],
  };

  before((hookDone) => {
    // mock google strategy
    passport.use(new MockStrategy({
      name: 'google-token',
      user: userProfile,
    }, (user, done) => initPassport.googleAuthCallback(mockDataProvider, user, done)));
  });


  it('should save valid google token bearer, with displayName=e-mail and authProvider=Google', () => {
    expect(1).equal(1);
  });

  it('in case of invalid token should return 401 error', () => {

  });
});
