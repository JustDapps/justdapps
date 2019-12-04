const sinon = require('sinon');

before(() => {
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  // Restore the default sandbox here
  sinon.restore();
});
