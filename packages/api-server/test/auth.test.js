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
const mockUpsertGoogleUser = (id, displayName) => Promise.resolve({
  id: mockedGoogleId,
  displayName,
});

// mock database
const mockDataProvider = {
  user: {
    upsertGoogleUser: mockUpsertGoogleUser,
  },
};

describe('/auth/google', () => {
  const app = initApp(mockDataProvider);
  initPassport(mockDataProvider);

  const userProfile = {
    id: 'mongoid0123',
    displayName: 'jsmith@gmail.com',
  };

  beforeEach(() => {
    // mock google strategy
    passport.use(new MockStrategy({
      name: 'google-token',
      user: userProfile,
    }));
  });


  it('return 401 code in case of auth error', async () => {
    // mock strategy with custom callback to return user:null
    passport.use(new MockStrategy({
      name: 'google-token',
      user: userProfile,
    },
    (user, done) => {
      done('Custom error', null);
      // Perform actions on user, call done once finished
    }));

    const res = await chai.request(app).post('/auth/google');
    expect(res).to.have.status(401);
  });

  it('should save JWT token in cookies.token upon successful authentication', async () => {
    const res = await chai.request(app).post('/auth/google');
    expect(res).to.have.cookie('token');
  });
});
