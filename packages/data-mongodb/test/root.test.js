const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');

let mongoServer;

const localDb = 'mongodb://localhost:27017/justdapps-test';

function prepareServer(useMemoryServer = true) {
  if (useMemoryServer) {
    mongoServer = new MongoMemoryServer();
    return mongoServer
      .getConnectionString();
  }
  return Promise.resolve(localDb);
}

before((done) => {
  prepareServer()
    .then((dbPath) => {
      console.log(`Connecting to memory server ${dbPath}`);
      return mongoose.connect(
        dbPath,
        {useNewUrlParser: true, useUnifiedTopology: true},
        (err) => {
          if (err) done(err);
        },
      );
    })
    .then(() => done());
});

after(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
